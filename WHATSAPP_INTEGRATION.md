# 🤖 Integração WhatsApp com VenomBot

## 📋 Status Atual

### ✅ Implementado
- [x] Página WhatsApp com interface moderna
- [x] Modal de conexão com múltiplas instâncias
- [x] Backend com APIs RESTful
- [x] Modelos de dados no Prisma
- [x] Hook personalizado para gerenciar APIs
- [x] Sistema de multi-tenancy por empresa
- [x] Interface para conectar/desconectar WhatsApp

### 🔄 Próximos Passos
- [ ] Instalar e configurar VenomBot
- [ ] Implementar WebSocket para mensagens em tempo real
- [ ] Integração real com WhatsApp
- [ ] Sistema de notificações
- [ ] Histórico de mensagens
- [ ] Envio de arquivos e mídia

## 🚀 Como Implementar a Integração Completa

### 1. Instalar VenomBot no Backend

```bash
cd backend
npm install venom-bot
```

### 2. Configurar VenomBot no Serviço

```typescript
// backend/src/modules/whatsapp/venom.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { create, Whatsapp } from 'venom-bot';

@Injectable()
export class VenomService {
  private readonly logger = new Logger(VenomService.name);
  private sessions = new Map<string, Whatsapp>();

  async createSession(connectionId: string, sessionName: string): Promise<string> {
    try {
      const session = await create({
        session: sessionName,
        multidevice: true,
        headless: true,
        useChrome: false,
        debug: false,
        logQR: false,
        browserArgs: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ],
      });

      this.sessions.set(connectionId, session);
      
      // Configurar eventos
      session.onMessage((message) => this.handleIncomingMessage(connectionId, message));
      session.onStateChange((state) => this.handleStateChange(connectionId, state));
      
      return sessionName;
    } catch (error) {
      this.logger.error(`Erro ao criar sessão: ${error.message}`);
      throw error;
    }
  }

  async getQRCode(connectionId: string): Promise<string> {
    const session = this.sessions.get(connectionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    return new Promise((resolve, reject) => {
      session.on('qr', (qrCode) => {
        resolve(qrCode);
      });

      session.on('ready', () => {
        this.logger.log(`WhatsApp conectado: ${connectionId}`);
      });

      session.on('error', (error) => {
        reject(error);
      });
    });
  }

  async sendMessage(connectionId: string, to: string, content: string) {
    const session = this.sessions.get(connectionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    return await session.sendText(to, content);
  }

  async getChats(connectionId: string) {
    const session = this.sessions.get(connectionId);
    if (!session) {
      throw new Error('Sessão não encontrada');
    }

    const chats = await session.getAllChats();
    return chats.filter(chat => !chat.isGroup); // Apenas conversas individuais
  }

  private async handleIncomingMessage(connectionId: string, message: any) {
    // Salvar mensagem no banco
    // Emitir evento via WebSocket
    this.logger.log(`Nova mensagem em ${connectionId}: ${message.content}`);
  }

  private async handleStateChange(connectionId: string, state: string) {
    // Atualizar status da conexão
    this.logger.log(`Estado alterado em ${connectionId}: ${state}`);
  }
}
```

### 3. Implementar WebSocket para Tempo Real

```typescript
// backend/src/modules/whatsapp/whatsapp.gateway.ts
import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  OnGatewayConnection,
  OnGatewayDisconnect 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
})
export class WhatsAppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSessions = new Map<string, string>(); // userId -> companyId

  handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    // Validar token e associar usuário à sessão
  }

  handleDisconnect(client: Socket) {
    // Limpar sessão do usuário
  }

  @SubscribeMessage('join-company')
  handleJoinCompany(client: Socket, companyId: string) {
    this.userSessions.set(client.id, companyId);
    client.join(`company-${companyId}`);
  }

  // Emitir mensagens para a empresa específica
  emitMessageToCompany(companyId: string, event: string, data: any) {
    this.server.to(`company-${companyId}`).emit(event, data);
  }
}
```

### 4. Atualizar o Frontend para WebSocket

```typescript
// frontend/src/hooks/useWhatsAppWebSocket.ts
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useWhatsAppWebSocket(companyId: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    socketRef.current = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
      auth: { token },
    });

    socketRef.current.emit('join-company', companyId);

    socketRef.current.on('new-message', (message) => {
      // Atualizar mensagens em tempo real
      console.log('Nova mensagem:', message);
    });

    socketRef.current.on('connection-status', (status) => {
      // Atualizar status da conexão
      console.log('Status alterado:', status);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [companyId]);

  return socketRef.current;
}
```

### 5. Configurar Variáveis de Ambiente

```bash
# backend/.env
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
PORT=3001
FRONTEND_URL="http://localhost:3000"

# frontend/.env.local
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="http://localhost:3001"
```

## 🏗️ Arquitetura do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   WhatsApp      │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   React     │ │◄──►│ │   NestJS    │ │◄──►│ │   VenomBot  │ │
│ │   Next.js   │ │    │ │             │ │    │ │             │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ WebSocket   │ │◄──►│ │ WebSocket   │ │    │ │   QR Code   │ │
│ │   Client    │ │    │ │   Gateway   │ │    │ │   Scanner   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Comandos para Executar

### Backend
```bash
cd backend
npm install
npm install venom-bot
npx prisma migrate dev
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📱 Funcionalidades Implementadas

### ✅ Modal de Conexão
- Lista todas as conexões da empresa
- Adicionar novas conexões
- Conectar/desconectar WhatsApp
- Exibir QR Code para conexão
- Status em tempo real

### ✅ APIs Backend
- `POST /whatsapp/connections` - Criar conexão
- `GET /whatsapp/connections` - Listar conexões
- `POST /whatsapp/connections/:id/connect` - Conectar
- `DELETE /whatsapp/connections/:id/connect` - Desconectar
- `GET /whatsapp/connections/:id/chats` - Listar chats
- `GET /whatsapp/chats/:id/messages` - Buscar mensagens
- `POST /whatsapp/chats/:id/messages` - Enviar mensagem

### ✅ Multi-tenancy
- Cada empresa tem suas próprias conexões
- Isolamento completo de dados
- Middleware de autenticação por empresa

## 🚀 Próximos Passos

1. **Instalar VenomBot** e configurar no backend
2. **Implementar WebSocket** para mensagens em tempo real
3. **Criar sistema de notificações** para novas mensagens
4. **Adicionar suporte a mídia** (imagens, áudios, documentos)
5. **Implementar histórico completo** de mensagens
6. **Adicionar funcionalidades avançadas**:
   - Respostas automáticas
   - Integração com leads do CRM
   - Relatórios e analytics
   - Backup de conversas

## 🔒 Segurança

- Autenticação JWT obrigatória
- Isolamento por empresa
- Validação de entrada em todas as APIs
- Rate limiting (a implementar)
- Logs de auditoria (a implementar)

## 📊 Monitoramento

- Logs detalhados de conexões
- Métricas de performance
- Alertas de desconexão
- Dashboard de status (a implementar)
