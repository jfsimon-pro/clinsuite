# 🎯 Sistema de Tarefas Automáticas - Roadmap Detalhado

## 📋 Visão Geral

**Objetivo**: Implementar um sistema completo de tarefas automáticas que se integra ao CRM existente, permitindo que administradores configurem sequências de tarefas para cada etapa do funil, automatizando o workflow das clínicas odontológicas.

**Duração Estimada**: 4-5 semanas  
**Prioridade**: Alta (módulo core para automação)  
**Dependências**: Sistema de Funis já implementado ✅  

---

## 🏗️ Fase 1: Base de Dados e Estrutura (Semana 1)

### **Sprint 2.4.1 - Schema e Migrations**

#### **1. Atualizar Schema Prisma**
```prisma
// Adicionar ao schema.prisma existente:

model StageTaskRule {
  id             String    @id @default(uuid())
  stepId         String    // FK para FunnelStep
  name           String    // "Ligar para o lead"
  description    String?   // Instruções detalhadas
  order          Int       // Ordem na sequência (1, 2, 3...)
  delayDays      Int       // Prazo em dias
  delayType      DelayType @default(ABSOLUTE)
  assignType     AssignType @default(LEAD_OWNER)
  assignedUserId String?   // Se FIXED_USER
  isActive       Boolean   @default(true)
  companyId      String
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  
  // Relacionamentos
  step           FunnelStep @relation(fields: [stepId], references: [id])
  assignedUser   User?      @relation("TaskRuleAssignedUser", fields: [assignedUserId], references: [id])
  company        Company    @relation(fields: [companyId], references: [id])
  tasks          Task[]
  
  @@unique([stepId, order]) // Ordem única por etapa
}

model Task {
  id             String     @id @default(uuid())
  leadId         String
  ruleId         String     // Qual regra gerou esta tarefa
  assignedId     String     // Usuário responsável
  title          String
  description    String?
  dueDate        DateTime
  status         TaskStatus @default(PENDING)
  completedAt    DateTime?
  completedBy    String?    // Quem marcou como concluída
  notes          String?    // Observações na conclusão
  companyId      String
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  
  // Relacionamentos
  lead           Lead             @relation(fields: [leadId], references: [id])
  rule           StageTaskRule    @relation(fields: [ruleId], references: [id])
  assigned       User             @relation("TaskAssigned", fields: [assignedId], references: [id])
  completedByUser User?           @relation("TaskCompletedBy", fields: [completedBy], references: [id])
  company        Company          @relation(fields: [companyId], references: [id])
}

// Atualizar model User para incluir relacionamentos
model User {
  // ... campos existentes
  assignedTaskRules StageTaskRule[] @relation("TaskRuleAssignedUser")
  assignedTasks     Task[]          @relation("TaskAssigned")
  completedTasks    Task[]          @relation("TaskCompletedBy")
}

// Atualizar model Lead para incluir tarefas
model Lead {
  // ... campos existentes
  tasks Task[]
}

// Atualizar model Company para incluir tarefas
model Company {
  // ... campos existentes
  taskRules StageTaskRule[]
  tasks     Task[]
}

// Atualizar model FunnelStep para incluir regras
model FunnelStep {
  // ... campos existentes
  taskRules StageTaskRule[]
}

// Novos Enums
enum DelayType {
  ABSOLUTE      // X dias após lead entrar na etapa
  AFTER_PREVIOUS // X dias após tarefa anterior ser concluída
}

enum AssignType {
  LEAD_OWNER    // Responsável atual do lead
  FIXED_USER    // Usuário específico
  ROUND_ROBIN   // Distribuição automática (futura implementação)
}

enum TaskStatus {
  PENDING
  COMPLETED
  EXPIRED
  CANCELLED
}
```

#### **2. Migrations e Seeds**
- [ ] Criar migration para novas tabelas
- [ ] Atualizar seed com dados de exemplo
- [ ] Testar integridade referencial

**Entregável**: Schema atualizado e banco funcionando

---

## 🔧 Fase 2: Backend - Lógica de Negócio (Semana 2)

### **Sprint 2.4.2 - Services e Controllers**

#### **1. StageTaskRuleService**
```typescript
// backend/src/modules/crm/stage-task-rule.service.ts

@Injectable()
export class StageTaskRuleService {
  // CRUD básico
  async create(data: CreateStageTaskRuleDto): Promise<StageTaskRule>
  async findAllByStep(stepId: string, companyId: string): Promise<StageTaskRule[]>
  async findAllByCompany(companyId: string): Promise<StageTaskRule[]>
  async update(id: string, data: UpdateStageTaskRuleDto): Promise<StageTaskRule>
  async delete(id: string, companyId: string): Promise<void>
  
  // Lógica específica
  async reorderRules(stepId: string, newOrder: string[]): Promise<void>
  async duplicateRulesFromStep(fromStepId: string, toStepId: string): Promise<void>
  async toggleActive(id: string, isActive: boolean): Promise<void>
}
```

