@echo off
echo 🚀 Setup do Ianara ERP - Sistema de Gestão Odontológica
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js não encontrado. Por favor, instale o Node.js 18+ primeiro.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
node --version

echo.
echo ⚠️  IMPORTANTE: Certifique-se de que PostgreSQL e Redis estão rodando
echo.
echo 📋 Comandos para verificar:
echo    PostgreSQL: Verificar no Gerenciador de Serviços
echo    Redis: Verificar no Gerenciador de Serviços
echo.

REM Setup do Backend
echo 🔧 Configurando Backend...
cd backend

REM Instalar dependências
echo 📦 Instalando dependências...
call npm install

REM Verificar se arquivo .env existe
if not exist .env (
    echo 📝 Criando arquivo .env...
    copy env.example .env
    echo ⚠️  Por favor, edite o arquivo backend\.env com suas configurações de banco
) else (
    echo ✅ Arquivo .env já existe
)

REM Gerar cliente Prisma
echo 🔧 Gerando cliente Prisma...
call npx prisma generate

REM Executar migrations
echo 🗄️  Executando migrations...
call npx prisma migrate dev --name init

REM Executar seed
echo 🌱 Executando seed...
call npm run seed

cd ..

REM Setup do Frontend
echo.
echo 🔧 Configurando Frontend...
cd frontend

REM Instalar dependências
echo 📦 Instalando dependências...
call npm install

REM Verificar se arquivo .env.local existe
if not exist .env.local (
    echo 📝 Criando arquivo .env.local...
    copy env.local.example .env.local
    echo ⚠️  Por favor, edite o arquivo frontend\.env.local com suas configurações
) else (
    echo ✅ Arquivo .env.local já existe
)

cd ..

echo.
echo 🎉 Setup concluído!
echo.
echo 📋 Próximos passos:
echo 1. Edite backend\.env com suas configurações de banco
echo 2. Edite frontend\.env.local com suas configurações
echo 3. Execute: cd backend ^&^& npm run start:dev
echo 4. Execute: cd frontend ^&^& npm run dev
echo.
echo 🌐 URLs:
echo    Frontend: http://localhost:3000
echo    Backend: http://localhost:3001
echo.
echo 🔐 Credenciais de teste:
echo    Admin: admin@ianara.com / admin123
echo    Worker: worker@ianara.com / worker123
echo.
pause 