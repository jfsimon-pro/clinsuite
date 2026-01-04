# Próximos Passos - IanaraERP 2026

> Documento criado em 30/12/2024  
> Última atualização: 30/12/2024

---

## ✅ Concluído (Dezembro 2024)

### Quick Wins Fase 1
- [x] **Tags Inteligentes**
  - Backend: modelo `Tag` e `TagOnLead` no Prisma
  - API: CRUD completo + associação tags-leads
  - Frontend: componente `LeadTags.tsx`
  - UI: badges no Kanban e painel de detalhes
  - Página: `/tags` para gerenciamento

- [x] **Dashboard de No-Show**
  - Endpoint: `GET /analytics/no-show`
  - Métricas: taxa geral, por dentista, por dia da semana, tendência mensal
  - Usa campo `compareceu` da tabela `Consulta`
  - MetricCard na página `/analytics`
  - Campo toggle no formulário de Nova Consulta

---

## 🔄 Pendente - Quick Wins (Prioridade Alta)

### 3. Round-Robin Funcional
**Estimativa:** 3-4 dias

**O que é:**
Distribuição automática de novos leads entre os responsáveis da equipe de vendas.

**Backend:**
- [ ] Campo `distributionMode` em `FunnelStep` (enum: `MANUAL`, `ROUND_ROBIN`, `LOAD_BALANCED`)
- [ ] Tabela `RoundRobinState` para rastrear último responsável atribuído
- [ ] Service `LeadDistributionService` com lógica de distribuição
- [ ] Hook no `CrmService.createLead()` para auto-atribuição
- [ ] Endpoint `GET/PUT /crm/steps/:id/distribution-settings`

**Frontend:**
- [ ] Configuração de distribuição nas settings da etapa do funil
- [ ] Opções: Manual, Round-Robin, Balanceamento por carga
- [ ] Indicador visual de distribuição ativa na etapa

---

### 4. Histórico WhatsApp no Lead
**Estimativa:** 3-4 dias

**O que é:**
Exibir todas as conversas do WhatsApp vinculadas ao número de telefone do lead.

**Backend:**
- [ ] Endpoint `GET /crm/leads/:id/whatsapp-messages`
- [ ] Query para buscar `WhatsAppMessage` pelo número do lead
- [ ] Paginação para conversas longas

**Frontend:**
- [ ] Nova aba "Conversas" no `LeadDetailPanel`
- [ ] Componente `LeadWhatsAppHistory.tsx`
- [ ] Timeline de mensagens com indicador de entrada/saída
- [ ] Link para abrir conversa completa no módulo WhatsApp

---

## 📊 Fase 2 - Módulo Financeiro Completo
**Estimativa:** 3-4 semanas

### 2.1 Contas a Pagar/Receber
- [ ] Modelo `ContaPagar` e `ContaReceber` no Prisma
- [ ] CRUD completo com categorias
- [ ] Parcelamento e recorrência
- [ ] Status: pendente, pago, vencido, cancelado
- [ ] Alertas de vencimento

### 2.2 Fluxo de Caixa
- [ ] Dashboard financeiro dedicado
- [ ] Gráfico de entradas x saídas por período
- [ ] Projeção de fluxo de caixa futuro
- [ ] Saldo por conta/unidade

### 2.3 Comissões
- [ ] Tabela de regras de comissão por colaborador
- [ ] Cálculo automático baseado em vendas fechadas
- [ ] Relatório de comissões por período
- [ ] Integração com folha de pagamento (futuro)

### 2.4 Integrações Bancárias
- [ ] Importação de extratos OFX/CSV
- [ ] Conciliação bancária semi-automática
- [ ] Alertas de divergência

---

## 🤖 Fase 3 - IA para Vendas
**Estimativa:** 4-6 semanas

### 3.1 Lead Scoring Automático
- [ ] Modelo de ML para prever probabilidade de conversão
- [ ] Features: tempo de resposta, engajamento, histórico
- [ ] Score exibido no card do lead (0-100)
- [ ] Ordenação por score no Kanban

### 3.2 Previsão de Fechamento
- [ ] Análise de padrões de fechamento por procedimento
- [ ] Previsão de data provável de fechamento
- [ ] Alertas de leads "esfriando"

### 3.3 Chatbot de Qualificação
- [ ] Integração com WhatsApp Oficial
- [ ] Fluxo de qualificação automático
- [ ] Handoff para humano quando necessário
- [ ] Templates de resposta por contexto

### 3.4 Análise de Sentimento
- [ ] NLP nas mensagens de WhatsApp
- [ ] Detecção de objeções e interesse
- [ ] Sugestões de próximas ações

---

## ⚡ Fase 4 - Automações Avançadas
**Estimativa:** 2-3 semanas

### 4.1 Workflows Visuais
- [ ] Editor drag-and-drop de automações
- [ ] Triggers: novo lead, mudança de etapa, data, inatividade
- [ ] Actions: enviar mensagem, criar tarefa, mover lead, notificar

### 4.2 Campanhas de Remarketing
- [ ] Sequências de mensagens automáticas
- [ ] Reativação de leads inativos
- [ ] Templates por procedimento

### 4.3 Notificações Inteligentes
- [ ] Push notifications mobile (futuro)
- [ ] Email digest diário/semanal
- [ ] Webhooks para integrações externas

---

## 📈 Fase 5 - BI Avançado
**Estimativa:** 2-3 semanas

### 5.1 CAC e LTV
- [ ] Custo de Aquisição por Cliente
- [ ] Lifetime Value por paciente
- [ ] ROI por canal de marketing

### 5.2 Cohorts de Pacientes
- [ ] Análise de retenção por período de entrada
- [ ] Taxa de retorno por tipo de procedimento

### 5.3 Relatórios Personalizados
- [ ] Builder de relatórios drag-and-drop
- [ ] Agendamento de relatórios por email
- [ ] Export PDF/Excel

---

## 🔒 Fase 6 - LGPD e Compliance
**Estimativa:** 1-2 semanas

- [ ] Consentimento de dados nos leads
- [ ] Exportação de dados do paciente (portabilidade)
- [ ] Exclusão de dados (direito ao esquecimento)
- [ ] Log de auditoria de acessos
- [ ] Termos de uso atualizados

---

## 🎨 Fase 7 - UX/UI Polish
**Estimativa:** Contínuo

- [ ] Dark mode completo
- [ ] Atalhos de teclado
- [ ] Tour guiado para novos usuários
- [ ] Melhorias de acessibilidade
- [ ] PWA mobile

---

## 📅 Timeline Sugerida

| Mês | Foco |
|-----|------|
| **Janeiro 2026** | Round-Robin + Histórico WhatsApp |
| **Fevereiro 2026** | Módulo Financeiro (parte 1) |
| **Março 2026** | Módulo Financeiro (parte 2) + BI |
| **Abril 2026** | IA para Vendas (Lead Scoring) |
| **Maio 2026** | Automações Avançadas |
| **Junho 2026** | LGPD + Polish UX |

---

## 📝 Notas

- Priorizar funcionalidades que impactam diretamente o faturamento
- Manter releases pequenos e frequentes
- Coletar feedback dos usuários após cada release
- Documentar APIs para futuras integrações