#### **2. TaskService**
```typescript
// backend/src/modules/crm/task.service.ts

@Injectable()
export class TaskService {
  // CRUD básico
  async create(data: CreateTaskDto): Promise<Task>
  async findAllByUser(userId: string, status?: TaskStatus): Promise<Task[]>
  async findAllByLead(leadId: string): Promise<Task[]>
  async findAllByCompany(companyId: string, filters?: TaskFiltersDto): Promise<Task[]>
  async update(id: string, data: UpdateTaskDto): Promise<Task>
  async delete(id: string): Promise<void>
  
  // Lógica de negócio
  async completeTask(id: string, userId: string, notes?: string): Promise<Task>
  async generateTasksForLead(leadId: string, stepId: string): Promise<Task[]>
  async processExpiredTasks(): Promise<void>
  async getTaskStatistics(companyId: string, period?: DateRange): Promise<TaskStats>
}
```

#### **3. TaskAutomationService**
```typescript
// backend/src/modules/crm/task-automation.service.ts

@Injectable()
export class TaskAutomationService {
  // Automação principal
  async onLeadMoveToStep(leadId: string, stepId: string): Promise<void>
  async onTaskCompleted(taskId: string): Promise<void>
  
  // Lógica interna
  private async createNextTaskInSequence(completedTask: Task): Promise<Task | null>
  private async determineTaskAssignee(rule: StageTaskRule, leadId: string): Promise<string>
  private async calculateTaskDueDate(rule: StageTaskRule, leadId: string): Promise<DateTime>
}
```

#### **4. Controllers**
- [ ] **StageTaskRuleController** - CRUD e configurações
- [ ] **TaskController** - Dashboard e execução
- [ ] **TaskReportsController** - Relatórios e métricas

#### **5. DTOs e Validações**
- [ ] **CreateStageTaskRuleDto, UpdateStageTaskRuleDto**
- [ ] **CreateTaskDto, UpdateTaskDto, CompleteTaskDto**
- [ ] **TaskFiltersDto, TaskStatsDto**

**Entregável**: APIs funcionais para gestão completa de tarefas

---

## 🎨 Fase 3: Frontend - Interface Administrativa (Semana 3)

### **Sprint 2.4.3 - Admin UI**

#### **1. Configuração de Tarefas por Etapa**
```typescript
// frontend/src/app/admin/funnels/[id]/tasks/page.tsx
// Interface para configurar tarefas automáticas de uma etapa
```

**Funcionalidades:**
- [ ] **Lista de tarefas** configuradas para a etapa
- [ ] **Modal de criação/edição** de regra de tarefa
- [ ] **Drag & Drop** para reordenar sequência
- [ ] **Preview** do workflow configurado
- [ ] **Ativar/Desativar** regras individualmente

#### **2. Componentes Reutilizáveis**
```typescript
// TaskRuleForm - Formulário de criação/edição
// TaskRuleList - Lista com drag & drop
// AssignTypeSelector - Seletor de tipo de atribuição
// DelayTypeSelector - Configuração de prazos
// TaskPreview - Preview visual do workflow
```

#### **3. Hooks Customizados**
```typescript
// useTaskRules - Gerenciar regras de tarefas
// useTaskAutomation - Configurações de automação
// useTaskStats - Estatísticas de tarefas
```

#### **4. Integração com Funis Existentes**
- [ ] **Adicionar aba "Tarefas"** na edição de etapas
- [ ] **Indicador visual** de etapas com tarefas configuradas
- [ ] **Importação** de regras de outras etapas/funis

**Entregável**: Interface completa para administradores configurarem tarefas

---

## 👥 Fase 4: Frontend - Interface do Colaborador (Semana 4)

### **Sprint 2.4.4 - Worker UI**

#### **1. Dashboard de Tarefas**
```typescript
// frontend/src/app/dashboard/tasks/page.tsx
// Dashboard principal do colaborador
```

**Funcionalidades:**
- [ ] **Lista de tarefas pendentes** com filtros
- [ ] **Tarefas por prazo** (hoje, amanhã, próximos dias)
- [ ] **Tarefas vencidas** destacadas
- [ ] **Histórico** de tarefas concluídas
- [ ] **Métricas pessoais** (concluídas/pendentes/vencidas)

#### **2. Detalhes da Tarefa**
```typescript
// TaskDetailModal - Modal com informações completas
// TaskCompletionForm - Formulário para marcar como concluída
// TaskHistory - Histórico de uma tarefa específica
```

#### **3. Integração com Leads**
- [ ] **Aba "Tarefas"** na visualização do lead
- [ ] **Indicadores** de tarefas pendentes na lista de leads
- [ ] **Ações rápidas** para completar tarefas

#### **4. Notificações**
- [ ] **Badge** de tarefas pendentes no menu
- [ ] **Notificações push** para prazos próximos
- [ ] **Alertas** de tarefas vencidas

**Entregável**: Interface completa para colaboradores gerenciarem suas tarefas

---

## ⚡ Fase 5: Automação e Jobs (Semana 5)

### **Sprint 2.4.5 - Sistema de Automação**

