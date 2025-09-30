# Roadmap Detalhado - CRM com White-label

## 📋 Visão Geral do Roadmap

**Objetivo**: Desenvolver o módulo CRM completo com sistema white-label funcional  
**Duração Total**: 10-12 semanas  
**Entregas**: CRM operacional + Personalização completa da marca  

---

## 🏗️ Fase 1: Fundação do Sistema (Semanas 1-2)

### Sprint 1.1 - Setup Inicial e Autenticação (Semana 1)
**Objetivo**: Criar a base do sistema com autenticação segura

#### Backend (NestJS)
- [ ] **Setup inicial do projeto NestJS**
  - Configuração TypeScript
  - Estrutura de pastas modular
  - Variáveis de ambiente
  

- [ ] **Configuração Prisma**
  - Schema inicial (Company, User)
  - Migrations
  - Seed para dados de teste

- [ ] **Sistema de Autenticação**
  - Módulo Auth com JWT
  - Guards para proteção de rotas
  - Refresh token strategy
  - Middleware de validação de company_id

#### Frontend (Next.js)
- [ ] **Setup inicial do projeto Next.js**
  - App Router configurado
  - TailwindCSS + ShadCN UI
  - Estrutura de pastas organizada

- [ ] **Autenticação Frontend**
  - NextAuth.js configurado
  - Páginas de login/registro
  - Context de autenticação
  - Middleware de proteção

**Entregável**: Sistema de login funcionando com isolamento por empresa

---

### Sprint 1.2 - Core Multi-tenant + White-label Base (Semana 2)
**Objetivo**: Implementar isolamento de dados e personalização básica

#### Backend
- [ ] **Sistema Multi-tenant**
  - Middleware de extração de company_id
  - Service base com filtros automáticos
  - Validações de segurança
  - Testes unitários

- [ ] **CRUD Company**
  - Controller de empresas
  - Validações (CNPJ, email único)
  - Upload de arquivos (multer)
  - Service de validação de domínio

#### Frontend
- [ ] **Sistema de Theming**
  - Provider de tema com Context
  - CSS variables dinâmicas
  - Hook useTheme personalizado
  - Componentes temáticos base

- [ ] **Configurações da Empresa**
  - Página de configurações
  - Upload de logo
  - Seletor de cores
  - Preview em tempo real

**Entregável**: Empresa pode alterar logo e cores, mudanças refletem no sistema

---

## 🎯 Fase 2: CRM Core (Semanas 3-5)

### Sprint 2.1 - Funis e Etapas (Semana 3)
**Objetivo**: Sistema de funis configuráveis

#### Backend
- [ ] **CRUD Funnel**
  - Controller de funis
  - Validações de negócio
  - Soft delete
  - Filtros por empresa

- [ ] **CRUD FunnelStep**
  - Ordenação automática
  - Validação de etapas únicas
  - Reordenação drag-and-drop
  - Dependências entre etapas

#### Frontend
- [ ] **Interface de Funis**
  - Lista de funis da empresa
  - Modal de criação/edição
  - Arrastar e soltar etapas
  - Validações em tempo real

- [ ] **Configuração de Etapas**
  - CRUD de etapas
  - Reordenação visual
  - Preview do funil
  - Ações em lote

**Entregável**: Admin pode criar e configurar funis personalizados

---

### Sprint 2.2 - Gestão de Leads (Semana 4)
**Objetivo**: CRUD completo de leads com atribuição

#### Backend
- [ ] **CRUD Lead**
  - Controller de leads
  - Validação de telefone/email
  - Sistema de busca/filtros
  - Paginação otimizada

- [ ] **Sistema de Atribuição**
  - Atribuição manual
  - Atribuição automática (round-robin)
  - Reatribuição de leads
  - Histórico de mudanças

#### Frontend
- [ ] **Dashboard de Leads**
  - Tabela com filtros avançados
  - Kanban board por etapas
  - Busca em tempo real
  - Ações em lote

- [ ] **Detalhes do Lead**
  - Modal/página de detalhes
  - Histórico de interações
  - Mudança de etapa
  - Atribuição de responsável

