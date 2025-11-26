const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    console.log('👑 Criando SUPER ADMIN...');

    // Buscar a empresa existente
    const company = await prisma.company.findUnique({
      where: { cnpj: '12345678000199' }
    });

    if (!company) {
      console.error('❌ Empresa não encontrada! Execute o seed primeiro.');
      process.exit(1);
    }

    const superAdminPassword = await bcrypt.hash('master2025!', 10);

    const superAdmin = await prisma.user.upsert({
      where: { email: 'ianarapinhomaster@gmail.com' },
      update: {
        password: superAdminPassword,
        role: 'SUPER_ADMIN',
      },
      create: {
        name: 'Super Administrador',
        email: 'ianarapinhomaster@gmail.com',
        password: superAdminPassword,
        role: 'SUPER_ADMIN',
        specialty: 'GENERAL',
        companyId: company.id,
      },
    });

    console.log('✅ SUPER ADMIN criado:', superAdmin.email);
    console.log('');
    console.log('📝 Credenciais:');
    console.log('  Email: ianarapinhomaster@gmail.com');
    console.log('  Senha: master2025!');

  } catch (error) {
    console.error('❌ Erro:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
