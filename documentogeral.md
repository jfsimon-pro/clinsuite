# ERP Odontológico - Especificações Técnicas Detalhadas

## 1. Visão Geral do Projeto

### Objetivo Principal
Desenvolver um ERP completo para clínicas odontológicas, começando pela clínica Ianara Pinho, com arquitetura preparada para ser vendido como **SaaS White-Label** para outras clínicas.

### Características Principais
- **Multi-tenant**: Cada empresa tem seus dados isolados no mesmo banco
- **White-label completo**: Logo, cores, nome da empresa personalizáveis
- **Modular e escalável**: Desenvolvimento por módulos independentes
- **Arquitetura moderna**: Next.js + NestJS + PostgreSQL

---

## 2. Arquitetura Técnica

### Stack Tecnológico

#### Backend (NestJS)
- **Linguagem**: TypeScript
- **Framework**: NestJS (monolito modular)
- **Banco Principal**: PostgreSQL
- **ORM**: Prisma
- **Autenticação**: JWT + Refresh Token
- **Filas/Jobs**: Redis + BullMQ
- **Banco Secundário**: MongoDB (opcional para logs/eventos)

#### Frontend (Next.js)
- **Framework**: Next.js com App Router
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS + ShadCN UI
- **Gerenciamento de Estado**: Context API + Zustand
- **Autenticação**: NextAuth.js
- **Theming**: Tokens CSS dinâmicos para white-label

#### DevOps e Deploy
- **CI/CD**: GitHub Actions
- **Monitoramento**: Sentry, LogRocket

### Estratégia Multi-Tenant
- **Modelo**: Row-Level Security (todas as tabelas possuem `company_id`)
- **Isolamento**: Dados separados por empresa no mesmo banco
- **Personalização**: Cada empresa pode ter logo, cores, domínio próprio

---

## 3. Módulos do Sistema (Roadmap Completo)

### Fase 1 - CRM (ATUAL - PRIORIDADE)
**Funcionalidades do CRM:**
- Gestão de leads
- Funil de vendas configurável
- Sistema de lembretes automáticos
- Notas e observações sobre leads
- Atribuição de responsáveis

### Fase 2 - Agenda de Dentistas
- Agendamento de consultas
- Calendário por profissional
- Bloqueio de horários
- Reagendamentos

### Fase 3 - Gestão de Pacientes
- Cadastro completo de pacientes
- Histórico médico
- Upload de documentos e fotos
- Assinaturas digitais

### Fase 4 - Controle de Estoque
- Cadastro de produtos/materiais
- Controle de entrada/saída
- Alertas de estoque baixo
- Relatórios de consumo

### Fase 5 - Gestão Financeira
- Controle de recebimentos
- Repasses para profissionais
- Centro de custos
- Fluxo de caixa

### Fase 6 - Tela do Doutor
- Consultas do dia
- Planos de tratamento
- Prescrições
- Histórico do paciente

### Fase 7 - Mensageria com IA
- Confirmações automáticas
- Lembretes de consulta
- Campanhas de reativação
- WhatsApp/SMS integrado

### Fase 8 - Documentos e Relatórios
- Relatórios gerenciais
- Documentos legais
- Assinaturas digitais
- Backup de documentos

---

## 4. Módulo CRM - Especificação Detalhada (ATUAL)

### 4.1 Entidades e Relacionamentos

#### Company (Empresa/Clínica)
```typescript
interface Company {
  id: string;           // UUID único
  name: string;         // Nome da clínica
  cnpj: string;         // CNPJ único
  logoUrl?: string;     // URL do logo
  primaryColor?: string; // Cor primária (#hexcode)
  createdAt: DateTime;  // Data de criação
}
```

#### User (Usuários do Sistema)
```typescript
interface User {
  id: string;           // UUID único
  email: string;        // Email único no sistema
  password: string;     // Hash da senha
  name: string;         // Nome completo
  role: 'ADMIN' | 'WORKER'; // Papel no sistema
  companyId: string;    // FK para Company
  createdAt: DateTime;  // Data de criação
}
```

#### Funnel (Funil de Vendas)
```typescript
interface Funnel {
  id: string;           // UUID único
  name: string;         // Nome do funil
  companyId: string;    // FK para Company
  steps: FunnelStep[];  // Etapas do funil
}
```

#### FunnelStep (Etapas do Funil)
```typescript
interface FunnelStep {
  id: string;           // UUID único
  name: string;         // Nome da etapa
  order: number;        // Ordem da etapa (1, 2, 3...)
  funnelId: string;     // FK para Funnel
  rules: ReminderRule[]; // Regras de lembrete
}
```

#### Lead (Prospects/Potenciais Clientes)
```typescript
interface Lead {
  id: string;           // UUID único
  name: string;         // Nome do lead
  phone: string;        // Telefone de contato
  funnelId: string;     // FK - Qual funil
  stepId: string;       // FK - Qual etapa atual
  responsibleId: string; // FK - Usuário responsável
  companyId: string;    // FK - Empresa
  createdAt: DateTime;  // Data de entrada no funil
}
```

### 4.2 Funcionalidades por Perfil

#### Administrador (ADMIN)
1. **Gestão de Usuários**
   - Criar novos trabalhadores
   - Definir permissões e papéis
   - Ativar/desativar usuários

