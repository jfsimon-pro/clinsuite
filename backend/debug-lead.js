// Script de debug para verificar leads no banco
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugLead() {
  console.log('🔍 INICIANDO DEBUG DO LEAD "jorge teste"...\n');

  try {
    // 1. Buscar o lead "jorge teste"
    const lead = await prisma.lead.findFirst({
      where: {
        name: {
          contains: 'jorge',
          mode: 'insensitive'
        }
      },
      include: {
        step: true,
        funnel: true,
        company: true,
        responsible: true
      }
    });

    if (!lead) {
      console.log('❌ Lead "jorge teste" NÃO ENCONTRADO no banco!');
      return;
    }

    console.log('✅ LEAD ENCONTRADO!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 DADOS DO LEAD:');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`ID: ${lead.id}`);
    console.log(`Nome: ${lead.name}`);
    console.log(`Telefone: ${lead.phone}`);
    console.log(`Empresa: ${lead.company.name} (${lead.companyId})`);
    console.log(`Funil: ${lead.funnel.name} (${lead.funnelId})`);
    console.log(`Etapa: ${lead.step.name} (${lead.stepId})`);
    console.log(`Responsável: ${lead.responsible?.name || 'SEM RESPONSÁVEL'}`);
    console.log('\n📈 CAMPOS DE ANALYTICS:');
    console.log('───────────────────────────────────────────────────────');
    console.log(`statusVenda: ${lead.statusVenda}`);
    console.log(`valorVenda: ${lead.valorVenda ? `R$ ${lead.valorVenda}` : 'NULL ❌'}`);
    console.log(`valorOrcamento: ${lead.valorOrcamento ? `R$ ${lead.valorOrcamento}` : 'NULL ❌'}`);
    console.log(`dataFechamento: ${lead.dataFechamento || 'NULL ❌'}`);
    console.log(`dataOrcamento: ${lead.dataOrcamento || 'NULL'}`);
    console.log(`probabilidadeFecho: ${lead.probabilidadeFecho || 'NULL'}%`);
    console.log(`meioCaptacao: ${lead.meioCaptacao || 'NULL'}`);
    console.log(`tipoProcura: ${lead.tipoProcura || 'NULL'}`);
    console.log('\n📅 TIMESTAMPS:');
    console.log('───────────────────────────────────────────────────────');
    console.log(`Criado em: ${lead.createdAt}`);
    console.log(`Atualizado em: ${lead.updatedAt}`);
    console.log('═══════════════════════════════════════════════════════\n');

    // 2. Verificar quantos leads GANHO existem na empresa
    const leadsGanhos = await prisma.lead.findMany({
      where: {
        companyId: lead.companyId,
        statusVenda: 'GANHO'
      },
      select: {
        name: true,
        valorVenda: true,
        valorOrcamento: true,
        dataFechamento: true,
        createdAt: true
      }
    });

    console.log(`\n💰 LEADS COM STATUS "GANHO" NA EMPRESA (Total: ${leadsGanhos.length})`);
    console.log('═══════════════════════════════════════════════════════');

    if (leadsGanhos.length === 0) {
      console.log('❌ NENHUM LEAD COM STATUS "GANHO" ENCONTRADO!');
      console.log('⚠️  ISSO EXPLICA POR QUE O ANALYTICS NÃO MOSTRA DADOS!\n');
    } else {
      leadsGanhos.forEach((l, index) => {
        console.log(`\n${index + 1}. ${l.name || 'Sem nome'}`);
        console.log(`   Valor Venda: ${l.valorVenda ? `R$ ${l.valorVenda}` : 'NULL'}`);
        console.log(`   Valor Orçamento: ${l.valorOrcamento ? `R$ ${l.valorOrcamento}` : 'NULL'}`);
        console.log(`   Data Fechamento: ${l.dataFechamento || 'NULL'}`);
        console.log(`   Criado em: ${l.createdAt}`);
      });
      console.log('═══════════════════════════════════════════════════════\n');
    }

    // 3. Simular query do analytics
    console.log('\n🔬 SIMULANDO QUERY DO ANALYTICS SERVICE:');
    console.log('═══════════════════════════════════════════════════════');

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Início do mês

    const leadsConvertidos = await prisma.lead.findMany({
      where: {
        companyId: lead.companyId,
        statusVenda: 'GANHO',
        OR: [
          {
            dataFechamento: {
              gte: startDate,
              lte: now,
            },
          },
          {
            dataFechamento: null,
            statusVenda: 'GANHO',
            updatedAt: {
              gte: startDate,
              lte: now,
            },
          },
        ],
      },
      select: {
        name: true,
        valorVenda: true,
        valorOrcamento: true,
        dataFechamento: true,
      },
    });

    console.log(`Período: ${startDate.toLocaleDateString('pt-BR')} até ${now.toLocaleDateString('pt-BR')}`);
    console.log(`Leads encontrados pela query do analytics: ${leadsConvertidos.length}`);

    if (leadsConvertidos.length > 0) {
      const receita = leadsConvertidos.reduce((sum, l) =>
        sum + (Number(l.valorVenda) || Number(l.valorOrcamento) || 0), 0);
      console.log(`Receita Total calculada: R$ ${receita}`);
      console.log('\nLeads incluídos no cálculo:');
      leadsConvertidos.forEach((l, i) => {
        const valor = Number(l.valorVenda) || Number(l.valorOrcamento) || 0;
        console.log(`  ${i+1}. ${l.name || 'Sem nome'} - R$ ${valor}`);
      });
    } else {
      console.log('❌ NENHUM LEAD ENCONTRADO PELA QUERY DO ANALYTICS!');
      console.log('\n⚠️  POSSÍVEIS MOTIVOS:');
      console.log('   1. Lead não tem statusVenda = "GANHO"');
      console.log('   2. dataFechamento está fora do período (ou NULL sem updatedAt recente)');
      console.log('   3. Lead não pertence à empresa correta (companyId diferente)');
    }
    console.log('═══════════════════════════════════════════════════════\n');

    // 4. Verificar todos os status possíveis
    const statusCount = await prisma.lead.groupBy({
      by: ['statusVenda'],
      where: {
        companyId: lead.companyId
      },
      _count: true
    });

    console.log('\n📊 DISTRIBUIÇÃO DE STATUS NA EMPRESA:');
    console.log('═══════════════════════════════════════════════════════');
    statusCount.forEach(s => {
      console.log(`${s.statusVenda}: ${s._count} leads`);
    });
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ ERRO:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugLead();
