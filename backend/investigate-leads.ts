import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function investigateLeadsData() {
    console.log('🔍 Investigando dados de leads por unidade...\n');

    const units = await prisma.unit.findMany({
        select: { id: true, name: true, code: true },
    });

    for (const unit of units) {
        console.log(`\n📍 Unidade: ${unit.name} (${unit.code})`);
        console.log(`ID: ${unit.id}\n`);

        // Total de leads nesta unidade
        const totalLeads = await prisma.lead.count({
            where: { unitId: unit.id },
        });

        // Leads com valor
        const leadsComValor = await prisma.lead.findMany({
            where: {
                unitId: unit.id,
                OR: [
                    { valorVenda: { not: null, gt: 0 } },
                    { valorOrcamento: { not: null, gt: 0 } },
                ],
            },
            select: {
                id: true,
                name: true,
                statusVenda: true,
                valorVenda: true,
                valorOrcamento: true,
                dataFechamento: true,
                createdAt: true,
            },
        });

        // Leads GANHOS (receita confirmada)
        const leadsGanhos = await prisma.lead.findMany({
            where: {
                unitId: unit.id,
                statusVenda: 'GANHO',
            },
            select: {
                id: true,
                name: true,
                valorVenda: true,
                valorOrcamento: true,
                dataFechamento: true,
            },
        });

        console.log(`📊 Estatísticas:`);
        console.log(`   Total de leads: ${totalLeads}`);
        console.log(`   Leads com valor: ${leadsComValor.length}`);
        console.log(`   Leads GANHOS: ${leadsGanhos.length}`);

        if (leadsComValor.length > 0) {
            console.log(`\n   💰 Leads com valor monetário:`);
            leadsComValor.forEach(lead => {
                const valor = lead.valorVenda || lead.valorOrcamento;
                console.log(`      - ${lead.name || 'Sem nome'}: R$ ${valor} (Status: ${lead.statusVenda})`);
            });
        }

        if (leadsGanhos.length > 0) {
            console.log(`\n   ✅ Leads GANHOS (receita confirmada):`);
            const receitaTotal = leadsGanhos.reduce((sum, lead) => {
                const valor = Number(lead.valorVenda) || Number(lead.valorOrcamento) || 0;
                return sum + valor;
            }, 0);

            leadsGanhos.forEach(lead => {
                const valor = lead.valorVenda || lead.valorOrcamento;
                console.log(`      - ${lead.name || 'Sem nome'}: R$ ${valor}`);
            });

            console.log(`\n   💵 RECEITA TOTAL (leads ganhos): R$ ${receitaTotal.toFixed(2)}`);
        } else {
            console.log(`\n   ⚠️  Nenhum lead com status GANHO nesta unidade`);
        }
    }

    // Verificar leads SEM unidade
    console.log(`\n\n❓ Leads SEM unidade atribuída:`);
    const leadsSemUnidade = await prisma.lead.count({
        where: { unitId: null },
    });

    if (leadsSemUnidade > 0) {
        console.log(`   Total: ${leadsSemUnidade} leads sem unitId`);

        const leadsSemUnidadeComValor = await prisma.lead.findMany({
            where: {
                unitId: null,
                statusVenda: 'GANHO',
            },
            select: {
                name: true,
                valorVenda: true,
                valorOrcamento: true,
            },
        });

        if (leadsSemUnidadeComValor.length > 0) {
            console.log(`   Leads GANHOS sem unidade:`);
            leadsSemUnidadeComValor.forEach(lead => {
                const valor = lead.valorVenda || lead.valorOrcamento;
                console.log(`      - ${lead.name || 'Sem nome'}: R$ ${valor}`);
            });
        }
    } else {
        console.log(`   ✅ Todos os leads têm unidade atribuída`);
    }

    await prisma.$disconnect();
}

investigateLeadsData().catch(console.error);
