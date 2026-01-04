# 🗺️ ROADMAP DE IMPLEMENTAÇÃO - IanaraERP

**Data:** 30/12/2024  
**Baseado em:** Análise do sistema atual vs Checklist estratégico do cliente  
**Objetivo:** Tornar o IanaraERP líder de mercado para clínicas odontológicas

---

## 📊 RESUMO EXECUTIVO

| Categoria | % Implementado | Status |
|-----------|:--------------:|--------|
| CRM Core | 70% | 🟡 Parcial |
| IA para Vendas | 15% | 🔴 Crítico |
| Pré-venda Centralizada | 40% | 🟡 Parcial |
| Automação/Reativação | 30% | 🟡 Parcial |
| BI (Business Intelligence) | 60% | 🟡 Parcial |
| Financeiro | 30% | 🔴 Crítico |
| Gestão Clínica | 85% | 🟢 Bom |
| Governança/LGPD | 50% | 🟡 Parcial |
| UX/Experiência | 50% | 🟡 Parcial |

---

## 🎯 METODOLOGIA DE PRIORIZAÇÃO

Cada item foi classificado por:
- **Impacto no Negócio:** Alto/Médio/Baixo
- **Esforço de Implementação:** 1-5 (1=fácil, 5=complexo)
- **Quick Win:** ⭐ = alta prioridade (alto impacto, baixo esforço)

---

# 📅 FASE 1: QUICK WINS (Semanas 1-4)
> Funcionalidades de alto impacto com baixo esforço

## 1.1 Tags Inteligentes para Leads ⭐
**Status:** ❌ NÃO EXISTE  
**Impacto:** Alto | **Esforço:** 1

### O que implementar:
- Modelo `Tag` no Prisma (id, name, color, companyId)
- Relação many-to-many `Lead <-> Tag`
- UI para criar/atribuir tags
- Filtros por tags no Kanban

### Arquivos a modificar:
- `backend/prisma/schema.prisma`
- `backend/src/modules/crm/crm.controller.ts`
- `frontend/src/components/LeadDetailPanel.tsx`
- `frontend/src/app/funnels/page.tsx`

### Estimativa: 3-5 dias

---

## 1.2 Taxa de No-Show (Comparecimento) ⭐
**Status:** ⚠️ DADOS EXISTEM, FALTA DASHBOARD  
**Impacto:** Alto | **Esforço:** 1

### O que implementar:
- Endpoint `GET /analytics/no-show`
- Widget no dashboard com taxa de no-show
- Filtros por período, dentista, unidade
- Campo `motivoNaoComparecimento` no Lead

### Arquivos a modificar:
- `backend/src/modules/crm/analytics.service.ts`
- `backend/src/modules/crm/analytics.controller.ts`
- `frontend/src/app/analytics/page.tsx`

### Estimativa: 2-3 dias

---

## 1.3 Distribuição Automática Round-Robin ⭐
**Status:** ⚠️ SCHEMA EXISTE, NÃO IMPLEMENTADO  
**Impacto:** Alto | **Esforço:** 2

### O que implementar:
- Lógica de distribuição no `task-automation.service.ts`
- Configuração por funil/etapa
- Considerar carga de trabalho atual do usuário
- Log de distribuição

### Arquivos existentes com estrutura:
- `backend/prisma/schema.prisma` → `AssignType.ROUND_ROBIN` ✅ existe
- `backend/src/modules/crm/stage-task-rule.service.ts`

### Estimativa: 3-4 dias

---

## 1.4 Histórico de WhatsApp no Lead ⭐
**Status:** ⚠️ DADOS EXISTEM, NÃO UNIFICADOS  
**Impacto:** Alto | **Esforço:** 2

### O que implementar:
- Tab "Conversas" no LeadDetailPanel
- Query para buscar mensagens do número do lead
- Vinculação Lead <-> WhatsAppChat

### Arquivos a modificar:
- `frontend/src/components/LeadDetailPanel.tsx`
- `backend/src/modules/crm/crm.service.ts`
- `backend/src/modules/whatsapp/whatsapp.service.ts`

### Estimativa: 3-4 dias

---

## 1.5 Auditoria de Ações (Logs)
**Status:** ❌ NÃO EXISTE  
**Impacto:** Médio | **Esforço:** 2

### O que implementar:
```prisma
model AuditLog {
  id        String   @id @default(uuid())
  userId    String
  action    String   // CREATE, UPDATE, DELETE
  entity    String   // Lead, Consulta, etc
  entityId  String
  oldData   Json?
  newData   Json?
  ipAddress String?
  createdAt DateTime @default(now())
}
```