**Entregável**: Sistema completo de gestão de leads operacional

---

### Sprint 2.3 - Notas e Observações (Semana 5)
**Objetivo**: Sistema de anotações e histórico

#### Backend
- [ ] **CRUD LeadNote**
  - Controller de notas
  - Versionamento de edições
  - Anexos de arquivos
  - Mentions de usuários

- [ ] **Sistema de Atividades**
  - Log de todas as ações
  - Timeline de eventos
  - Filtros por tipo de atividade
  - Export de histórico

#### Frontend
- [ ] **Interface de Notas**
  - Editor rich text
  - Upload de anexos
  - Mentions com @usuario
  - Histórico cronológico

- [ ] **Timeline de Atividades**
  - Componente timeline
  - Filtros por período
  - Diferentes tipos de evento
  - Exportação de relatórios

**Entregável**: Sistema completo de anotações e histórico de leads

---

## ⏰ Fase 3: Sistema de Lembretes (Semanas 6-7)

### Sprint 3.1 - Regras e Jobs (Semana 6)
**Objetivo**: Sistema automático de lembretes

#### Backend
- [ ] **Sistema de Regras**
  - CRUD ReminderRule
  - Validação de regras
  - Múltiplas regras por etapa
  - Configuração de tipos de lembrete

- [ ] **Job Queue System**
  - BullMQ configurado
  - Job de criação de lembretes
  - Job de notificações
  - Dashboard de monitoramento

- [ ] **Processor de Lembretes**
  - Lógica de cálculo de datas
  - Criação automática
  - Reagendamento automático
  - Tratamento de erros

#### Frontend
- [ ] **Configuração de Regras**
  - Interface para criar regras
  - Preview de funcionamento
  - Teste de regras
  - Ativação/desativação

**Entregável**: Lembretes são criados automaticamente baseado nas regras

---

### Sprint 3.2 - Interface de Lembretes (Semana 7)
**Objetivo**: Dashboard e gestão de lembretes

#### Backend
- [ ] **API de Lembretes**
  - Listar lembretes pendentes
  - Marcar como concluído
  - Reagendar lembrete
  - Estatísticas de conclusão

#### Frontend
- [ ] **Dashboard de Lembretes**
  - Lista de pendências
  - Lembretes por usuário
  - Calendário de lembretes
  - Notificações push

- [ ] **Gestão de Lembretes**
  - Marcar como concluído
  - Adicionar notas na conclusão
  - Reagendar para outro dia
  - Delegar para outro usuário

**Entregável**: Sistema completo de lembretes funcionando

---

## 🎨 Fase 4: White-label Avançado (Semanas 8-9)

### Sprint 4.1 - Personalização Avançada (Semana 8)
**Objetivo**: Personalização completa da interface

#### Backend
- [ ] **Sistema de Temas**
  - CRUD de configurações visuais
  - Validação de cores (contraste)
  - Preset de temas pré-definidos
  - API de configurações

- [ ] **Upload Avançado**
  - Redimensionamento de imagens
  - Múltiplos formatos de logo
  - Favicon personalizado
  - Validação de arquivos

#### Frontend
- [ ] **Configurador Visual**
  - Seletor de cores avançado
  - Preview em tempo real
  - Diferentes áreas (sidebar, header, buttons)
  - Reset para padrão

- [ ] **Componentes Temáticos**
  - Todos os componentes responsivos ao tema
  - Dark/light mode automático
  - Animações suaves de transição
  - Fallbacks para cores inválidas

**Entregável**: Personalização visual completa e profissional

---

### Sprint 4.2 - Multi-domínio e Branding (Semana 9)
**Objetivo**: Sistema completo de white-label

#### Backend
- [ ] **Multi-domínio**
  - Middleware de detecção de domínio
  - Configuração por empresa
  - SSL automático (se possível)
  - Redirecionamentos inteligentes

- [ ] **Branding Completo**
  - Nome da empresa em todos os lugares
  - Emails personalizados
  - Rodapé customizável
  - Meta tags por empresa