#### **1. Job Queue Integration**
```typescript
// backend/src/modules/crm/jobs/task-automation.job.ts
// Job para processar automações de tarefas

@Processor('task-automation')
export class TaskAutomationProcessor {
  @Process('create-tasks-for-lead')
  async handleCreateTasks(job: Job<CreateTasksJobData>): Promise<void>
  
  @Process('process-completed-task')
  async handleTaskCompletion(job: Job<TaskCompletionJobData>): Promise<void>
  
  @Process('check-expired-tasks')
  async handleExpiredTasks(job: Job): Promise<void>
}
```

#### **2. Event Listeners**
```typescript
// Escutar mudanças de etapas nos leads
// Escutar conclusão de tarefas
// Processar expirações de prazo
```

#### **3. Cron Jobs**
```typescript
// Job diário para verificar tarefas vencidas
// Job para estatísticas e relatórios
// Job para limpeza de dados antigos
```

#### **4. Webhooks (Futuro)**
- [ ] **Integração com WhatsApp** - Notificar tarefas
- [ ] **Integração com Email** - Lembretes automáticos
- [ ] **Integração com Calendar** - Criar eventos

**Entregável**: Sistema totalmente automatizado funcionando

---

## 📊 Relatórios e Analytics

### **Métricas Implementadas**
- [ ] **Por Colaborador**: Tarefas criadas/concluídas/vencidas
- [ ] **Por Funil**: Efetividade das sequências de tarefas
- [ ] **Por Período**: Análise temporal de produtividade
- [ ] **Por Tipo de Tarefa**: Quais tarefas são mais efetivas

### **Dashboards**
- [ ] **Admin**: Visão geral de todas as tarefas da empresa
- [ ] **Worker**: Métricas pessoais e metas
- [ ] **Relatórios Exportáveis**: CSV/PDF para análises

---

## 🚀 Plano de Deploy

### **Rollout Incremental**
1. **Semana 1-2**: Deploy em desenvolvimento
2. **Semana 3**: Testes com usuários beta (Clínica Ianara)
3. **Semana 4**: Ajustes baseados em feedback
4. **Semana 5**: Deploy em produção para todos

### **Migração de Dados**
- [ ] **Converter lembretes existentes** em tarefas
- [ ] **Criar regras padrão** para funis existentes
- [ ] **Backup completo** antes da migração

---

## 🎯 Critérios de Sucesso

### **Funcionalidades Obrigatórias**
- [ ] Admin consegue configurar sequências de tarefas por etapa
- [ ] Tarefas são criadas automaticamente quando lead muda de etapa
- [ ] Colaboradores veem suas tarefas pendentes no dashboard
- [ ] Conclusão de tarefa dispara criação da próxima na sequência
- [ ] Tarefas vencidas são identificadas automaticamente
- [ ] Sistema mantém histórico completo de todas as tarefas

### **Performance**
- [ ] **Criação de tarefas** < 500ms
- [ ] **Dashboard de tarefas** < 2s loading time
- [ ] **Processamento de jobs** sem impacto na API

### **Usabilidade**
- [ ] **Interface intuitiva** para configuração
- [ ] **Dashboard limpo** para colaboradores
- [ ] **Notificações claras** de prazos e vencimentos

---

## 🔮 Roadmap Futuro

### **Fase 2 - IA e Automação Avançada**
- [ ] **IA para executar tarefas** automaticamente
- [ ] **Análise de padrões** para otimizar sequências
- [ ] **Sugestões automáticas** de melhorias

### **Fase 3 - Integrações Externas**
- [ ] **Google Calendar** - Eventos automáticos
- [ ] **WhatsApp Business** - Mensagens automáticas
- [ ] **Email Marketing** - Sequências de follow-up

### **Fase 4 - Analytics Avançados**
- [ ] **Machine Learning** para previsão de conversão
- [ ] **A/B Testing** de sequências de tarefas
- [ ] **Dashboards executivos** com insights

---

## 📋 Checklist de Implementação

### **Pré-requisitos**
- [ ] Sistema de Funis funcionando ✅
- [ ] Autenticação multi-tenant ✅
- [ ] Job queue (Redis + BullMQ) configurado ✅

### **Desenvolvimento**
- [ ] Schema Prisma atualizado
- [ ] Migrations aplicadas
- [ ] Services implementados
- [ ] Controllers criados
- [ ] DTOs e validações
- [ ] Interface administrativa
- [ ] Dashboard de colaborador
- [ ] Sistema de automação
- [ ] Testes unitários
- [ ] Testes de integração

### **Deploy**
- [ ] Ambiente de desenvolvimento
- [ ] Testes com usuários beta
- [ ] Documentação atualizada
- [ ] Deploy em produção
- [ ] Monitoramento ativo

---

**🎯 Este sistema vai revolucionar a gestão de leads nas clínicas odontológicas, automatizando completamente o workflow e garantindo que nenhum lead seja esquecido!**

*Tempo estimado total: 4-5 semanas de desenvolvimento intensivo*