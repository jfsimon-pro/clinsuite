# Event-Driven Architecture - Implementation Checklist

## ✅ Implementado

### Infraestrutura
- [x] Instaladas dependências Bull e NestJS Bull
- [x] Instalado @nestjs/event-emitter
- [x] QueueModule configurado com Redis
- [x] EventsModule configurado

### Arquitetura de Eventos
- [x] LeadCreatedEvent definido
- [x] LeadMovedToStepEvent definido
- [x] EventEmitter2 integrado ao CrmService
- [x] EventEmitter2 integrado ao TaskController

### Task Automation Queue
- [x] Queue `task-automation` registrada
- [x] TaskAutomationProcessor criado
- [x] Handlers: `lead-moved-to-step` e `task-completed`
- [x] Retry com backoff exponencial configurado
- [x] Logging implementado

### Event Listeners
- [x] TaskAutomationEventListener criado
- [x] Listener para `lead.created`
- [x] Listener para `lead.movedToStep`
- [x] Jobs enfileirados corretamente

### CRM Service Refatorado
- [x] createLead() emite `lead.created`
- [x] moveLeadToStep() emite `lead.movedToStep`
- [x] updateLead() emite `lead.movedToStep` quando etapa muda
- [x] Removidas chamadas síncronas diretas

### Task Controller Refatorado
- [x] complete() enfileira `task-completed`
- [x] Configuração de retry adicionada
- [x] removeOnComplete ativado

### Módulos Atualizados
- [x] app.module.ts atualizado
- [x] crm.module.ts atualizado

### Build
- [x] Compilação sem erros
- [x] TypeScript types corretos

---

## 🚧 Fase 2 - Próximos (Recomendado)

### WhatsApp Sync Queue
- [ ] Queue `whatsapp-sync` com processor
- [ ] WhatsAppSyncProcessor criado
- [ ] Jobs para sincronização de mensagens
- [ ] Retry e DLQ configurado
- [ ] Event `whatsapp.message.received` emitido

### Notifications Queue
- [ ] Queue `notifications` com processor
- [ ] NotificationsProcessor criado
- [ ] Jobs para: email, push, SMS
- [ ] Template engine integrado
- [ ] Rate limiting para notificações

### Event Listeners Adicionais
- [ ] TaskExpiredEvent listener
- [ ] LeadLostEvent listener
- [ ] PaymentReceivedEvent listener

---

## 🔮 Fase 3 - Escalabilidade

### Event Sourcing
- [ ] EventStore criado (nova tabela no DB)
- [ ] Todos os eventos persistidos
- [ ] Auditoria completa implementada
- [ ] Snapshot pattern para performance

### Dead Letter Queue (DLQ)
- [ ] DLQ para falhas após 3 retries
- [ ] Dashboard de DLQ
- [ ] Manual retry para jobs falhos
- [ ] Alertas para jobs na DLQ

### Métricas e Monitoring
- [ ] Prometheus exporta métricas de Bull
- [ ] Grafana dashboard criado
- [ ] Alertas para filas congestionadas
- [ ] Health check endpoint para queues

---

## 🔧 Testes

### Testes Unitários (TODO)
- [ ] TaskAutomationProcessor.spec.ts
- [ ] TaskAutomationEventListener.spec.ts
- [ ] LeadCreatedEvent handler tests

### Testes de Integração (TODO)
- [ ] Fluxo completo: criar lead → tarefas criadas
- [ ] Fluxo: completar tarefa → próxima criada
- [ ] Retry automático com falha simulada
- [ ] Timeout e job expiration

### Testes E2E (TODO)
- [ ] API test: POST /crm/leads
- [ ] API test: POST /crm/tasks/:id/complete
- [ ] Verificar tarefas criadas via database

---

## 📊 Dependências Instaladas

```json
{
  "@nestjs/bull": "^11.0.4",
  "@nestjs/event-emitter": "^3.0.1",
  "bull": "^4.16.5"
}
```

---

## 📁 Ficheiros Criados

```
backend/src/
├── common/
│   ├── events/
│   │   ├── events.module.ts
│   │   └── lead.events.ts
│   └── queues/
│       └── queue.module.ts
└── modules/crm/
    ├── processors/
    │   └── task-automation.processor.ts
    └── listeners/
        └── task-automation.listener.ts
```

---

## 📝 Ficheiros Modificados

```
backend/src/
├── app.module.ts
├── config/
│   └── configuration.ts (REDIS_URL verificado)
└── modules/crm/
    ├── crm.module.ts
    ├── crm.service.ts
    └── task.controller.ts
```

---

## 🚀 Como Testar Agora

### 1. Verificar Redis
```bash
redis-cli ping
# Output: PONG
```

### 2. Iniciar Backend
```bash
cd backend
npm run start:dev
```

### 3. Criar um Lead (via Postman/cURL)
```bash
POST /crm/leads
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone": "+5511999999999",
  "funnelId": "<funnel-id>",
  "stepId": "<step-id>"
}
```

### 4. Verificar Logs
- Procure por `[listener]` no console
- Procure por `[processor]` no console
- Procure por tarefas criadas no banco

### 5. Redis Commander (Opcional)
```bash
npm install -g redis-commander
redis-commander
# Acesse http://localhost:8081
```

---

## 🐛 Troubleshooting

### Redis Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
**Solução:** Iniciar Redis: `redis-server`

### Job não está sendo processado
1. Verificar se Redis está rodando
2. Verificar se processor está registrado no módulo
3. Verificar logs para erros
4. Verificar se job foi enfileirado corretamente

### Bull não está salvando jobs
1. Verificar REDIS_URL em .env
2. Verificar permissões de Redis
3. Verificar espaço em disco

---

## ✨ Resultados Esperados

Após implementação:

✅ Criar lead → evento emitido → listener enfileira → processor cria tarefas
✅ Completar tarefa → controller enfileira → processor cria próxima
✅ API retorna rapidamente (não bloqueia esperando tarefas)
✅ Tarefas são criadas em background
✅ Erros fazem retry automaticamente
✅ Fila é visível no Redis Commander

---

## 📞 Status

- **Implementação**: ✅ Completa
- **Testes**: ⏳ Aguardando (Fase 2)
- **Documentação**: ✅ Completa
- **Produção**: 🟡 Requer teste com dados reais