### Estimativa: 4-5 dias

---

# 📅 FASE 2: MÓDULO FINANCEIRO COMPLETO (Semanas 5-10)
> Gap crítico identificado

## 2.1 Contas a Pagar
**Status:** ❌ NÃO EXISTE  
**Impacto:** Alto | **Esforço:** 4

### O que implementar:
```prisma
model ContaPagar {
  id            String   @id @default(uuid())
  descricao     String
  valor         Decimal
  fornecedorId  String?
  categoria     String   // ALUGUEL, SALARIO, MATERIAL, etc
  dataVencimento DateTime
  dataPagamento DateTime?
  status        StatusConta @default(PENDENTE)
  companyId     String
  unitId        String?
  recorrente    Boolean  @default(false)
  frequencia    Frequencia?
}
```

- CRUD completo
- Alertas de vencimento
- Relatórios

### Estimativa: 10-12 dias

---

## 2.2 Dashboard Financeiro Completo
**Status:** ⚠️ PARCIAL  
**Impacto:** Alto | **Esforço:** 3

### O que implementar:
- Gráfico de Fluxo de Caixa (entradas x saídas)
- Projeção financeira 30/60/90 dias
- Consolidado por unidade
- Alertas de inadimplência

### Estimativa: 5-7 dias

---

## 2.3 Sistema de Comissões
**Status:** ❌ NÃO EXISTE  
**Impacto:** Alto | **Esforço:** 4

### O que implementar:
```prisma
model RegraComissao {
  id          String   @id @default(uuid())
  userId      String
  tipoCalculo TipoComissao // PERCENTUAL, FIXO, ESCALONADO
  percentual  Float?
  valorFixo   Decimal?
  escala      Json?    // Para comissões escalonadas
  companyId   String
}

model Comissao {
  id          String   @id @default(uuid())
  userId      String
  leadId      String?
  valor       Decimal
  referencia  DateTime // Mês de referência
  status      StatusComissao @default(PENDENTE)
  dataPagamento DateTime?
}
```

### Estimativa: 8-10 dias

---

## 2.4 Integração Bancária (Open Finance)
**Status:** ❌ NÃO EXISTE  
**Impacto:** Médio | **Esforço:** 5

### O que implementar:
- Integração com API Pluggy ou similar
- Conciliação automática
- Importação de extratos

### Estimativa: 12-15 dias (dependência externa)

---

# 📅 FASE 3: IA PARA VENDAS (Semanas 11-16)
> Diferencial competitivo forte

## 3.1 Sistema de Alertas Avançados
**Status:** ⚠️ BÁSICO EXISTE  
**Impacto:** Alto | **Esforço:** 2

### Expandir para:
- "Lead quente sem contato há X horas" (personalizar X)
- "Paciente com alta chance de no-show"
- "Orçamento vencendo em X dias"
- Notificações push/email

### Estimativa: 5-7 dias

---

## 3.2 Score de Probabilidade de Fechamento
**Status:** ❌ NÃO EXISTE  
**Impacto:** Alto | **Esforço:** 4

### O que implementar:
- Modelo preditivo baseado em:
  - Histórico de conversão
  - Tempo em cada etapa
  - Valor do orçamento
  - Meio de captação
  - Tipo de procedimento
- Score 0-100 no Lead
- Dashboard de leads "quentes"

### Estimativa: 10-12 dias

---

## 3.3 Sugestão de Abordagem com IA
**Status:** ❌ NÃO EXISTE  
**Impacto:** Alto | **Esforço:** 5

### O que implementar:
- Integração com OpenAI/Claude API
- Contexto: perfil do lead, histórico, procedimento
- Sugestão de script de abordagem
- Sugestão de melhor horário para contato

### Estimativa: 12-15 dias

---

## 3.4 Detecção de Objeções
**Status:** ❌ NÃO EXISTE  
**Impacto:** Médio | **Esforço:** 4

### O que implementar:
- Análise das notas/mensagens do lead
- Identificação de padrões (preço, tempo, medo)
- Sugestão de contra-argumentos
- Dashboard de objeções mais comuns

### Estimativa: 8-10 dias

---

# 📅 FASE 4: AUTOMAÇÃO E REATIVAÇÃO (Semanas 17-22)
> "Máquina de dinheiro"

## 4.1 Segmentação Automática de Base
**Status:** ❌ NÃO EXISTE  
**Impacto:** Alto | **Esforço:** 3

### O que implementar:
Segmentos automáticos:
- Pacientes sem retorno há X meses
- Orçamentos não fechados há X dias
- Tratamentos incompletos
- Aniversariantes do mês