2. **Configuração de Funis**
   - Criar novos funis de vendas
   - Definir etapas personalizadas
   - Configurar ordem das etapas

3. **Sistema de Lembretes**
   - Configurar regras automáticas por etapa
   - Definir prazo para contato (ex: 2 dias)
   - Visualizar lembretes pendentes

4. **Configurações da Empresa**
   - Alterar logo e cores
   - Configurar dados da clínica

#### Trabalhador (WORKER)
1. **Gestão de Leads**
   - Visualizar leads atribuídos
   - Mover leads entre etapas
   - Adicionar notas e observações
   - Marcar lembretes como concluídos

2. **Dashboard Pessoal**
   - Leads pendentes
   - Tarefas do dia
   - Lembretes ativos

### 4.3 Sistema de Lembretes

#### Como Funciona
1. **Configuração**: Admin define que na "Etapa X", trabalhador tem "Y dias" para contato
2. **Trigger**: Quando lead entra na etapa, sistema cria lembrete automático
3. **Cálculo**: `dueDate = dataEntradaNaEtapa + delayDays`
4. **Notificação**: Sistema notifica trabalhador responsável
5. **Conclusão**: Trabalhador marca como concluído

#### Exemplo Prático
```
Etapa: "Primeiro Contato"
Regra: 2 dias para contato
Lead entra em 01/01 → Lembrete para 03/01
```

### 4.4 Fluxo de Trabalho Típico

1. **Setup Inicial (Admin)**
   - Criar funil "Captação Ortodontia"
   - Etapas: "Lead Novo" → "Primeiro Contato" → "Agendamento" → "Consulta"
   - Regra: "Primeiro Contato" = 1 dia, "Agendamento" = 3 dias

2. **Operação Diária (Worker)**
   - Lead "João Silva" entra no funil
   - Sistema cria lembrete para amanhã
   - Trabalhador liga, adiciona nota, move para "Agendamento"
   - Novo lembrete criado para 3 dias

3. **Acompanhamento (Admin)**
   - Dashboard com leads por etapa
   - Relatório de conversão
   - Performance dos trabalhadores

---

## 5. Schema do Banco de Dados (Prisma)

### Relacionamentos Principais
- `Company` 1:N `User`, `Funnel`, `Lead`
- `User` 1:N `Lead` (responsável), `LeadNote`, `Reminder`
- `Funnel` 1:N `FunnelStep`, `Lead`
- `FunnelStep` 1:N `Lead`, `ReminderRule`
- `Lead` 1:N `LeadNote`, `Reminder`

### Índices Importantes
```sql
-- Performance para queries multi-tenant
CREATE INDEX idx_users_company_id ON "User"(company_id);
CREATE INDEX idx_leads_company_id ON "Lead"(company_id);
CREATE INDEX idx_leads_responsible ON "Lead"(responsible_id);
CREATE INDEX idx_reminders_due_date ON "Reminder"(due_date);
```

---

## 6. Roadmap de Desenvolvimento

### Sprint 1 (2 semanas) - Setup Base
- [ ] Configuração inicial NestJS + Next.js
- [ ] Setup Prisma + PostgreSQL
- [ ] Autenticação JWT
- [ ] CRUD básico de Company/User

### Sprint 2 (2 semanas) - Core CRM
- [ ] CRUD Funnel/FunnelStep
- [ ] CRUD Lead básico
- [ ] Sistema de atribuição

### Sprint 3 (2 semanas) - Sistema de Lembretes
- [ ] ReminderRule + Reminder
- [ ] Job queue com BullMQ
- [ ] Notificações básicas

### Sprint 4 (2 semanas) - Interface
- [ ] Dashboard para Admin
- [ ] Interface para Workers
- [ ] Sistema de notas

### Sprint 5 (1 semana) - White-label
- [ ] Sistema de theming
- [ ] Upload de logo
- [ ] Personalização de cores

---

## 7. Considerações Técnicas

### Segurança
- JWT com refresh token
- Row-level security no PostgreSQL
- Validação de company_id em todas as queries
- Rate limiting nas APIs

### Performance
- Índices otimizados para multi-tenant
- Cache com Redis
- Paginação em todas as listagens
- Lazy loading no frontend

### Escalabilidade
- Arquitetura preparada para microsserviços
- Filas para processamento assíncrono
- Possibilidade de sharding por company_id

### Observabilidade
- Logs estruturados
- Métricas de performance
- Monitoramento de erros
- Health checks

---

## 8. Próximos Passos

1. **Validação com Ianara Pinho**: Testar o CRM em produção
2. **Feedback e Ajustes**: Iterar baseado no uso real
3. **Primeiro Cliente White-label**: Validar modelo SaaS
4. **Desenvolvimento Módulo 2**: Agenda de dentistas
5. **Expansão**: Novos módulos conforme demanda

---

## 9. Estimativas

### Fase 1 - CRM Completo
**Tempo**: 8-10 semanas  
**Equipe**: 2 desenvolvedores  
**Entregáveis**: CRM funcional, white-label básico, deploy em produção

### Projeto Completo (8 módulos)
**Tempo**: 12-18 meses  
**Equipe**: 3-4 desenvolvedores  
**ROI**: Após 3º cliente white-label

---

*Este documento serve como especificação técnica detalhada para desenvolvimento e pode ser usado para briefing de novos desenvolvedores no projeto.*