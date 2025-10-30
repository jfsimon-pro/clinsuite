import { Injectable, Logger } from '@nestjs/common';
import { create, Whatsapp, Message } from 'venom-bot';
import * as QRCode from 'qrcode';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsAppStatus } from '@prisma/client';

@Injectable()
export class VenomService {
  private readonly logger = new Logger(VenomService.name);
  private sessions = new Map<string, Whatsapp>();

  constructor(private prisma: PrismaService) {}

  async createSession(connectionId: string, sessionName: string): Promise<string> {
    try {
      this.logger.log(`Criando sessão VenomBot: ${sessionName}`);

      // Verificar se já existe uma sessão
      if (this.sessions.has(connectionId)) {
        this.logger.log(`Sessão já existe para ${connectionId}, reutilizando...`);
        return sessionName;
      }

      // Configuração do VenomBot com QR Code
      const session = await create(sessionName);

      this.sessions.set(connectionId, session);
      
      // Configurar eventos
      session.onMessage((message) => this.handleIncomingMessage(connectionId, message));
      session.onStateChange((state) => this.handleStateChange(connectionId, state));
      
      this.logger.log(`Sessão VenomBot criada com sucesso: ${sessionName}`);
      return sessionName;
    } catch (error) {
      this.logger.error(`Erro ao criar sessão: ${error.message}`);
      throw error;
    }
  }

  async getQRCode(connectionId: string): Promise<string> {
    this.logger.log(`Buscando QR Code para conexão: ${connectionId}`);
    
    try {
      // Limpar QR Code simulado anterior
      await this.prisma.whatsAppConnection.update({
        where: { id: connectionId },
        data: { qrCode: null }
      });

      // Gerar QR Code simulado temporário enquanto VenomBot inicializa
      this.logger.log(`Gerando QR Code simulado temporário para conexão: ${connectionId}`);
      const qrData = `whatsapp://connect?session=${connectionId}&timestamp=${Date.now()}`;
      
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 256
      });
      