```prisma
model Segmento {
  id        String   @id @default(uuid())
  nome      String
  filtros   Json     // Condições do segmento
  autoUpdate Boolean @default(true)
  companyId String
}
```

### Estimativa: 7-10 dias

---

## 4.2 Jornadas de Automação Completas
**Status:** ⚠️ PLANEJADO, NÃO IMPLEMENTADO  
**Impacto:** Alto | **Esforço:** 5

### O que implementar:
Implementar o que está descrito em `AUTOMACAO.md`:
- Modelo `AutomationRule`
- Modelo `AutomationAction`
- Processador de automações (CRON)
- Interface visual para criar jornadas

### Arquivos base já existentes:
- `backend/src/modules/crm/task-automation.service.ts` ✅
- Estrutura em `AUTOMACAO.md` ✅

### Estimativa: 15-20 dias

---

## 4.3 Confirmação Automática de Consultas
**Status:** ❌ NÃO EXISTE  
**Impacto:** Alto | **Esforço:** 3

### O que implementar:
- Job para disparar 48h e 24h antes
- Template de WhatsApp para confirmação
- Botões de resposta (Confirmo/Reagendar)
- Atualização automática do status

### Estimativa: 5-7 dias

---

## 4.4 Dashboard de ROI de Reativação
**Status:** ❌ NÃO EXISTE  
**Impacto:** Médio | **Esforço:** 2

### O que implementar:
- Receita gerada por campanhas de reativação
- Comparativo investimento x retorno
- Gráficos de efetividade por canal

### Estimativa: 4-5 dias

---

# 📅 FASE 5: BI E ANALYTICS AVANÇADOS (Semanas 23-26)
> Visão de CEO

## 5.1 KPIs de Marketing
**Status:** ❌ NÃO EXISTE  
**Impacto:** Alto | **Esforço:** 3

### O que implementar:
```prisma
model InvestimentoMarketing {
  id          String   @id @default(uuid())
  canal       MeioCaptacao
  valor       Decimal
  periodo     DateTime // Mês de referência
  companyId   String
}
```

KPIs calculados:
- CAC por canal (Custo de Aquisição)
- CPL (Custo por Lead)
- CPA (Custo por Aquisição cliente)
- ROI por campanha

### Estimativa: 8-10 dias

---

## 5.2 LTV (Lifetime Value) do Paciente
**Status:** ❌ NÃO EXISTE  
**Impacto:** Alto | **Esforço:** 3

### O que implementar:
- Soma de todos os pagamentos do paciente
- Projeção baseada em histórico
- Segmentação por perfil de LTV

### Estimativa: 5-7 dias

---

## 5.3 Relatórios Exportáveis
**Status:** ❌ NÃO EXISTE  
**Impacto:** Médio | **Esforço:** 3

### O que implementar:
- Exportação PDF com layout profissional
- Exportação Excel com dados detalhados
- Agendamento de relatórios automáticos

### Estimativa: 7-10 dias

---

## 5.4 Comparativo Multi-período
**Status:** ⚠️ ESTRUTURA EXISTE  
**Impacto:** Médio | **Esforço:** 2

### O que implementar:
- Comparar mês atual vs anterior
- Comparar ano atual vs anterior
- Gráficos de tendência

### Estimativa: 3-5 dias

---

# 📅 FASE 6: GOVERNANÇA E LGPD (Semanas 27-28)
> Obrigatório por lei

## 6.1 Consentimento LGPD
**Status:** ❌ NÃO EXISTE  
**Impacto:** Alto (legal) | **Esforço:** 3

### O que implementar:
```prisma
model Consentimento {
  id            String   @id @default(uuid())
  leadId        String
  tipo          TipoConsentimento // MARKETING, DADOS_SENSIVEIS
  concedido     Boolean
  dataAceite    DateTime?
  dataRevogacao DateTime?
  ipAddress     String?
}
```

### Estimativa: 5-7 dias

---

## 6.2 Opt-out de Comunicações
**Status:** ❌ NÃO EXISTE  
**Impacto:** Alto | **Esforço:** 2

### O que implementar:
- Campo `aceitaComunicacao` no Lead
- Link para descadastramento
- Verificação antes de enviar mensagens

### Estimativa: 2-3 dias

---

# 📅 FASE 7: UX E EXPERIÊNCIA (Semanas 29-32)
> Crítico para adoção

## 7.1 Onboarding Guiado
**Status:** ❌ NÃO EXISTE  
**Impacto:** Médio | **Esforço:** 3

