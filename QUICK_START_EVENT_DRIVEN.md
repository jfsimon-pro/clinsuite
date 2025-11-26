# 🚀 Quick Start - Event-Driven Architecture

## Pre-requisitos

- Redis rodando na máquina
- Backend compilado (`npm run build`)

## 1️⃣ Iniciar Redis

```bash
redis-server
```

Verifique:
```bash
redis-cli ping
# Deve retornar: PONG
```

## 2️⃣ Iniciar Backend

```bash
cd backend
npm run start:dev
```

Você deve ver logs como:
```
[Nest] 12345  - 26/11/2025, 10:30:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 26/11/2025, 10:30:01 AM     LOG Application is running on: http://localhost:3001
```

## 3️⃣ Testar Criação de Lead

### Opção A: Postman/Insomnia
```
Method: POST
URL: http://localhost:3001/crm/leads

Headers:
Authorization: Bearer <seu-jwt-token>
Content-Type: application/json

Body:
{
  "phone": "+5511987654321",
  "name": "João Silva",
  "funnelId": "seu-funnel-id",
  "stepId": "seu-step-id",
  "meioCaptacao": "WHATSAPP"
}
```

### Opção B: cURL
```bash
curl -X POST http://localhost:3001/crm/leads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+5511987654321",
    "name": "João Silva",
    "funnelId": "<funnel-id>",
    "stepId": "<step-id>",
    "meioCaptacao": "WHATSAPP"
  }'
```

## 4️⃣ Verificar Event-Driven Flow

### No Console do Backend
Você deve ver:

```
[listener] Lead criado: <lead-id> na etapa <step-id>
[listener] Job enfileirado: <job-id>
[task-automation] Processando mudança de etapa para lead <lead-id>
[task-automation] 1 tarefa(s) criada(s) para lead <lead-id>
```

### No Banco de Dados
```sql
-- Verificar tasks criadas
SELECT * FROM "Task"
WHERE "leadId" = '<lead-id>'
ORDER BY "createdAt" DESC;
```

## 5️⃣ Monitorar Fila (Opcional)

Instale Redis Commander:
```bash
npm install -g redis-commander
redis-commander
```

Acesse: **http://localhost:8081**

Você verá:
- Fila: `task-automation`
- Status dos jobs
- Dados de cada job
- Histórico de jobs completados

## 📊 Fluxo Esperado

### Lead Criado
```
POST /crm/leads
    ↓
CrmService.createLead()
    ↓
eventEmitter.emit('lead.created')
    ↓
TaskAutomationEventListener.handleLeadCreated()
    ↓
taskAutomationQueue.add('lead-moved-to-step')
    ↓
Redis enfileira o job
    ↓
TaskAutomationProcessor processa
    ↓
Tarefas são criadas no DB
    ↓
✅ Job completado, removido da fila
```

### Tarefa Concluída
```
POST /crm/tasks/:id/complete
    ↓
TaskService.completeTask()
    ↓
taskAutomationQueue.add('task-completed')
    ↓
Redis enfileira o job
    ↓
TaskAutomationProcessor processa
    ↓
Próxima tarefa é criada (ou nenhuma se última)
    ↓
✅ Job completado
```

## 🔍 Debugging

### Se logs não aparecerem
1. Verifique se Redis está rodando: `redis-cli ping`
2. Verifique REDIS_URL em `backend/.env`
3. Verifique logs do backend: `npm run start:dev`

### Se tarefas não forem criadas
1. Verifique se as regras de tarefa existem: `SELECT * FROM "StageTaskRule"`
2. Verifique se a etapa tem regras: `SELECT * FROM "StageTaskRule" WHERE "stepId" = '<step-id>'`
3. Verifique banco de dados: `SELECT * FROM "Task"`

### Se job falhar
1. Verifique logs no console
2. Verifique Redis Commander para jobs em FAILED
3. Verifique stack trace no job details

## ✨ O que Mudou

### Antes (Síncrono)
```typescript
async createLead() {
  const lead = await this.prisma.lead.create(...)

  // Espera tarefas serem criadas (bloqueado)
  await this.taskAutomationService.onLeadMoveToStep(...)

  return lead  // Lento!
}
```

### Depois (Event-Driven)
```typescript
async createLead() {
  const lead = await this.prisma.lead.create(...)

  // Emite evento (rápido)
  this.eventEmitter.emit('lead.created', event)

  return lead  // Rápido! Tarefas criadas em background
}
```

## 📈 Benefícios Imediatos

✅ **API mais rápida**: Retorna em <100ms em vez de esperando processamento
✅ **Confiável**: Retry automático se algo falhar
✅ **Escalável**: Múltiplos workers podem processar em paralelo
✅ **Observável**: Fila visível no Redis Commander
✅ **Pronto para crescer**: Fácil adicionar mais queues

## 🎯 Próximas Features (Phase 2)

- [ ] WhatsApp sync queue
- [ ] Notifications queue
- [ ] Dead letter queue para falhas
- [ ] Métricas e monitoring
- [ ] Tests completos

## 💡 Dicas

1. **Sempre deixe Redis rodando** quando for testar
2. **Use Redis Commander** para visualizar o que está acontecendo
3. **Verifique logs** em 2 lugares: console + Redis Commander
4. **Teste com dados reais** antes de produção

## ❓ Dúvidas Comuns

**P: O job foi perdido se Redis cair?**
R: Sim, dados em memória são perdidos. Para persistência, use Kafka.

**P: Quanto tempo leva para processar um job?**
R: Geralmente <1 segundo. Varie conforme complexidade da lógica.

**P: Posso ver o job sendo processado?**
R: Sim! Abra Redis Commander e veja `task-automation` → `active`

**P: O que faz a API retornar rápido?**
R: O event emitter não espera pelo listener. Job é enfileirado em background.

---

**Pronto para testar!** 🎉

Se encontrar problemas, verifique `EVENT_DRIVEN_ARCHITECTURE.md` para troubleshooting.
