# 🤖 Sistema de Automações - IanaraERP

## 📋 Visão Geral

Este documento descreve o sistema de automações do IanaraERP, inspirado nas funcionalidades do **Kommo CRM**, adaptado para o contexto odontológico brasileiro.

## 🎯 Objetivo

Automatizar processos repetitivos do funil de vendas, melhorando:
- ✅ Taxa de conversão de leads
- ✅ Velocidade de resposta ao cliente
- ✅ Produtividade da equipe
- ✅ Experiência do paciente
- ✅ Controle de follow-up

---

## 🏗️ Arquitetura Atual

### Componentes Existentes

#### 1. **Sistema de Tarefas Automáticas** ✅ (Implementado)
**Tabelas do Banco:**
- `StageTaskRule` - Regras de criação de tarefas por etapa
- `Task` - Tarefas geradas automaticamente

**Funcionalidades:**
```typescript
interface StageTaskRule {
  id: string;
  stepId: string;              // Etapa que dispara a regra
  name: string;                // "Ligar para o lead"
  description: string;         // Instruções detalhadas
  order: number;               // Ordem de execução (1, 2, 3...)
  delayDays: number;           // Prazo em dias
  delayType: DelayType;        // ABSOLUTE | AFTER_PREVIOUS
  assignType: AssignType;      // LEAD_OWNER | FIXED_USER | ROUND_ROBIN
  assignedUserId: string;      // Se FIXED_USER
  isActive: boolean;           // Ativa/Desativa regra
}
```

**Como Funciona:**
1. Lead entra em uma etapa
2. Sistema verifica regras ativas (`StageTaskRule`) para aquela etapa
3. Cria tarefas automaticamente conforme as regras
4. Atribui responsável (dono do lead, usuário fixo, ou rodízio)
5. Define prazo baseado em `delayType`:
   - `ABSOLUTE`: X dias após lead entrar na etapa
   - `AFTER_PREVIOUS`: X dias após tarefa anterior ser concluída

**Exemplo Prático:**
```
Etapa: "Orçamento Enviado"
├─ Tarefa 1: "Ligar para confirmar recebimento" (1 dia - ABSOLUTE)
├─ Tarefa 2: "Enviar vídeo explicativo" (2 dias - AFTER_PREVIOUS)
└─ Tarefa 3: "Follow-up final" (3 dias - AFTER_PREVIOUS)
```

#### 2. **Conexão WhatsApp** ✅ (Estrutura Pronta)
**Tabela do Banco:**
- `WhatsAppConnection` - Configuração de conexões WhatsApp Business

**Funcionalidades:**
```typescript
interface WhatsAppConnection {
  id: string;
  companyId: string;
  phoneNumber: string;         // Número conectado
  apiKey: string;              // Chave API do provedor
  webhookUrl: string;          // URL para receber mensagens
  status: ConnectionStatus;    // CONNECTED | DISCONNECTED | ERROR
  provider: string;            // evolution-api, wppconnect, etc
}
```

**Status:** Estrutura criada, falta implementar envio automático

#### 3. **Sistema de Alertas Inteligentes** ✅ (Implementado)
**Tipos de Alertas:**
1. 🔥 **LEAD_QUENTE** - Alto valor parado há muito tempo
2. ⚠️ **TAXA_BAIXA** - Conversão abaixo da meta entre etapas
3. 📈 **OPORTUNIDADE** - Lead com alta probabilidade de conversão
4. ⏰ **PRAZO_PROXIMO** - Previsão de fechamento próxima
5. 🚨 **LEAD_PARADO** - Sem movimento há muito tempo

**Status:** Funcionando e sendo exibido no `/analytics`

---

## 🚀 Roadmap de Automações

### Fase 1: Automações de Tarefas (✅ Implementado)
- [x] Criar tarefas automáticas por etapa
- [x] Definir prazos (absolutos ou sequenciais)
- [x] Atribuir responsáveis (dono, fixo, rodízio)
- [x] Gerenciar status (pendente, concluído, expirado)

### Fase 2: Automações de WhatsApp (🔄 Em Planejamento)

