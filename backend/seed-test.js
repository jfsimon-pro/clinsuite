const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedTestData() {
  try {
    // Criar uma empresa de teste
    const company = await prisma.company.create({
      data: {
        id: 'default-company-id',
        name: 'Empresa Teste',
        cnpj: '12.345.678/0001-90',
        logoUrl: null,
        primaryColor: '#3B82F6',
      },
    });

    console.log('Empresa criada:', company);

    // Criar uma conexão WhatsApp de teste
    const connection = await prisma.whatsAppConnection.create({
      data: {
        name: 'WhatsApp Principal',
        phone: null,
        status: 'DISCONNECTED',
        companyId: company.id,
        sessionId: null,
        qrCode: null,
        lastSeen: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('Conexão WhatsApp criada:', connection);

    console.log('✅ Dados de teste inseridos com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inserir dados de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestData();
