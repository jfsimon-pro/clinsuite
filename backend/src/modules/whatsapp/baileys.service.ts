import { Injectable, Logger } from '@nestjs/common';
import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, WASocket } from '@whiskeysockets/baileys';
import * as QRCode from 'qrcode';
import Pino from 'pino';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';

const DEFAULT_FUNNEL_NAME = 'Novos Contatos';
const DEFAULT_STEP_NAME = 'Novas Entradas';

@Injectable()
export class BaileysService {
  private readonly logger = new Logger(BaileysService.name);
  private readonly connections = new Map<string, WASocket>();

  constructor(private readonly prisma: PrismaService) {}

  async ensureConnection(connectionId: string) {
    if (this.connections.has(connectionId)) return this.connections.get(connectionId)!;

    const authPath = `./baileys-auth/${connectionId}`;
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: state,
      logger: Pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: ['IanaraERP','Chrome','1.0.0'],
      markOnlineOnConnect: false,
      syncFullHistory: false,
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
      // sempre que houver novo QR, persistimos para o front pegar via polling
      if (qr) {
        try {
          const dataUrl = await QRCode.toDataURL(qr, { errorCorrectionLevel: 'M', margin: 1, width: 256 });
          await this.updateQRCode(connectionId, dataUrl);
          await this.updateStatus(connectionId, 'CONNECTING');
        } catch (err) {
          this.logger.warn(`failed to persist QR for ${connectionId}: ${(err as Error).message}`);
        }
      }
      if (connection === 'close') {
        const reason = (lastDisconnect?.error as any)?.output?.statusCode;
        this.logger.warn(`Baileys connection closed (${connectionId}) reason=${reason}`);
        this.connections.delete(connectionId);
        // 515 (restart required) é comum logo após escanear o QR; reabrimos automaticamente
        if (reason === 515) {
          try {
            await this.updateStatus(connectionId, 'CONNECTING');
            // não limpa auth; apenas recria o socket
            setTimeout(() => this.ensureConnection(connectionId).catch(() => {}), 500);
            return;
          } catch {}
        }
        await this.updateStatus(connectionId, 'DISCONNECTED');
      } else if (connection === 'open') {
        this.logger.log(`Baileys connected (${connectionId})`);
        await this.updateStatus(connectionId, 'CONNECTED');
      } else {
        await this.updateStatus(connectionId, 'CONNECTING');
      }
    });

    // Logar e persistir apenas mensagens recebidas de texto (ignorar grupos e saídas)
    sock.ev.on('messages.upsert', async ({ messages }) => {
      for (const msg of messages) {
        try {
          const remoteJid = msg.key.remoteJid || '';
          const isGroup = remoteJid.endsWith('@g.us');
          const fromMe = !!msg.key.fromMe;
          if (isGroup || fromMe) continue;
          const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
          if (!text) continue;

          // Log
          this.logger.log(`[${connectionId}] RECV ${remoteJid}: ${text}`);

          // Persistir chat e mensagem
          const contactId = remoteJid.split('@')[0] || remoteJid;
          const contactPhone = contactId;
          const contactName = (msg.pushName as string) || contactPhone;
          const tsSec = Number((msg.messageTimestamp as any) || Date.now() / 1000);
          const ts = new Date(tsSec * 1000);

          // Upsert chat
          let chat = await this.prisma.whatsAppChat.findFirst({
            where: { connectionId, contactId }
          });
          if (!chat) {
            chat = await this.prisma.whatsAppChat.create({
              data: {
                connectionId,
                contactId,
                contactName,
                contactPhone,
                isGroup: false,
                lastMessage: text,
                lastMessageTime: ts,
                unreadCount: 1,
              },
            });
          } else {
            await this.prisma.whatsAppChat.update({
              where: { id: chat.id },
              data: {
                contactName: chat.contactName || contactName,
                lastMessage: text,
                lastMessageTime: ts,
                unreadCount: (chat.unreadCount || 0) + 1,
              },
            });
          }

          // Save message
          await this.prisma.whatsAppMessage.create({
            data: {
              connectionId,
              chatId: chat.id,
              messageId: msg.key.id || `msg_${Date.now()}`,
              content: text,
              type: 'TEXT',
              fromMe: false,
              timestamp: ts,
              status: 'DELIVERED',
            },
          });

          // Criar Lead automaticamente no funil padrão, sem duplicar
          try {
            const conn = await this.prisma.whatsAppConnection.findFirst({
              where: { id: connectionId },
              select: { companyId: true },
            });
            if (!conn) continue;
            const companyId = conn.companyId;

            // Verifica se já existe lead com o telefone
            const existingLead = await this.prisma.lead.findFirst({
              where: { companyId, phone: contactPhone },
              select: { id: true },
            });
            if (existingLead) continue;

            // Garante funil e etapa padrão
            let funnel = await this.prisma.funnel.findFirst({ where: { companyId, name: DEFAULT_FUNNEL_NAME } });
            if (!funnel) {
              funnel = await this.prisma.funnel.create({ data: { name: DEFAULT_FUNNEL_NAME, companyId } });
            }
            let step = await this.prisma.funnelStep.findFirst({ where: { funnelId: funnel.id, order: 1 } });
            if (!step) {
              step = await this.prisma.funnelStep.create({ data: { name: DEFAULT_STEP_NAME, order: 1, funnelId: funnel.id } });
            }

            // Cria lead
            await this.prisma.lead.create({
              data: {
                phone: contactPhone,
                name: contactName,
                funnelId: funnel.id,
                stepId: step.id,
                companyId,
              },
            });
          } catch (e) {
            this.logger.warn(`auto-lead create failed (${connectionId}): ${(e as Error).message}`);
          }
        } catch (e) {
          this.logger.warn(`message persist error (${connectionId}): ${(e as Error).message}`);
        }
      }
    });

    this.connections.set(connectionId, sock);
    return sock;
  }

  async getQRCode(connectionId: string): Promise<string> {
    // Limpar credenciais antigas para evitar 401 ao parear
    const authPath = `./baileys-auth/${connectionId}`;
    try { fs.rmSync(authPath, { recursive: true, force: true }); } catch {}
    const sock = await this.ensureConnection(connectionId);

    // Baileys emite QR via event connection.update → qr
    const qr = await new Promise<string>((resolve, reject) => {
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) reject(new Error('QR timeout'));
      }, 60000);

      sock.ev.on('connection.update', async (u) => {
        if (u.qr && !resolved) {
          resolved = true;
          clearTimeout(timeout);
          // converter para dataURL para o front
          const dataUrl = await QRCode.toDataURL(u.qr, { errorCorrectionLevel: 'M', margin: 1, width: 256 });
          resolve(dataUrl);
        }
      });
    });

    await this.updateQRCode(connectionId, qr);
    await this.updateStatus(connectionId, 'CONNECTING');
    return qr;
  }

  async sendMessage(connectionId: string, to: string, content: string) {
    const sock = await this.ensureConnection(connectionId);
    const jid = to.includes('@') ? to : `${to}@s.whatsapp.net`;
    return sock.sendMessage(jid, { text: content });
  }

  private async updateStatus(connectionId: string, status: 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'ERROR') {
    try {
      await this.prisma.whatsAppConnection.update({ where: { id: connectionId }, data: { status } });
    } catch (e) {
      this.logger.warn(`updateStatus failed for ${connectionId}: ${e.message}`);
    }
  }

  private async updateQRCode(connectionId: string, qrCode: string) {
    try {
      await this.prisma.whatsAppConnection.update({ where: { id: connectionId }, data: { qrCode } });
    } catch (e) {
      this.logger.warn(`updateQRCode failed for ${connectionId}: ${e.message}`);
    }
  }

  async getPairingCode(connectionId: string, phoneNumberWithCountryCode: string): Promise<string> {
    // Limpa credenciais para iniciar fluxo de pareamento do zero
    const authPath = `./baileys-auth/${connectionId}`;
    try { fs.rmSync(authPath, { recursive: true, force: true }); } catch {}

    const sock = await this.ensureConnection(connectionId);
    await this.updateStatus(connectionId, 'CONNECTING');

    const code = await sock.requestPairingCode(phoneNumberWithCountryCode);
    return code; // código no formato 000-000
  }

  async resetConnection(connectionId: string): Promise<void> {
    try {
      const sock = this.connections.get(connectionId);
      if (sock) {
        try { await sock.logout(); } catch {}
        try { sock.ws?.close(); } catch {}
      }
      this.connections.delete(connectionId);

      const authPath = `./baileys-auth/${connectionId}`;
      try { fs.rmSync(authPath, { recursive: true, force: true }); } catch {}

      await this.prisma.whatsAppConnection.update({
        where: { id: connectionId },
        data: { status: 'DISCONNECTED', qrCode: null, sessionId: null },
      });
    } catch (e) {
      this.logger.warn(`resetConnection failed for ${connectionId}: ${e.message}`);
      throw e;
    }
  }
}