#### 2.1. Templates de Mensagem
**Tabela a Criar:**
```prisma
model WhatsAppTemplate {
  id          String   @id @default(uuid())
  companyId   String
  name        String   // "Boas-vindas Orçamento"
  content     String   // "Olá {nome}, seu orçamento está pronto!"
  variables   Json     // ["nome", "valor", "data"]
  category    TemplateCategory // MARKETING | UTILITY | AUTHENTICATION
  status      TemplateStatus   // PENDING | APPROVED | REJECTED
  createdAt   DateTime @default(now())
  company     Company  @relation(fields: [companyId], references: [id])
  automations AutomationAction[]
}

enum TemplateCategory {
  MARKETING      // Promoções, novidades
  UTILITY        // Lembretes, confirmações
  AUTHENTICATION // Códigos de verificação
}

enum TemplateStatus {
  PENDING   // Aguardando aprovação Meta
  APPROVED  // Aprovado para uso
  REJECTED  // Rejeitado pela Meta
}
```

**Variáveis Disponíveis:**
- `{nome}` - Nome do lead
- `{telefone}` - Telefone do lead
- `{valor}` - Valor do orçamento/venda
- `{data}` - Data da consulta/fechamento
- `{responsavel}` - Nome do responsável
- `{clinica}` - Nome da clínica
- `{etapa}` - Nome da etapa atual

#### 2.2. Regras de Automação WhatsApp
**Tabela a Criar:**
```prisma
model AutomationRule {
  id          String   @id @default(uuid())
  companyId   String
  name        String   // "Boas-vindas Novo Lead"
  isActive    Boolean  @default(true)

  // GATILHO (Trigger)
  triggerType TriggerType
  triggerConfig Json    // Configuração específica do gatilho

  // CONDIÇÕES (Filtros)
  conditions  Json     // Condições opcionais

  // AÇÕES
  actions     AutomationAction[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  company     Company  @relation(fields: [companyId], references: [id])
}

enum TriggerType {
  LEAD_ENTER_STEP      // Lead entra em etapa
  LEAD_LEAVE_STEP      // Lead sai de etapa
  LEAD_IDLE            // Lead parado X dias
  LEAD_CREATED         // Lead criado
  FIELD_CHANGED        // Campo alterado
  TASK_COMPLETED       // Tarefa concluída
  DATE_TIME            // Data/hora específica
  STATUS_CHANGED       // Status da venda mudou
}

model AutomationAction {
  id          String   @id @default(uuid())
  ruleId      String
  order       Int      // Ordem de execução

  // TIPO DE AÇÃO
  actionType  ActionType

  // CONFIGURAÇÃO
  delay       Int      // Minutos de espera antes de executar
  config      Json     // Configuração específica da ação

  rule        AutomationRule @relation(fields: [ruleId], references: [id], onDelete: Cascade)

  @@unique([ruleId, order])
}

enum ActionType {
  SEND_WHATSAPP        // Enviar mensagem WhatsApp
  SEND_EMAIL           // Enviar email
  CREATE_TASK          // Criar tarefa
  MOVE_TO_STEP         // Mover para outra etapa
  ASSIGN_USER          // Atribuir responsável
  ADD_TAG              // Adicionar tag
  UPDATE_FIELD         // Atualizar campo
  TRIGGER_WEBHOOK      // Disparar webhook externo
  SEND_NOTIFICATION    // Notificação interna
}
```

**Exemplos de Gatilhos e Ações:**