#### Frontend
- [ ] **Interface Personalizada**
  - Título da página dinâmico
  - Favicon por empresa
  - Loading screens personalizados
  - Error pages temáticas

- [ ] **Configurações Avançadas**
  - Configuração de domínio personalizado
  - Configuração de emails
  - Termos de uso personalizados
  - Configurações de SEO

**Entregável**: Sistema 100% white-label funcionando

---

## 📊 Fase 5: Dashboard e Relatórios (Semana 10)

### Sprint 5.1 - Analytics e Dashboards
**Objetivo**: Dashboards com métricas importantes

#### Backend
- [ ] **Sistema de Métricas**
  - Cálculo de conversão por funil
  - Performance por usuário
  - Tempo médio por etapa
  - Relatórios automáticos

#### Frontend
- [ ] **Dashboard Executivo**
  - Gráficos de conversão
  - Métricas principais (KPIs)
  - Comparativo de períodos
  - Export de relatórios

- [ ] **Dashboard do Usuário**
  - Leads atribuídos
  - Lembretes do dia
  - Performance pessoal
  - Metas e objetivos

**Entregável**: Dashboards completos com métricas relevantes

---

## 🚀 Fase 6: Finalização e Deploy (Semanas 11-12)

### Sprint 6.1 - Testes e Otimização (Semana 11)
- [ ] **Testes Automatizados**
  - Testes unitários (backend)
  - Testes de integração
  - Testes E2E (playwright)
  - Coverage reports

- [ ] **Otimização de Performance**
  - Otimização de queries
  - Cache strategies
  - Lazy loading
  - Bundle optimization

### Sprint 6.2 - Deploy e Documentação (Semana 12)
- [ ] **Deploy em Produção**
  - CI/CD pipeline
  - Monitoramento
  - Backup automático
  - SSL e segurança

- [ ] **Documentação**
  - Manual do usuário
  - Documentação técnica
  - API documentation
  - Troubleshooting guide

**Entregável**: Sistema completo em produção com documentação

---

## 🎯 Milestones Principais

| Semana | Milestone | Descrição |
|--------|-----------|-----------|
| 2 | **MVP Auth** | Login funcionando com white-label básico |
| 5 | **CRM Core** | Funis, leads e notas operacionais |
| 7 | **Lembretes** | Sistema automático funcionando |
| 9 | **White-label** | Personalização completa |
| 10 | **Analytics** | Dashboards e relatórios |
| 12 | **Produção** | Sistema completo no ar |

---

## 📝 Critérios de Sucesso

### Funcionalidades Obrigatórias
- [ ] Admin pode criar funis e etapas
- [ ] Leads movem entre etapas
- [ ] Lembretes automáticos funcionam
- [ ] Sistema multi-tenant seguro
- [ ] White-label completo (logo, cores, nome)
- [ ] Dashboard com métricas básicas

### Qualidade Técnica
- [ ] Cobertura de testes > 80%
- [ ] Performance < 2s loading time
- [ ] Segurança (JWT, validações)
- [ ] Responsivo (mobile-first)
- [ ] Acessibilidade básica

### White-label Requirements
- [ ] Upload de logo funcionando
- [ ] Personalização de cores
- [ ] Nome da empresa em todo sistema
- [ ] Preview em tempo real
- [ ] Reset para configurações padrão

---

## 🚨 Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Complexidade do theming | Média | Alto | Começar simples, iterar |
| Performance multi-tenant | Baixa | Alto | Testes de carga cedo |
| Segurança company_id | Baixa | Crítico | Review de código rigoroso |
| UX do white-label | Média | Médio | Testes com usuários reais |

---

## ✅ Definition of Done

Cada sprint é considerado completo quando:
- [ ] Funcionalidades implementadas e testadas
- [ ] Testes automatizados escritos
- [ ] Code review aprovado
- [ ] Documentação atualizada
- [ ] Deploy em ambiente de desenvolvimento
- [ ] Validação com stakeholder (se aplicável)

---

*Este roadmap é iterativo e pode ser ajustado baseado nos feedbacks e descobertas durante o desenvolvimento.*