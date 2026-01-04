import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BaileysService } from './baileys.service';
import { CreateWhatsAppConnectionDto } from './dto/create-whatsapp-connection.dto';
import { WhatsAppStatus } from '@prisma/client';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private prisma: PrismaService,
    private baileysService: BaileysService,
  ) { }

  async createConnection(companyId: string, dto: CreateWhatsAppConnectionDto) {
    return this.prisma.whatsAppConnection.create({
      data: {
        name: dto.name,
        companyId,
        status: WhatsAppStatus.DISCONNECTED,
      },
    });
  }

  async getConnections(companyId: string) {
    return this.prisma.whatsAppConnection.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getConnection(id: string, companyId: string) {
    return this.prisma.whatsAppConnection.findFirst({
      where: { id, companyId },
      include: {
        chats: {
          orderBy: { updatedAt: 'desc' },
          take: 50,
        },
      },
    });
  }

  async connectWhatsApp(connectionId: string, companyId: string) {
    const connection = await this.prisma.whatsAppConnection.findFirst({
      where: { id: connectionId, companyId },
    });

    if (!connection) {
      throw new Error('Conexão não encontrada');
    }

    if (connection.status === WhatsAppStatus.CONNECTED) {
      throw new Error('WhatsApp já está conectado');
    }

    // Atualizar status para conectando
    await this.prisma.whatsAppConnection.update({
      where: { id: connectionId },
      data: { status: WhatsAppStatus.CONNECTING },
    });

    try {
      this.logger.log(`Iniciando conexão WhatsApp para: ${connection.name}`);

      // Gerar QR Code via Baileys (mais estável)
      const qrCode = await this.baileysService.getQRCode(connectionId);

      await this.prisma.whatsAppConnection.update({
        where: { id: connectionId },
        data: {
          qrCode,
          status: WhatsAppStatus.CONNECTING,
        },
      });

      // Iniciar sessão Baileys em background (mantém estável)
      this.baileysService.ensureConnection(connectionId).catch(error => {
        this.logger.error(`Erro ao iniciar Baileys: ${error.message}`);
      });

      return { qrCode, status: WhatsAppStatus.CONNECTING };
    } catch (error) {
      await this.prisma.whatsAppConnection.update({
        where: { id: connectionId },
        data: { status: WhatsAppStatus.ERROR },
      });
      throw error;
    }
  }

  async disconnectWhatsApp(connectionId: string, companyId: string) {
    const connection = await this.prisma.whatsAppConnection.findFirst({
      where: { id: connectionId, companyId },
    });

    if (!connection) {
      throw new Error('Conexão não encontrada');
    }

    this.logger.log(`Desconectando WhatsApp: ${connection.name}`);

    // Encerrar totalmente a sessão Baileys e limpar arquivos de autenticação
    await this.baileysService.resetConnection(connectionId);

    return this.prisma.whatsAppConnection.update({
      where: { id: connectionId },
      data: {
        status: WhatsAppStatus.DISCONNECTED,
        qrCode: null,
        sessionId: null,
      },
    });
  }

  async getChats(connectionId: string, companyId: string) {
    const connection = await this.prisma.whatsAppConnection.findFirst({
      where: { id: connectionId, companyId },
    });

    if (!connection) {
      throw new Error('Conexão não encontrada');
    }

    return this.prisma.whatsAppChat.findMany({
      where: {
        connectionId,
        isGroup: false, // Apenas conversas individuais
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getMessages(chatId: string, companyId: string) {
    const chat = await this.prisma.whatsAppChat.findFirst({
      where: { id: chatId },
      include: { connection: true },
    });

    if (!chat || chat.connection.companyId !== companyId) {
      throw new Error('Chat não encontrado');
    }

    return this.prisma.whatsAppMessage.findMany({
      where: { chatId },
      orderBy: { timestamp: 'asc' },
      take: 100,
    });
  }

  async sendMessage(chatId: string, content: string, companyId: string) {
    const chat = await this.prisma.whatsAppChat.findFirst({
      where: { id: chatId },
      include: { connection: true },
    });

    if (!chat || chat.connection.companyId !== companyId) {
      throw new Error('Chat não encontrado');
    }

    this.logger.log(`Enviando mensagem para ${chat.contactName}: ${content}`);

    // Enviar mensagem via Baileys
    await this.baileysService.sendMessage(chat.connectionId, chat.contactPhone, content);

    const message = await this.prisma.whatsAppMessage.create({
      data: {
        connectionId: chat.connectionId,
        chatId,
        messageId: `msg_${Date.now()}`,
        content,
        type: 'TEXT',
        fromMe: true,
        timestamp: new Date(),
        status: 'SENT',
      },
    });

    // Atualizar última mensagem do chat
    await this.prisma.whatsAppChat.update({
      where: { id: chatId },
      data: {
        lastMessage: content,
        lastMessageTime: new Date(),
      },
    });

    return message;
  }

  // TODO: Implementar sincronização de chats usando Baileys
  // Por enquanto, os chats são sincronizados automaticamente quando mensagens chegam
  async syncChats(connectionId: string, companyId: string) {
    const connection = await this.prisma.whatsAppConnection.findFirst({
      where: { id: connectionId, companyId },
    });

    if (!connection) {
      throw new Error('Conexão não encontrada');
    }

    // Baileys sincroniza chats automaticamente via eventos
    // Esta função agora apenas retorna os chats existentes no banco
    const chats = await this.prisma.whatsAppChat.findMany({
      where: { connectionId },
      orderBy: { updatedAt: 'desc' },
    });

    this.logger.log(`Encontrados ${chats.length} chats para conexão ${connectionId}`);
    return chats;
  }

  // Método para verificar status da conexão
  async checkConnectionStatus(connectionId: string, companyId: string) {
    const connection = await this.prisma.whatsAppConnection.findFirst({
      where: { id: connectionId, companyId },
    });

    if (!connection) {
      throw new Error('Conexão não encontrada');
    }

    // TODO: Implementar verificação real com VenomBot
    return {
      id: connection.id,
      status: connection.status,
      lastSeen: connection.lastSeen,
    };
  }

  async getRealQRCode(connectionId: string): Promise<string | null> {
    // Desativado: agora o QR é gerenciado pelo Baileys e persistido no banco
    return null;
  }

  async getPairingCode(connectionId: string, phone: string) {
    return this.baileysService.getPairingCode(connectionId, phone);
  }

  async resetConnection(connectionId: string) {
    return this.baileysService.resetConnection(connectionId);
  }
}