```typescript
// Exemplo 1: Boas-vindas
{
  name: "Boas-vindas Novo Lead",
  triggerType: "LEAD_CREATED",
  actions: [
    {
      actionType: "SEND_WHATSAPP",
      delay: 5, // 5 minutos
      config: {
        templateId: "template-boas-vindas-id",
        variables: { nome: "{nome}", clinica: "{clinica}" }
      }
    },
    {
      actionType: "CREATE_TASK",
      delay: 1440, // 24 horas (1 dia)
      config: {
        title: "Primeiro contato telefônico",
        assignType: "LEAD_OWNER"
      }
    }
  ]
}

// Exemplo 2: Follow-up Orçamento
{
  name: "Follow-up Orçamento Enviado",
  triggerType: "LEAD_ENTER_STEP",
  triggerConfig: { stepId: "orcamento-enviado-step-id" },
  actions: [
    {
      actionType: "SEND_WHATSAPP",
      delay: 1440, // 1 dia
      config: {
        templateId: "template-confirmacao-orcamento",
        variables: { nome: "{nome}", valor: "{valor}" }
      }
    },
    {
      actionType: "SEND_WHATSAPP",
      delay: 4320, // 3 dias
      config: {
        templateId: "template-duvidas-orcamento"
      }
    }
  ]
}

// Exemplo 3: Lead Parado
{
  name: "Alerta Lead Parado",
  triggerType: "LEAD_IDLE",
  triggerConfig: { days: 7 },
  conditions: {
    statusVenda: { notIn: ["GANHO", "PERDIDO"] }
  },
  actions: [
    {
      actionType: "CREATE_TASK",
      delay: 0,
      config: {
        title: "🚨 URGENTE: Lead parado há 7 dias",
        priority: "HIGH",
        assignType: "LEAD_OWNER"
      }
    },
    {
      actionType: "SEND_WHATSAPP",
      delay: 60, // 1 hora
      config: {
        templateId: "template-reativacao-lead"
      }
    }
  ]
}
```

#### 2.3. Controle de Sequências
**Tabela a Criar:**
```prisma
model AutomationExecution {
  id          String   @id @default(uuid())
  ruleId      String
  leadId      String
  status      ExecutionStatus

  // Controle de fluxo
  currentActionIndex Int  @default(0)
  nextExecutionAt    DateTime?

  // Metadados
  startedAt   DateTime @default(now())
  completedAt DateTime?
  error       String?

  rule        AutomationRule @relation(fields: [ruleId], references: [id])
  lead        Lead           @relation(fields: [leadId], references: [id], onDelete: Cascade)

  @@unique([ruleId, leadId]) // Uma execução por lead por regra
}

enum ExecutionStatus {
  PENDING       // Aguardando execução
  IN_PROGRESS   // Em execução
  PAUSED        // Pausada (lead respondeu)
  COMPLETED     // Concluída
  FAILED        // Falhou
  CANCELLED     // Cancelada
}
```

**Lógica de Pausa:**
```typescript
// Se lead responder no WhatsApp, pausar automação
async handleIncomingMessage(leadId: string) {
  await prisma.automationExecution.updateMany({
    where: {
      leadId,
      status: 'IN_PROGRESS'
    },
    data: {
      status: 'PAUSED'
    }
  });
}
```

### Fase 3: Interface Visual de Automações (🔮 Futuro)

#### 3.1. Automation Builder
**Tela de Criação de Automação:**
```
┌─────────────────────────────────────────────┐
│  Nova Automação                             │
├─────────────────────────────────────────────┤
│                                             │
│  Nome: [Follow-up Orçamento Enviado      ] │
│                                             │
│  🎯 GATILHO                                 │
│  ┌─────────────────────────────────────┐   │
│  │ Quando: [Lead entra em etapa    ▼] │   │
│  │ Etapa:  [Orçamento Enviado      ▼] │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ⚙️ CONDIÇÕES (Opcional)                    │
│  ┌─────────────────────────────────────┐   │
│  │ + Adicionar condição                │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ✨ AÇÕES                                   │
│  ┌─────────────────────────────────────┐   │
│  │ 1️⃣ Aguardar 1 dia                    │   │
│  │    ↓                                 │   │
│  │ 2️⃣ Enviar WhatsApp                   │   │
│  │    📱 Template: Confirmação Orçamento│   │
│  │    ↓                                 │   │
│  │ 3️⃣ Aguardar 3 dias                   │   │
│  │    ↓                                 │   │
│  │ 4️⃣ Enviar WhatsApp                   │   │
│  │    📱 Template: Dúvidas Orçamento    │   │
│  │                                      │   │
│  │ + Adicionar ação                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Cancelar]  [Salvar e Ativar]             │
└─────────────────────────────────────────────┘
```

