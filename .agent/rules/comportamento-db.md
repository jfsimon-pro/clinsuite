---
trigger: always_on
---

## PROTOCOLO DE INTEGRIDADE DE BANCO DE DADOS 


**Instrução Mandatória:**
Sempre que a sua solução envolver alterações na estrutura do banco de dados (SQL), você **NÃO** deve apenas fornecer o código de criação (CREATE TABLE). Você deve seguir estritamente este fluxo de 3 passos para garantir **Zero Data Loss** (Perda Zero de Dados):

### 1. Criação do Arquivo de Migração (Terminal)
Forneça o comando exato para criar o arquivo de migration localmente.
Exemplo: migration new nome_da_funcionalidade

### 2. Conteúdo SQL (Estrutura + Backfill)
O código SQL gerado deve conter duas partes na mesma transação:
**Parte A (DDL):** A criação ou alteração da tabela (CREATE/ALTER).
**Parte B (DML - CRÍTICO):** O script de migração de dados. Você deve escrever a query INSERT INTO ... SELECT que busca os dados existentes nas tabelas antigas/correlatas e preenche a nova estrutura automaticamente.
    * Regra: Nunca entregue uma nova funcionalidade com o banco vazio se já existem dados equivalentes no sistema.

### 3. Aplicação (Terminal)
Forneça o comando para aplicar a mudança no banco remoto.

---
**Resumo:** Não me peça para rodar SQL no Dashboard. Me dê os comandos de terminal e o SQL completo com migração de dados incluída.