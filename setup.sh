#!/bin/bash

echo "🚀 Setup do Ianara ERP - Sistema de Gestão Odontológica"
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale o Node.js 18+ primeiro."
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Verificar se PostgreSQL está rodando
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "❌ PostgreSQL não está rodando. Por favor, inicie o PostgreSQL primeiro."
    echo ""
    echo "📋 Comandos para iniciar PostgreSQL:"
    echo "   macOS: brew services start postgresql"
    echo "   Ubuntu/Debian: sudo systemctl start postgresql"
    echo "   Windows: Verificar no Gerenciador de Serviços"
    exit 1
fi

echo "✅ PostgreSQL está rodando"

# Verificar se Redis está rodando
if ! redis-cli ping &> /dev/null; then
    echo "❌ Redis não está rodando. Por favor, inicie o Redis primeiro."
    echo ""
    echo "📋 Comandos para iniciar Redis:"
    echo "   macOS: brew services start redis"
    echo "   Ubuntu/Debian: sudo systemctl start redis-server"
    echo "   Windows: Verificar no Gerenciador de Serviços"
    exit 1
fi

echo "✅ Redis está rodando"

# Setup do Backend
echo ""
echo "🔧 Configurando Backend..."
cd backend

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Verificar se arquivo .env existe
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp env.example .env
    echo "⚠️  Por favor, edite o arquivo backend/.env com suas configurações de banco"
else
    echo "✅ Arquivo .env já existe"
fi

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

# Executar migrations
echo "🗄️  Executando migrations..."
npx prisma migrate dev --name init

# Executar seed
echo "🌱 Executando seed..."
npm run seed

cd ..

# Setup do Frontend
echo ""
echo "🔧 Configurando Frontend..."
cd frontend

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Verificar se arquivo .env.local existe
if [ ! -f .env.local ]; then
    echo "📝 Criando arquivo .env.local..."
    cp env.local.example .env.local
    echo "⚠️  Por favor, edite o arquivo frontend/.env.local com suas configurações"
else
    echo "✅ Arquivo .env.local já existe"
fi

cd ..

echo ""
echo "🎉 Setup concluído!"
echo ""
echo "📋 Próximos passos:"
echo "1. Edite backend/.env com suas configurações de banco"
echo "2. Edite frontend/.env.local com suas configurações"
echo "3. Execute: cd backend && npm run start:dev"
echo "4. Execute: cd frontend && npm run dev"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:3001"
echo ""
echo "🔐 Credenciais de teste:"
echo "   Admin: admin@ianara.com / admin123"
echo "   Worker: worker@ianara.com / worker123" 