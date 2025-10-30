const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // 1. Criar empresa
    console.log('📊 Criando empresa...');
    const company = await prisma.company.upsert({
      where: { id: '37e58161-1727-4b53-9bca-bf739d83a4d4' },
      update: {},
      create: {
        id: '37e58161-1727-4b53-9bca-bf739d83a4d4',
        name: 'Ianara Odonto',
        cnpj: '12345678000199',
      },
    });

    console.log('✅ Empresa criada:', company.name);

    // 2. Criar usuário admin
    console.log('👤 Criando usuário admin...');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const user = await prisma.user.upsert({
      where: { email: 'admin@ianara.com' },
      update: {},
      create: {
        name: 'Administrador',
        email: 'admin@ianara.com',
        password: hashedPassword,
        role: 'ADMIN',
        specialty: 'GENERAL',
        companyId: company.id,
      },
    });

    console.log('✅ Usuário admin criado:', user.email);

    // 2.5. Criar SUPER_ADMIN (dono do sistema)
    console.log('👑 Criando SUPER ADMIN...');
    const superAdminPassword = await bcrypt.hash('master2025!', 10);

    const superAdmin = await prisma.user.upsert({
      where: { email: 'ianarapinhomaster@gmail.com' },
      update: {},
      create: {
        name: 'Super Administrador',
        email: 'ianarapinhomaster@gmail.com',
        password: superAdminPassword,
        role: 'SUPER_ADMIN',
        specialty: 'GENERAL',
        companyId: company.id, // Pertence à empresa master
      },
    });

    console.log('✅ SUPER ADMIN criado:', superAdmin.email);

    // 3. Criar funil padrão com etapas conceituais
    console.log('🎯 Criando funil padrão...');
    const funnel = await prisma.funnel.upsert({
      where: {
        name_companyId: {
          name: 'Novos Contatos',
          companyId: company.id
        }
      },
      update: {},
      create: {
        name: 'Novos Contatos',
        companyId: company.id,
      },
    });

    console.log('✅ Funil criado:', funnel.name);

    // 4. Criar etapas com tipos conceituais
    console.log('📋 Criando etapas com tipos conceituais...');

    const steps = [
      { name: 'Novo Contato', order: 1, tipoConceitual: 'CAPTACAO' },
      { name: 'Primeiro Contato', order: 2, tipoConceitual: 'QUALIFICACAO' },
      { name: 'Consulta Agendada', order: 3, tipoConceitual: 'APRESENTACAO' },
      { name: 'Orçamento Enviado', order: 4, tipoConceitual: 'PROPOSTA' },
      { name: 'Negociação', order: 5, tipoConceitual: 'NEGOCIACAO' },
      { name: 'Fechado - Ganho', order: 6, tipoConceitual: 'FECHAMENTO' },
    ];

    for (const stepData of steps) {
      const step = await prisma.funnelStep.upsert({
        where: {
          funnelId_order: {
            funnelId: funnel.id,
            order: stepData.order
          }
        },
        update: {
          tipoConceitual: stepData.tipoConceitual
        },
        create: {
          name: stepData.name,
          order: stepData.order,
          funnelId: funnel.id,
          tipoConceitual: stepData.tipoConceitual,
        },
      });

      console.log(`✅ Etapa criada: ${step.name} (${step.tipoConceitual})`);
    }

    console.log('🎉 Seed concluído com sucesso!');
    console.log('');
    console.log('📝 Dados de login:');
    console.log('');
    console.log('👑 SUPER ADMIN (Dono do Sistema):');
    console.log('  Email: ianarapinhomaster@gmail.com');
    console.log('  Senha: master2025!');
    console.log('');
    console.log('👤 Admin da Clínica:');
    console.log('  Email: admin@ianara.com');
    console.log('  Senha: admin123');

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();