#### 3.2. Gerenciador de Templates WhatsApp
```
┌─────────────────────────────────────────────┐
│  Templates de WhatsApp                      │
├─────────────────────────────────────────────┤
│                                             │
│  [+ Novo Template]  [🔄 Sincronizar Meta]  │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 📱 Boas-vindas Novo Lead            │   │
│  │    Status: ✅ Aprovado               │   │
│  │    Categoria: Utilitário             │   │
│  │    ─────────────────────────────     │   │
│  │    Olá {nome}, seja bem-vindo(a)    │   │
│  │    à {clinica}! 🦷                   │   │
│  │                                      │   │
│  │    [Editar] [Visualizar] [Testar]   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 📱 Confirmação Orçamento            │   │
│  │    Status: ⏳ Pendente Aprovação     │   │
│  │    Categoria: Utilitário             │   │
│  │    ─────────────────────────────     │   │
│  │    Olá {nome}, seu orçamento de     │   │
│  │    R$ {valor} está pronto!          │   │
│  │                                      │   │
│  │    [Editar] [Aguardando Meta]        │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 🎨 Casos de Uso Práticos

### 1. Jornada do Paciente - Ortodontia
```
Lead criado (WhatsApp/Instagram)
    ↓ Imediato
📱 "Olá {nome}! Recebemos seu interesse em ortodontia. Vamos agendar uma avaliação?"
    ↓ Lead responde
👤 Tarefa: "Agendar consulta inicial" (Responsável: Recepção)
    ↓ Consulta agendada
📱 "Sua consulta está marcada para {data} às {hora}. Até lá! 😊"
    ↓ 1 dia antes
📱 "Olá {nome}, sua consulta é amanhã! Confirma presença?"
    ↓ Consulta realizada → Move para "Orçamento"
📱 "Aqui está seu orçamento personalizado: R$ {valor}"
    ↓ 2 dias depois
📱 "Ficou com alguma dúvida sobre o orçamento?"
    ↓ 5 dias depois (se não responder)
👤 Tarefa: "Ligar para {nome} - Follow-up orçamento"
```

### 2. Reativação de Leads Inativos
```
Lead parado há 14 dias
    ↓
🚨 Alerta para responsável: "Lead {nome} sem movimento"
    ↓ 1 hora depois
📱 "Olá {nome}, tudo bem? Ainda tem interesse no tratamento?"
    ↓ Se não responder (3 dias)
📅 Mover para etapa "Inativos"
    ↓ 30 dias depois
📱 Mensagem de reativação: "Promoção especial para você!"
```

### 3. Lead Quente - Alta Prioridade
```
Lead com probabilidade > 80% + valor > R$ 5.000
    ↓
🔥 Alerta HIGH para responsável + gestor
    ↓ Imediato
👤 Tarefa URGENTE: "Priorizar contato com {nome}"
    ↓ 4 horas depois (se tarefa não concluída)
🔔 Notificação push: "Lead quente aguardando!"
    ↓ Se responder positivamente
📱 "Excelente! Vamos fechar? Posso te enviar o contrato?"
```

---

## 🔐 Considerações de Segurança e Compliance

### WhatsApp Business API
1. **Templates devem ser aprovados pela Meta** antes do uso
2. **Janela de 24h:** Após mensagem do cliente, pode enviar mensagens livres
3. **Opt-in obrigatório:** Cliente deve aceitar receber mensagens
4. **Limite de templates:** Máximo de mensagens por dia/mês
5. **Categorias:** Respeitar categorias (Marketing, Utilitário, Autenticação)

### LGPD - Lei Geral de Proteção de Dados
1. **Consentimento:** Salvar aceite do paciente para comunicações
2. **Opt-out:** Permitir descadastramento fácil
3. **Logs:** Registrar todas as automações executadas
4. **Transparência:** Informar que são mensagens automáticas

```prisma
model LeadConsent {
  id              String   @id @default(uuid())
  leadId          String
  consentType     ConsentType
  granted         Boolean
  grantedAt       DateTime?
  revokedAt       DateTime?
  ipAddress       String?
  userAgent       String?

  lead            Lead     @relation(fields: [leadId], references: [id])

  @@unique([leadId, consentType])
}