### O que implementar:
- Tour guiado para novos usuários
- Checklist de configuração inicial
- Vídeos tutoriais embutidos
- Tooltips contextuais

### Estimativa: 7-10 dias

---

## 7.2 PWA e Mobile-First
**Status:** ⚠️ PARCIAL  
**Impacto:** Médio | **Esforço:** 4

### O que implementar:
- Manifest.json para PWA
- Service Worker para offline
- Otimização de layout mobile
- Push notifications

### Estimativa: 10-12 dias

---

## 7.3 Performance e Cache
**Status:** ⚠️ BÁSICO  
**Impacto:** Médio | **Esforço:** 3

### O que implementar:
- Redis para cache de queries frequentes
- Lazy loading de componentes
- Otimização de bundle
- CDN para assets

### Estimativa: 5-7 dias

---

# 📊 CRONOGRAMA CONSOLIDADO

| Fase | Semanas | Foco | Prioridade |
|------|---------|------|------------|
| **Fase 1** | 1-4 | Quick Wins | 🔴 CRÍTICA |
| **Fase 2** | 5-10 | Financeiro Completo | 🔴 CRÍTICA |
| **Fase 3** | 11-16 | IA para Vendas | 🟡 ALTA |
| **Fase 4** | 17-22 | Automação/Reativação | 🟡 ALTA |
| **Fase 5** | 23-26 | BI Avançado | 🟢 MÉDIA |
| **Fase 6** | 27-28 | LGPD | 🟡 ALTA |
| **Fase 7** | 29-32 | UX/Performance | 🟢 MÉDIA |

**Total estimado:** 8 meses (32 semanas)

---

# ✅ CHECKLIST DE FUNCIONALIDADES

## JÁ TEMOS ✅
- [x] Pipeline/Funis configuráveis
- [x] Sistema de leads completo
- [x] Histórico de atendimentos
- [x] Prontuário eletrônico
- [x] Odontograma
- [x] Prescrições
- [x] Pagamentos por paciente
- [x] WhatsApp (oficial + Baileys)
- [x] Sistema de tarefas automáticas
- [x] Alertas básicos
- [x] Analytics básicos
- [x] Multi-tenant/White-label
- [x] Portal do Paciente básico
- [x] Gestão de unidades

## PRECISAMOS IMPLEMENTAR ❌
- [ ] Tags inteligentes
- [ ] Taxa de no-show
- [ ] Round-robin funcional
- [ ] Histórico WhatsApp no lead
- [ ] Auditoria de ações
- [ ] Contas a pagar
- [ ] Fluxo de caixa completo
- [ ] Sistema de comissões
- [ ] Integração bancária
- [ ] Score de fechamento (IA)
- [ ] Sugestões de abordagem (IA)
- [ ] Detecção de objeções
- [ ] Segmentação automática
- [ ] Jornadas de automação
- [ ] Confirmação automática de consultas
- [ ] KPIs de Marketing (CAC/CPL)
- [ ] LTV do paciente
- [ ] Relatórios exportáveis
- [ ] LGPD/Consentimento
- [ ] Opt-out de comunicações
- [ ] Onboarding guiado
- [ ] PWA/Mobile-first

---

# 💰 ESTIMATIVA DE ESFORÇO

| Fase | Dias úteis | Devs Necessários |
|------|------------|------------------|
| Fase 1 | ~20 dias | 1-2 devs |
| Fase 2 | ~40 dias | 2 devs |
| Fase 3 | ~45 dias | 2 devs + IA |
| Fase 4 | ~35 dias | 2 devs |
| Fase 5 | ~25 dias | 1-2 devs |
| Fase 6 | ~10 dias | 1 dev |
| Fase 7 | ~30 dias | 1-2 devs |
| **TOTAL** | **~205 dias** | **2 devs full-time** |

---

# 🎯 PRIORIZAÇÃO SUGERIDA (MVP++)

Se precisar entregar rápido, priorize:

## Sprint 1 (2 semanas)
1. ⭐ Tags inteligentes
2. ⭐ Taxa de no-show
3. ⭐ Histórico WhatsApp no lead

## Sprint 2 (3 semanas)
1. ⭐ Round-robin
2. Auditoria básica
3. Confirmação automática de consultas

## Sprint 3 (4 semanas)
1. Contas a pagar/receber
2. Dashboard financeiro

## Sprint 4 (4 semanas)
1. Sistema de comissões
2. Jornadas de automação

---

*Documento gerado em 30/12/2024*
*Baseado na análise do código-fonte atual e requisitos do cliente*
