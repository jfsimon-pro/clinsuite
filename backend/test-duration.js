const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDuration() {
  const leads = await prisma.lead.findMany({
    select: {
      id: true,
      name: true,
      phone: true,
      duracaoConsulta: true,
      dataConsulta: true,
    },
    orderBy: { updatedAt: 'desc' },
    take: 5,
  });

  console.log('🔍 Últimos 5 leads com durações:');
  console.table(leads.map(l => ({
    nome: l.name || 'Sem nome',
    telefone: l.phone,
    duracao: l.duracaoConsulta,
    data: l.dataConsulta,
  })));

  await prisma.$disconnect();
}

checkDuration().catch(console.error);