      this.logger.log(`QR Code simulado temporário gerado para conexão: ${connectionId}`);
      return qrCodeDataUrl;
    } catch (error) {
      this.logger.error(`Erro ao buscar QR Code: ${error.message}`);
      throw error;
    }
  }

  async sendMessage(connectionId: string, to: string, content: string) {
    const session = this.sessions.get(connectionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    try {
      const result = await session.sendText(to, content);
      this.logger.log(`Mensagem enviada para ${to}: ${content}`);
      return result;
    } catch (error) {
      this.logger.error(`Erro ao enviar mensagem: ${error.message}`);
      throw error;
    }
  }

  async getChats(connectionId: string) {
    const session = this.sessions.get(connectionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    try {
      const chats = await session.getAllChats();
      const individualChats = chats.filter(chat => !chat.isGroup);
      
      this.logger.log(`Encontrados ${individualChats.length} chats individuais`);
      return individualChats;
    } catch (error) {
      this.logger.error(`Erro ao buscar chats: ${error.message}`);
      throw error;
    }
  }

  async getChatMessages(connectionId: string, chatId: string) {
    const session = this.sessions.get(connectionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    try {
      const messages = await session.getAllMessagesInChat(chatId, true, false);
      this.logger.log(`Encontradas ${messages.length} mensagens no chat ${chatId}`);
      return messages;
    } catch (error) {
      this.logger.error(`Erro ao buscar mensagens: ${error.message}`);
      throw error;
    }
  }

  async disconnectSession(connectionId: string) {
    const session = this.sessions.get(connectionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    try {
      await session.close();
      this.sessions.delete(connectionId);
      await this.updateConnectionStatus(connectionId, 'DISCONNECTED');
      this.logger.log(`Sessão desconectada: ${connectionId}`);
    } catch (error) {
      this.logger.error(`Erro ao desconectar sessão: ${error.message}`);
      throw error;
    }
  }

  private async handleIncomingMessage(connectionId: string, message: Message) {
    try {
      this.logger.log(`Nova mensagem em ${connectionId}: ${message.content}`);

      // Verificar se é uma conversa individual (não grupo)
      if (message.isGroupMsg) {
        return; // Ignorar mensagens de grupo
      }

      // Buscar ou criar chat no banco
      let chat = await this.prisma.whatsAppChat.findFirst({
        where: {
          connectionId,
          contactId: message.from,
        },
      });

      if (!chat) {
        // Criar novo chat
        chat = await this.prisma.whatsAppChat.create({
          data: {
            connectionId,
            contactId: message.from,
            contactName: message.author || message.from,
            contactPhone: message.from,
            isGroup: false,
            lastMessage: message.content,
            lastMessageTime: new Date(),
            unreadCount: 1,
          },
        });
      } else {
        // Atualizar chat existente
        await this.prisma.whatsAppChat.update({
          where: { id: chat.id },
          data: {
            lastMessage: message.content,
            lastMessageTime: new Date(),
            unreadCount: chat.unreadCount + 1,
          },
        });
      }

      // Salvar mensagem no banco
      await this.prisma.whatsAppMessage.create({
        data: {
          connectionId,
          chatId: chat.id,
          messageId: typeof message.id === 'string' ? message.id : `msg_${Date.now()}`,
          content: message.content,
          type: this.mapMessageType(message.type),
          fromMe: false,
          timestamp: new Date(message.timestamp * 1000),
          status: 'DELIVERED',
        },
      });

      // TODO: Emitir evento via WebSocket
      // this.whatsAppGateway.emitMessageToCompany(companyId, 'new-message', message);

    } catch (error) {
      this.logger.error(`Erro ao processar mensagem: ${error.message}`);
    }
  }

  private async handleStateChange(connectionId: string, state: string) {
    try {
      this.logger.log(`Estado alterado em ${connectionId}: ${state}`);
      
      let status: WhatsAppStatus;
      switch (state) {
        case 'qrReadSuccess':
        case 'ready':
          status = 'CONNECTED';
          break;
        case 'disconnected':
          status = 'DISCONNECTED';
          break;
        case 'qrReadFail':
        case 'error':
          status = 'ERROR';
          break;
        default:
          status = 'CONNECTING';
      }

      await this.updateConnectionStatus(connectionId, status);
    } catch (error) {
      this.logger.error(`Erro ao atualizar status: ${error.message}`);
    }
  }

  private async updateConnectionStatus(connectionId: string, status: WhatsAppStatus) {
    try {
      await this.prisma.whatsAppConnection.update({
        where: { id: connectionId },
        data: { 
          status,
          lastSeen: status === 'CONNECTED' ? new Date() : null,
        },
      });
    } catch (error) {
      this.logger.error(`Erro ao atualizar status da conexão: ${error.message}`);
    }
  }

  private async updateConnectionQRCode(connectionId: string, qrCode: string) {
    try {
      // Converter QR Code para data URL
      const qrCodeDataUrl = await QRCode.toDataURL(qrCode, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 256
      });
      
      await this.prisma.whatsAppConnection.update({
        where: { id: connectionId },
        data: { qrCode: qrCodeDataUrl },
      });
      this.logger.log(`QR Code real atualizado para conexão: ${connectionId}`);
    } catch (error) {
      this.logger.error(`Erro ao atualizar QR Code: ${error.message}`);
    }
  }

  async getRealQRCode(connectionId: string): Promise<string | null> {
    try {
      const session = this.sessions.get(connectionId);
      if (!session) {
        this.logger.log(`Sessão não encontrada para ${connectionId}`);
        return null;
      }

      // Tentar obter QR Code real do VenomBot
      const qrCode = await session.getQrCode();
      if (qrCode && qrCode.base64Image) {
        this.logger.log(`QR Code real obtido do VenomBot para ${connectionId}`);
        await this.updateConnectionQRCode(connectionId, qrCode.base64Image);
        return qrCode.base64Image;
      }

      return null;
    } catch (error) {
      this.logger.error(`Erro ao obter QR Code real: ${error.message}`);
      return null;
    }
  }

  private mapMessageType(venomType: string): 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT' | 'LOCATION' | 'CONTACT' {
    switch (venomType) {
      case 'image':
        return 'IMAGE';
      case 'audio':
        return 'AUDIO';
      case 'video':
        return 'VIDEO';
      case 'document':
        return 'DOCUMENT';
      case 'location':
        return 'LOCATION';
      case 'contact':
        return 'CONTACT';
      default:
        return 'TEXT';
    }
  }

  // Método para verificar se uma sessão está ativa
  isSessionActive(connectionId: string): boolean {
    return this.sessions.has(connectionId);
  }

  // Método para listar todas as sessões ativas
  getActiveSessions(): string[] {
    return Array.from(this.sessions.keys());
  }
}
