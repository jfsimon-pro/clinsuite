# Event-Driven Architecture - Ianara ERP

## 📋 Visão Geral

O Ianara ERP foi refatorado para utilizar **Event-Driven Architecture** com **Bull Queues** (Redis-based). Isso garante:

- ✅ **Confiabilidade**: Retry automático com backoff exponencial
- ✅ **Escalabilidade**: Processamento assincronista em background
- ✅ **Desacoplamento**: Componentes independentes comunicam via eventos
- ✅ **Observabilidade**: Fila de jobs visível e rastreável
- ✅ **Performance**: API responde rapidamente sem esperar processamento pesado

---

## 🏗️ Arquitetura

### Camadas

```
┌─────────────────────────────────────────────────────────┐
│                   HTTP Controllers                       │
│         (CrmController, LeadsController, etc)            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│               Domain Services                            │
│     (CrmService, LeadsService, TaskService)             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼ (Emit Events)
┌─────────────────────────────────────────────────────────┐
│            Event Emitter (EventEmitter2)                 │
│         (lead.created, lead.movedToStep)                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼ (Subscribe & Enqueue)
┌─────────────────────────────────────────────────────────┐
│          Event Listeners (Async)                         │
│      (TaskAutomationEventListener)                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼ (Add Job)
┌─────────────────────────────────────────────────────────┐
│           Bull Queue Manager (Redis)                     │
│    (task-automation, whatsapp-sync, notifications)      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼ (Process)
┌─────────────────────────────────────────────────────────┐
│        Queue Processors (Async Workers)                  │
│     (TaskAutomationProcessor, WhatsAppProcessor)        │
└─────────────────────────────────────────────────────────┘
```

---

## 📤 Fluxo de Dados

### Exemplo: Lead Criado → Tarefas Automáticas

```
1. POST /crm/leads
   ↓
2. CrmService.createLead()
   ├─ Salvar no PostgreSQL
   └─ eventEmitter.emit('lead.created', event)
   ↓
3. TaskAutomationEventListener.handleLeadCreated()
   └─ taskAutomationQueue.add('lead-moved-to-step', jobData)
   ↓
4. Redis Queue recebe o job
   ├─ Armazena jobData
   ├─ Define retry: 3 tentativas
   ├─ Define backoff: exponencial (2s → 4s → 8s)
   └─ Marca como PENDING
   ↓
5. TaskAutomationProcessor processa o job
   └─ await taskAutomationService.onLeadMoveToStep()
   ↓
6. Tarefas são criadas no PostgreSQL
   ↓
7. Job é removido da fila (removeOnComplete: true)
```

### Exemplo: Tarefa Concluída → Próxima Tarefa

```
1. POST /crm/tasks/:id/complete
   ↓
2. TaskService.completeTask()
   ├─ Atualizar status no PostgreSQL
   └─ Retornar imediatamente (API rápida)
   ↓
3. TaskController enfileira
   └─ taskAutomationQueue.add('task-completed', jobData)
   ↓
4. TaskAutomationProcessor.handleTaskCompleted()
   └─ await taskAutomationService.onTaskCompleted()
   ↓
5. Próxima tarefa é criada automaticamente
   ↓
6. Job é removido da fila
```

---

## 📁 Estrutura de Ficheiros

### Novos Ficheiros Criados

```
backend/src/
├── common/
│   ├── events/
│   │   ├── events.module.ts          # Configura EventEmitterModule
│   │   └── lead.events.ts            # Define domain events
│   └── queues/
│       └── queue.module.ts           # Configura Bull Queues
│
├── modules/
│   └── crm/
│       ├── processors/
│       │   └── task-automation.processor.ts  # Worker que processa jobs
│       └── listeners/
│           └── task-automation.listener.ts   # Listener que enfileira jobs
```

### Ficheiros Modificados

```
backend/src/
├── app.module.ts                    # Adiciona QueueModule e EventsModule
├── modules/
│   └── crm/
│       ├── crm.module.ts            # Adiciona QueueModule e EventsModule
│       ├── crm.service.ts           # Emite eventos em vez de chamar direto
│       └── task.controller.ts       # Enfileira em vez de chamar direto
```

---

## 🔄 Eventos Implementados

### LeadCreatedEvent
Emitido quando um novo lead é criado.

```typescript
new LeadCreatedEvent(
  leadId: string,
  stepId: string,
  companyId: string,
  responsibleId?: string | null
)
```

**Listeners:**
- `TaskAutomationEventListener.handleLeadCreated()`

---

### LeadMovedToStepEvent
Emitido quando um lead é movido para outra etapa.

```typescript
new LeadMovedToStepEvent(
  leadId: string,
  previousStepId: string,
  newStepId: string,
  companyId: string
)
```

**Listeners:**
- `TaskAutomationEventListener.handleLeadMovedToStep()`

---

### LeadUpdatedEvent (Futuro)
Emitido quando um lead é atualizado (ainda não implementado).

---

### LeadDeletedEvent (Futuro)
Emitido quando um lead é deletado (ainda não implementado).

---

## 🚀 Filas Configuradas

### 1. `task-automation`
Processa criação de tarefas automáticas.

**Jobs:**
- `lead-moved-to-step`: Cria tarefas quando lead entra em etapa
- `task-completed`: Cria próxima tarefa quando tarefa anterior é concluída

**Configuração:**
```javascript
{
  attempts: 3,                           // 3 tentativas
  backoff: { type: 'exponential', delay: 2000 },  // 2s → 4s → 8s
  removeOnComplete: true,                // Remove após sucesso
  removeOnFail: false,                   // Mantém histórico de falhas
  concurrency: (padrão)                  // Processa job por vez
}
```