enum ConsentType {
  WHATSAPP_MARKETING    // Promoções
  WHATSAPP_UTILITY      // Lembretes
  EMAIL_MARKETING       // Newsletter
  SMS_NOTIFICATIONS     // SMS
}
```

---

## 📊 Métricas e Monitoramento

### Dashboard de Automações
```
┌─────────────────────────────────────────────┐
│  Automações Ativas: 12                      │
│  Execuções Hoje: 47                         │
│  Taxa de Sucesso: 94%                       │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  Top 5 Automações por Performance           │
├─────────────────────────────────────────────┤
│  1. Follow-up Orçamento      | 32 enviadas  │
│     ✅ 28 lidas | 📞 12 respostas           │
│                                             │
│  2. Boas-vindas Novo Lead    | 15 enviadas  │
│     ✅ 15 lidas | 📞 10 respostas           │
│                                             │
│  3. Lembrete Consulta        | 8 enviadas   │
│     ✅ 8 lidas  | ✔️ 8 confirmadas          │
└─────────────────────────────────────────────┘
```

### Tabela de Logs
```prisma
model AutomationLog {
  id            String   @id @default(uuid())
  executionId   String
  actionType    ActionType
  status        LogStatus

  // Dados do envio
  sentAt        DateTime?
  deliveredAt   DateTime?
  readAt        DateTime?
  respondedAt   DateTime?

  // Metadados
  messageId     String?  // ID da mensagem WhatsApp
  error         String?
  metadata      Json?

  execution     AutomationExecution @relation(fields: [executionId], references: [id])
  createdAt     DateTime @default(now())
}

enum LogStatus {
  QUEUED        // Na fila
  SENDING       // Enviando
  SENT          // Enviada
  DELIVERED     // Entregue
  READ          // Lida
  RESPONDED     // Respondida
  FAILED        // Falhou
}
```

---

## 🛠️ Implementação Técnica

### Backend - Processador de Automações

```typescript
// services/automation-processor.service.ts
@Injectable()
export class AutomationProcessorService {
  constructor(
    private prisma: PrismaService,
    private whatsappService: WhatsAppService,
    private taskService: TaskService,
  ) {}

  // Executado a cada minuto via Cron Job
  @Cron('* * * * *')
  async processAutomations() {
    // Buscar execuções pendentes
    const pendingExecutions = await this.prisma.automationExecution.findMany({
      where: {
        status: 'IN_PROGRESS',
        nextExecutionAt: { lte: new Date() }
      },
      include: {
        rule: { include: { actions: true } },
        lead: true
      }
    });

    for (const execution of pendingExecutions) {
      await this.executeNextAction(execution);
    }
  }

