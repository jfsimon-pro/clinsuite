# 🎯 Funcionalidade de Funis - Ianara ERP

## 📋 Visão Geral

Implementamos a funcionalidade completa de **Gestão de Funis de Vendas** no módulo CRM do Ianara ERP. Esta funcionalidade permite criar e gerenciar funis personalizados com etapas configuráveis, similar à interface mostrada na imagem de referência.

## ✨ Funcionalidades Implementadas

### Backend (NestJS)
- ✅ **CRUD completo de Funis**
  - Criar, listar, atualizar e deletar funis
  - Validação multi-tenant (cada empresa vê apenas seus funis)
  - Proteção contra deleção de funis com leads

- ✅ **CRUD completo de Etapas**
  - Criar, atualizar e deletar etapas dentro de funis
  - Sistema de ordenação automática
  - Validação de etapas únicas por ordem

- ✅ **API RESTful**
  - Endpoints protegidos com JWT
  - Validação de company_id em todas as operações
  - Respostas estruturadas com relacionamentos

### Frontend (Next.js)
- ✅ **Interface de Gestão de Funis**
  - Lista de funis da empresa
  - Seleção e visualização de funis
  - Modal para criar novos funis

- ✅ **Kanban Board de Etapas**
  - Visualização em colunas (similar à imagem)
  - Barras coloridas por etapa
  - Contador de leads por etapa
  - Área de "adição rápida"

- ✅ **Navegação Integrada**
  - Sidebar com menu completo
  - Links para todas as funcionalidades
  - Indicadores de notificações

## 🚀 Como Usar

### 1. Acessar a Funcionalidade
1. Faça login no sistema
2. Clique em "Funis" no menu lateral
3. Você verá a interface de gestão de funis

### 2. Criar um Novo Funil
1. Clique no botão "Novo Funil" no header
2. Digite o nome do funil
3. Clique em "Criar"

### 3. Adicionar Etapas
1. Selecione um funil da lista lateral
2. Clique em "Nova Etapa"
3. Digite o nome da etapa
4. Clique em "Adicionar"

### 4. Visualizar o Kanban
- As etapas aparecem como colunas
- Cada coluna mostra:
  - Nome da etapa
  - Número da ordem
  - Barra colorida (azul, amarelo, verde, roxo)
  - Contador de leads (0 por enquanto)
  - Área de "adição rápida"

## 🔧 Endpoints da API

### Funis
```
POST   /crm/funnels          - Criar funil
GET    /crm/funnels          - Listar funis da empresa
GET    /crm/funnels/:id      - Buscar funil específico
PUT    /crm/funnels/:id      - Atualizar funil
DELETE /crm/funnels/:id      - Deletar funil
```

### Etapas
```
POST   /crm/funnels/:id/steps     - Criar etapa
PUT    /crm/steps/:id              - Atualizar etapa
DELETE /crm/steps/:id              - Deletar etapa
PUT    /crm/funnels/:id/reorder    - Reordenar etapas
```

## 🎨 Interface Visual

### Cores das Etapas
- **1ª Etapa**: Azul (#3B82F6)
- **2ª Etapa**: Amarelo (#EAB308)
- **3ª Etapa**: Verde (#22C55E)
- **4ª+ Etapas**: Roxo (#A855F7)

### Layout Responsivo
- **Desktop**: Grid de 4 colunas
- **Tablet**: Grid de 3 colunas
- **Mobile**: Grid de 1-2 colunas

## 🔒 Segurança

- ✅ **Multi-tenant**: Cada empresa vê apenas seus dados
- ✅ **JWT Authentication**: Todas as rotas protegidas
- ✅ **Validação**: Dados validados antes de salvar
- ✅ **Integridade**: Proteção contra deleção de dados em uso

## 📊 Próximos Passos

### Sprint 2.2 - Gestão de Leads
- [ ] CRUD de leads
- [ ] Mover leads entre etapas
- [ ] Atribuição de responsáveis
- [ ] Sistema de busca e filtros

### Sprint 2.3 - Sistema de Lembretes
- [ ] Configuração de regras automáticas
- [ ] Criação automática de lembretes
- [ ] Dashboard de lembretes pendentes

## 🐛 Troubleshooting

### Problema: Erro de autenticação
```bash
# Verificar se o token está válido
# Fazer logout e login novamente
```

### Problema: Funis não aparecem
```bash
# Verificar se o backend está rodando
# Verificar se o banco tem dados
# Executar: npm run seed
```

### Problema: Erro de CORS
```bash
# Verificar NEXT_PUBLIC_API_URL no frontend
# Verificar se o backend está na porta 3001
```

## 🎯 Status do Roadmap

- [x] **Sprint 1.1** - Setup Inicial e Autenticação ✅
- [x] **Sprint 2.1** - Funis e Etapas ✅
- [ ] **Sprint 2.2** - Gestão de Leads
- [ ] **Sprint 2.3** - Sistema de Lembretes

---

**Desenvolvido para a Clínica Ianara Pinho**  
*Sistema White-label para Gestão Odontológica* 