---

### 2. `whatsapp-sync` (Futuro)
Para sincronização de mensagens WhatsApp.

---

### 3. `notifications` (Futuro)
Para envio de notificações (email, push, SMS).

---

## 📊 Monitoramento

### Redis Commander (Recomendado)
Para visualizar jobs em tempo real:

```bash
npm install -g redis-commander
redis-commander
```

Acesse: http://localhost:8081

**Verá:**
- Todas as filas
- Status dos jobs (pending, active, completed, failed)
- Detalhes de cada job (data, attempts, stack trace)

---

### Logs

Todos os eventos e jobs são logados com prefixos:

```
[listener] - TaskAutomationEventListener
[processor] - TaskAutomationProcessor
[service] - TaskAutomationService
```

Exemplo:
```
[listener] Lead criado: lead-123 na etapa step-456
[listener] Job enfileirado: job-789
[processor] Processando Lead lead-123 -> Etapa step-456
[processor] 2 tarefa(s) criada(s) para lead lead-123
```

---

## 🔧 Configuração (Variáveis de Ambiente)

```env
# Redis (obrigatório para Bull Queues)
REDIS_URL=redis://localhost:6379

# Ou com autenticação
REDIS_URL=redis://:password@host:port
```

**Nota:** Redis já está no `.env` do projeto. Certifique-se que está rodando:

```bash
# Verificar se Redis está rodando
redis-cli ping  # Deve retornar PONG
```

---

## 🧪 Testando a Implementação

### 1. Iniciar Redis
```bash
redis-server
```

### 2. Iniciar o Backend
```bash
cd backend
npm run start:dev
```

### 3. Criar um Lead (via API ou Frontend)
```bash
curl -X POST http://localhost:3001/crm/leads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+5511999999999",
    "funnelId": "funnel-123",
    "stepId": "step-456"
  }'
```

### 4. Verificar os Logs
```
[listener] Lead criado: lead-abc na etapa step-def
[listener] Job enfileirado: job-xyz
```

### 5. Verificar no Redis Commander
- Abra http://localhost:8081
- Navegue para `task-automation`
- Verá os jobs sendo processados

### 6. Verificar no Banco de Dados
```sql
SELECT * FROM "Task" WHERE "leadId" = 'lead-abc';
-- Deve retornar as tarefas criadas
```

---

## ⚠️ Tratamento de Erros

### Retry Automático
Se um job falhar:

1. **Primeira tentativa falha** → Aguarda 2 segundos
2. **Segunda tentativa falha** → Aguarda 4 segundos
3. **Terceira tentativa falha** → Job é marcado como FAILED

**O job fica no histórico de falhas no Redis para debug.**

### Logging de Erros
Todos os erros são logados:

```typescript
catch (error) {
  this.logger.error(
    `[processor] Erro ao processar lead ${event.leadId}:`,
    error,
  );
  throw error; // Bull faz retry automaticamente
}
```

---

## 🎯 Benefícios Implementados

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Processamento** | Síncrono (bloqueia API) | Assincronista (fila) |
| **Confiabilidade** | Sem retry | 3 tentativas com backoff |
| **Escalabilidade** | Limitado a 1 worker | Múltiplos workers possíveis |
| **Performance da API** | Lenta (espera tarefas) | Rápida (retorna imediatamente) |
| **Observabilidade** | Sem visibilidade | Fila rastreável em Redis |
| **Tratamento de Falhas** | Silencioso | Logado e retentado |

---

## 🔮 Próximos Passos (Fase 2)

### 1. WhatsApp Sync Queue
```typescript
// Sincronizar mensagens em background
@OnEvent('whatsapp.connection.established')
async handleWhatsAppConnected(event: WhatsAppConnectionEvent) {
  await this.whatsappQueue.add('sync-messages', { connectionId });
}
```

### 2. Notifications Queue
```typescript
// Enviar notificações sem bloquear API
@OnEvent('task.expired')
async handleTaskExpired(event: TaskExpiredEvent) {
  await this.notificationsQueue.add('send-notification', {
    userId: event.assignedId,
    type: 'TASK_EXPIRED'
  });
}
```

### 3. Event Sourcing (Fase 3)
Persistir todos os eventos para auditoria completa.

### 4. Kafka Migration (Fase 4)
Quando tiver 100+ clientes e precisar de escala horizontal.

---

## 📚 Referências

- [NestJS Bull Documentation](https://docs.nestjs.com/techniques/queues)
- [Bull GitHub](https://github.com/OptimalBits/bull)
- [NestJS Event Emitter](https://docs.nestjs.com/techniques/events)
- [Redis Documentation](https://redis.io/documentation)

---

## ❓ FAQs

### P: Se Redis cair, os jobs se perdem?
**R:** Sim, Bull armazena jobs na memória Redis. Para persistência, use Kafka ou implemente Event Sourcing.

### P: Posso ter múltiplos processors?
**R:** Sim! Bull distribui jobs entre workers. Configurável via `concurrency`.

### P: Como escalar para múltiplos servidores?
**R:** Redis centralizado + múltiplos servidores conectados = distribuído automaticamente.

### P: Preciso de RabbitMQ ou Kafka agora?
**R:** Não. Bull com Redis é suficiente para 50+ clientes. Upgrade conforme cresce.

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique se Redis está rodando: `redis-cli ping`
2. Verifique logs: `npm run start:dev`
3. Verifique Redis Commander: http://localhost:8081
4. Verifique banco de dados: `SELECT * FROM "Task"`