  async executeNextAction(execution: AutomationExecution) {
    const action = execution.rule.actions[execution.currentActionIndex];

    try {
      switch (action.actionType) {
        case 'SEND_WHATSAPP':
          await this.sendWhatsApp(execution.lead, action.config);
          break;
        case 'CREATE_TASK':
          await this.createTask(execution.lead, action.config);
          break;
        case 'MOVE_TO_STEP':
          await this.moveToStep(execution.lead, action.config);
          break;
        // ... outros tipos
      }

      // Avançar para próxima ação
      const nextIndex = execution.currentActionIndex + 1;
      const nextAction = execution.rule.actions[nextIndex];

      if (nextAction) {
        // Ainda há ações
        await this.prisma.automationExecution.update({
          where: { id: execution.id },
          data: {
            currentActionIndex: nextIndex,
            nextExecutionAt: new Date(Date.now() + nextAction.delay * 60 * 1000)
          }
        });
      } else {
        // Concluída
        await this.prisma.automationExecution.update({
          where: { id: execution.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date()
          }
        });
      }
    } catch (error) {
      await this.prisma.automationExecution.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          error: error.message
        }
      });
    }
  }

  async sendWhatsApp(lead: Lead, config: any) {
    const template = await this.prisma.whatsAppTemplate.findUnique({
      where: { id: config.templateId }
    });

    // Substituir variáveis
    let message = template.content;
    for (const [key, value] of Object.entries(config.variables)) {
      message = message.replace(`{${key}}`, String(value));
    }

    // Enviar via WhatsApp Service
    await this.whatsappService.sendMessage(lead.phone, message);

    // Log
    await this.prisma.automationLog.create({
      data: {
        executionId: execution.id,
        actionType: 'SEND_WHATSAPP',
        status: 'SENT',
        sentAt: new Date()
      }
    });
  }
}
```

### Frontend - Automation Builder

```typescript
// components/AutomationBuilder.tsx
export default function AutomationBuilder() {
  const [trigger, setTrigger] = useState<Trigger>();
  const [actions, setActions] = useState<Action[]>([]);

  const addAction = (type: ActionType) => {
    setActions([...actions, {
      type,
      delay: 0,
      config: {}
    }]);
  };

  return (
    <div className="automation-builder">
      <TriggerSelector value={trigger} onChange={setTrigger} />

      <div className="actions-flow">
        {actions.map((action, index) => (
          <ActionCard
            key={index}
            action={action}
            onUpdate={(updated) => updateAction(index, updated)}
            onDelete={() => deleteAction(index)}
          />
        ))}

        <ActionMenu onSelect={addAction} />
      </div>

      <Button onClick={saveAutomation}>
        Salvar Automação
      </Button>
    </div>
  );
}
```

---

## 📚 Referências

### Inspiração - Kommo
- **Pipeline Digital:** https://www.kommo.com/features/digital-pipeline/
- **Automações:** https://www.kommo.com/features/sales-automation/
- **WhatsApp Integration:** https://www.kommo.com/integrations/whatsapp/

### WhatsApp Business API
- **Documentação Oficial:** https://developers.facebook.com/docs/whatsapp
- **Templates:** https://developers.facebook.com/docs/whatsapp/message-templates
- **Evolution API (Alternativa):** https://doc.evolution-api.com/

### Provedores Brasileiros
- **Evolution API:** Multi-dispositivo, open-source
- **WPPConnect:** Solução nacional robusta
- **Baileys:** Library JavaScript para WhatsApp

---

## 🎯 Próximos Passos

### Curto Prazo (1-2 meses)
1. ✅ Implementar tabelas de automação no banco
2. ✅ Criar serviço de processamento de automações
3. ✅ Integrar com WhatsApp (Evolution API)
4. ✅ Interface básica de criação de regras

### Médio Prazo (3-6 meses)
1. ✅ Automation Builder visual (drag-and-drop)
2. ✅ Sistema de templates WhatsApp
3. ✅ Dashboard de métricas
4. ✅ Testes A/B de mensagens

### Longo Prazo (6-12 meses)
1. ✅ IA para sugestão de automações
2. ✅ Integração com outros canais (Email, SMS)
3. ✅ Marketplace de templates prontos
4. ✅ API pública para integrações

---

## 💡 Dicas de Implementação

### Comece Simples
1. Implemente primeiro automações de **tarefas** (já funciona!)
2. Adicione **WhatsApp** em seguida (maior impacto)
3. Depois expanda para outros canais

### Teste com Dados Reais
1. Use leads de teste primeiro
2. Monitore logs detalhadamente
3. Ajuste delays baseado em comportamento real

### Envolva a Equipe
1. Treine usuários em automações básicas
2. Colete feedback sobre efetividade
3. Ajuste templates com linguagem real da clínica

### Monitore Performance
1. Taxa de entrega das mensagens
2. Taxa de leitura
3. Taxa de resposta
4. Conversão por automação

---

## 📞 Suporte

Para dúvidas sobre implementação de automações:
- Documentação interna: `/docs/automations`
- Exemplos práticos: `/docs/automation-examples`
- Troubleshooting: `/docs/automation-troubleshooting`

---

**Última atualização:** 30/09/2025
**Versão:** 1.0
**Autor:** Equipe IanaraERP
