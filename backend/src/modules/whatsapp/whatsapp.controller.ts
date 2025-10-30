import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { WhatsAppService } from './whatsapp.service';
import { CreateWhatsAppConnectionDto } from './dto/create-whatsapp-connection.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('whatsapp')
@UseGuards(JwtAuthGuard)
export class WhatsAppController {
  constructor(private readonly whatsAppService: WhatsAppService) {}

  @Get('test-qr')
  @Public()
  async testQR() {
    try {
      const companies = await this.whatsAppService['prisma'].company.findMany();
      const companyId = companies.length > 0 ? companies[0].id : 'default-company-id';
      const testConnection = await this.whatsAppService.createConnection(companyId, { name: 'Test Connection' });
      const result = await this.whatsAppService.connectWhatsApp(testConnection.id, companyId);
      return { success: true, connection: testConnection, qrCode: result.qrCode, status: result.status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Post('connections')
  async createConnection(@Request() req, @Body() dto: CreateWhatsAppConnectionDto) {
    try {
      const companyId = req.user.companyId;
      return await this.whatsAppService.createConnection(companyId, dto);
    } catch (error) {
      throw new HttpException(error.message || 'Erro ao criar conexão', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('connections')
  async getConnections(@Request() req) {
    try {
      const companyId = req.user.companyId;
      return await this.whatsAppService.getConnections(companyId);
    } catch (error) {
      throw new HttpException(error.message || 'Erro ao buscar conexões', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('connections/:id')
  async getConnection(@Request() req, @Param('id') id: string) {
    try {
      const companyId = req.user.companyId;
      return await this.whatsAppService.getConnection(id, companyId);
    } catch (error) {
      throw new HttpException(error.message || 'Erro ao buscar conexão', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('connections/:id/connect')
  async connectWhatsApp(@Request() req, @Param('id') id: string) {
    console.log('🔍 [BACKEND] connectWhatsApp chamado com id:', id);
    try {
      const companyId = req.user.companyId;
      console.log('🔍 [BACKEND] Conectando WhatsApp para companyId:', companyId);
      const result = await this.whatsAppService.connectWhatsApp(id, companyId);
      console.log('🔍 [BACKEND] Resultado da conexão:', result);
      return result;
    } catch (error) {
      console.log('🔍 [BACKEND] Erro na conexão:', error);
      throw new HttpException(error.message || 'Erro ao conectar WhatsApp', HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('connections/:id/connect')
  async disconnectWhatsApp(@Request() req, @Param('id') id: string) {
    try {
      const companyId = req.user.companyId;
      return await this.whatsAppService.disconnectWhatsApp(id, companyId);
    } catch (error) {
      throw new HttpException(error.message || 'Erro ao desconectar WhatsApp', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('connections/:id/chats')
  async getChats(@Request() req, @Param('id') connectionId: string) {
    try {
      const companyId = req.user.companyId;
      return await this.whatsAppService.getChats(connectionId, companyId);
    } catch (error) {
      throw new HttpException(error.message || 'Erro ao buscar chats', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('chats/:chatId/messages')
  async getMessages(@Request() req, @Param('chatId') chatId: string) {
    try {
      const companyId = req.user.companyId;
      return await this.whatsAppService.getMessages(chatId, companyId);
    } catch (error) {
      throw new HttpException(error.message || 'Erro ao buscar mensagens', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('chats/:chatId/messages')
  async sendMessage(@Request() req, @Param('chatId') chatId: string, @Body() dto: SendMessageDto) {
    try {
      const companyId = req.user.companyId;
      return await this.whatsAppService.sendMessage(chatId, dto.content, companyId);
    } catch (error) {
      throw new HttpException(error.message || 'Erro ao enviar mensagem', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('connections/:id/status')
  async checkConnectionStatus(@Request() req, @Param('id') id: string) {
    try {
      const companyId = req.user.companyId;
      return await this.whatsAppService.checkConnectionStatus(id, companyId);
    } catch (error) {
      throw new HttpException(error.message || 'Erro ao verificar status', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('connections/:id/qr')
  async getQRCode(@Request() req, @Param('id') id: string) {
    try {
      const companyId = req.user.companyId;
      const connection = await this.whatsAppService.getConnection(id, companyId);
      if (!connection) {
        throw new HttpException('Conexão não encontrada', HttpStatus.NOT_FOUND);
      }
      return { qrCode: connection.qrCode };
    } catch (error) {
      throw new HttpException(error.message || 'Erro ao buscar QR Code', HttpStatus.BAD_REQUEST);
    }
  }

  @Get('connections/:id/pairing-code')
  async getPairingCode(@Request() req, @Param('id') id: string) {
    try {
      const raw = (req.query?.phone as string) || '';
      let phone = String(raw).replace(/\D/g, '');
      phone = phone.replace(/^0+/, '');
      if (!phone.startsWith('55') && phone.length === 11) {
        phone = '55' + phone;
      }
      if (!phone) throw new HttpException('Parâmetro phone é obrigatório, ex: 55DDDNÚMERO', HttpStatus.BAD_REQUEST);
      if (phone.length < 12) throw new HttpException('Informe no formato 55DDDNÚMERO', HttpStatus.BAD_REQUEST);
      const code = await this.whatsAppService.getPairingCode(id, phone);
      return { code };
    } catch (error) {
      throw new HttpException(error.message || 'Erro ao gerar pairing code', HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('connections/:id/reset')
  async resetConnection(@Request() req, @Param('id') id: string) {
    try {
      const companyId = req.user.companyId; // apenas valida passagem pelo guard
      await this.whatsAppService.resetConnection(id);
      return { ok: true };
    } catch (error) {
      throw new HttpException(error.message || 'Erro ao resetar conexão', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('connections/:id/sync')
  async syncChats(@Request() req, @Param('id') id: string) {
    try {
      const companyId = req.user.companyId;
      return await this.whatsAppService.syncChats(id, companyId);
    } catch (error) {
      throw new HttpException(error.message || 'Erro ao sincronizar chats', HttpStatus.BAD_REQUEST);
    }
  }
}
