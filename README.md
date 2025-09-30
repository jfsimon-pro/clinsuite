# Ianara ERP - Sistema de Gestão Odontológica

Sistema completo de gestão para clínicas odontológicas com arquitetura white-label.

## 🚀 Sprint 1.1 - Setup Inicial e Autenticação

### Funcionalidades Implementadas

✅ **Backend (NestJS)**
- Sistema de autenticação JWT + Refresh Token
- Middleware de validação de company_id
- Configuração multi-tenant
- Validação global com class-validator
- CORS configurado
- Estrutura modular preparada

✅ **Frontend (Next.js)**
- NextAuth.js configurado
- Context de autenticação
- Página de login funcional
- Dashboard básico
- TailwindCSS configurado
- Proteção de rotas

✅ **Banco de Dados**
- Schema Prisma completo
- Migrations configuradas
- Script de seed para dados de teste

### 🛠️ Setup do Projeto

#### Opção 1: Setup Automático (Recomendado)
```bash
# macOS/Linux
./setup.sh

# Windows
setup.bat
```

#### Opção 2: Setup Manual

#### 1. Pré-requisitos
- Node.js 18+
- PostgreSQL 15+ (instalado localmente)
- Redis 7+ (instalado localmente)

#### 2. Instalação do PostgreSQL
```bash
# macOS (usando Homebrew)
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Windows
# Baixar e instalar do site oficial: https://www.postgresql.org/download/windows/
```

#### 3. Instalação do Redis
```bash
# macOS (usando Homebrew)
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Windows
# Baixar e instalar do site oficial: https://redis.io/download
```

#### 4. Configuração do Banco de Dados
```bash
# Criar banco de dados
psql -U postgres
CREATE DATABASE ianara_erp;
CREATE USER ianara_user WITH PASSWORD 'ianara_password';
GRANT ALL PRIVILEGES ON DATABASE ianara_erp TO ianara_user;
\q
```

#### 5. Setup do Backend
```bash
cd backend
npm install

# Configurar variáveis de ambiente
cp env.example .env
# Editar .env com suas configurações de banco

# Gerar cliente Prisma e executar migrations
npx prisma generate
npx prisma migrate dev

# Executar seed para dados de teste
npm run seed

# Iniciar servidor de desenvolvimento
npm run start:dev
```

#### 6. Setup do Frontend
```bash
cd frontend
npm install

# Configurar variáveis de ambiente
cp env.local.example .env.local
# Editar .env.local com suas configurações

# Iniciar servidor de desenvolvimento
npm run dev
```

### 🔐 Credenciais de Teste

**Admin:**
- Email: admin@ianara.com
- Senha: admin123

**Worker:**
- Email: worker@ianara.com
- Senha: worker123

### 📁 Estrutura do Projeto

```
IanaraERP/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── modules/auth/   # Módulo de autenticação
│   │   ├── prisma/         # Configuração do banco
│   │   └── common/         # Middlewares e utilitários
│   └── prisma/
│       └── schema.prisma   # Schema do banco
├── frontend/               # Next.js App
│   ├── src/
│   │   ├── app/           # Páginas (App Router)
│   │   ├── context/       # Contextos React
│   │   └── lib/           # Configurações
│   └── public/            # Arquivos estáticos
```

### 🔧 Variáveis de Ambiente

#### Backend (.env)
```env
DATABASE_URL="postgresql://ianara_user:ianara_password@localhost:5432/ianara_erp?schema=public"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"
JWT_REFRESH_EXPIRES_IN="30d"
REDIS_URL="redis://localhost:6379"
PORT=3001
```

#### Frontend (.env.local)
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 🎯 Próximos Passos

**Sprint 1.2 - Core Multi-tenant + White-label Base**
- Sistema de theming dinâmico
- Upload de logo
- Configurações de empresa
- Personalização de cores

### 📊 Status do Roadmap

- [x] **Sprint 1.1** - Setup Inicial e Autenticação ✅
- [ ] **Sprint 1.2** - Core Multi-tenant + White-label Base
- [ ] **Sprint 2.1** - Funis e Etapas
- [ ] **Sprint 2.2** - Gestão de Leads
- [ ] **Sprint 2.3** - Notas e Observações

### 🐛 Troubleshooting

**Problema:** Erro de conexão com PostgreSQL
```bash
# Verificar se PostgreSQL está rodando
# macOS
brew services list | grep postgresql

# Ubuntu/Debian
sudo systemctl status postgresql

# Windows
# Verificar no Gerenciador de Serviços
```

**Problema:** Erro de conexão com Redis
```bash
# Verificar se Redis está rodando
# macOS
brew services list | grep redis

# Ubuntu/Debian
sudo systemctl status redis-server

# Testar conexão
redis-cli ping
```

**Problema:** Erro de autenticação
```bash
# Verificar se seed foi executado
cd backend && npm run seed

# Verificar logs do backend
npm run start:dev
```

### 📝 Logs de Desenvolvimento

- Backend: http://localhost:3001
- Frontend: http://localhost:3000
- Banco de dados: localhost:5432
- Redis: localhost:6379

---

*Desenvolvido para a Clínica Ianara Pinho - Sistema White-label para Gestão Odontológica* 