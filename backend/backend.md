Estrutura de Pastas - Backend (NestJS)

O backend usa NestJS + Prisma + PostgreSQL, com arquitetura modular e suporte a multi-tenant. O foco é organizar o projeto por domínio, facilitar manutenção e permitir evolução para microsserviços futuramente.

Estrutura de pastas sugerida:
backend/
├── src/
│   ├── main.ts                  # Bootstrap do app
│   ├── app.module.ts           # Módulo principal que importa os outros
│   ├── modules/                # Módulos separados por domínio (ex: crm, auth)
│   │   ├── auth/               # Login, JWT, guards
│   │   ├── tenant/             # Gestão de empresas (multi-tenant)
│   │   └── crm/                # Lógica de CRM (leads, funil, histórico)
│   ├── core/                   # Configurações globais (ex: cors, logs)
│   ├── common/                 # Pipes, guards, interceptors, constantes
│   ├── prisma/                 # Cliente e serviço de banco (PrismaService)
├── prisma/
│   └── schema.prisma           # Esquema do banco de dados (PostgreSQL)
├── .env                        # Variáveis de ambiente
├── package.json
├── tsconfig.json

Organização e propósito:

modules/: Cada pasta representa um domínio funcional do sistema. Ex: crm, auth, agenda. Incluem seus controllers, services, DTOs e entidades.

prisma/: Arquivo schema.prisma define as tabelas. Prisma gera cliente tipado para acesso ao banco.

core/: Configurações globais da aplicação (interceptors, middlewares, global pipes, etc).

common/: Utilitários reutilizáveis por todo o sistema: validações, enums, helpers, etc.

.env: Armazena configurações sensíveis: banco de dados, JWT, SMTP, etc.

Multi-tenant (White-label)

Cada tabela relevante do sistema terá um campo company_id.

Toda requisição autentica o usuário e injeta a company_id nas queries.

Isso garante que os dados fiquem isolados por empresa dentro de um único banco (multi-tenant por linha).

Benefícios

Separação clara de responsabilidades por domínio

Pronto para crescer sem virar uma bagunça

Fácil de adaptar para SaaS multi-clínica

Permite escalar módulos como microsserviços no futuro se necessário