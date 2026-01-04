import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugAnalyticsPerUnit() {
    console.log('🔍 DEBUG COMPLETO /analytics - Seleção de Unidades\n');
    console.log('='.repeat(70));

    const companyId = '7ba47538-6d79-4ba6-99b1-f49bdf002e40';

    // 1. LISTAR UNIDADES DISPONÍVEIS (como no header)
    console.log('\n1️⃣  UNIDADES DISPONÍVEIS NO SELETOR:\n');

    const units = await prisma.unit.findMany({
        where: { companyId },
        select: {
            id: true,
            name: true,
            code: true,
        },
    });

    console.log('   Opções no dropdown:');
    console.log('   - [TODAS] Todas as Unidades (admin only)');
    units.forEach(unit => {
        console.log(`   - [${unit.code}] ${unit.name}`);
    });

    // Para cada unidade, simular a seleção
    for (const unit of units) {
        console.log('\n' + '='.repeat(70));
        console.log(`\n🏢 SELECIONADO: ${unit.name} (${unit.code})`);
        console.log(`   ID: ${unit.id}\n`);

        // 2. MÉTRICAS DE VENDAS
        console.log('📊 MÉTRICAS DE VENDAS:');

        const leadsUnidade = await prisma.lead.findMany({
            where: {
                companyId,
                unitId: unit.id,
            },
            select: {
                id: true,
                name: true,
                phone: true,
                statusVenda: true,
                valorVenda: true,
                valorOrcamento: true,
            },
        });

        const totalLeads = leadsUnidade.length;
        const leadsGanhos = leadsUnidade.filter(l => l.statusVenda === 'GANHO');
        const receitaTotal = leadsGanhos.reduce((sum, l) => sum + (Number(l.valorVenda) || 0), 0);
        const taxaConversao = totalLeads > 0 ? (leadsGanhos.length / totalLeads) * 100 : 0;

        console.log(`   Total de leads: ${totalLeads}`);
        console.log(`   Leads GANHOS: ${leadsGanhos.length}`);
        console.log(`   Receita total: R$ ${receitaTotal.toFixed(2)}`);
        console.log(`   Taxa conversão: ${taxaConversao.toFixed(1)}%`);

        if (leadsUnidade.length > 0) {
            console.log('\n   Leads desta unidade:');
            leadsUnidade.forEach(lead => {
                const valor = lead.valorVenda || lead.valorOrcamento || 0;
                console.log(`      - ${lead.name || lead.phone}: R$ ${valor} (${lead.statusVenda})`);
            });
        } else {
            console.log('   ⚠️  NENHUM LEAD nesta unidade');
        }

        // 3. PERFORMANCE DA EQUIPE
        console.log('\n👥 PERFORMANCE DA EQUIPE:');

        const colaboradores = await prisma.user.findMany({
            where: {
                companyId,
                unitId: unit.id,
            },
            select: {
                id: true,
                name: true,
                role: true,
                leads: {
                    where: {
                        unitId: unit.id, // Importante: filtrar leads por unidade também
                    },
                    select: {
                        statusVenda: true,
                        valorVenda: true,
                    },
                },
            },
        });

        console.log(`   Total de colaboradores: ${colaboradores.length}`);

        if (colaboradores.length === 0) {
            console.log('   ⚠️  NENHUM COLABORADOR atribuído a esta unidade');
        } else {
            colaboradores.forEach(colab => {
                const leadsAtribuidos = colab.leads.length;
                const leadsConvertidos = colab.leads.filter(l => l.statusVenda === 'GANHO').length;
                const receita = colab.leads
                    .filter(l => l.statusVenda === 'GANHO')
                    .reduce((sum, l) => sum + (Number(l.valorVenda) || 0), 0);

                console.log(`\n      👤 ${colab.name} (${colab.role})`);
                console.log(`         Leads: ${leadsAtribuidos}`);
                console.log(`         Convertidos: ${leadsConvertidos}`);
                console.log(`         Receita: R$ ${receita.toFixed(2)}`);
            });
        }

        // 4. PIPELINE
        console.log('\n💼 PIPELINE (leads ativos):');

        const leadsAtivos = await prisma.lead.count({
            where: {
                companyId,
                unitId: unit.id,
                statusVenda: {
                    notIn: ['GANHO', 'PERDIDO'],
                },
            },
        });

        console.log(`   Leads no pipeline: ${leadsAtivos}`);
    }

    // TESTE COM "TODAS AS UNIDADES" (sem filtro)
    console.log('\n' + '='.repeat(70));
    console.log('\n🌐 SELECIONADO: TODAS AS UNIDADES (Admin)\n');

    console.log('📊 MÉTRICAS DE VENDAS:');

    const todosLeads = await prisma.lead.count({ where: { companyId } });
    const todosGanhos = await prisma.lead.count({
        where: { companyId, statusVenda: 'GANHO' },
    });
    const todaReceita = await prisma.lead.findMany({
        where: { companyId, statusVenda: 'GANHO' },
        select: { valorVenda: true },
    });
    const receitaGlobal = todaReceita.reduce((sum, l) => sum + (Number(l.valorVenda) || 0), 0);

    console.log(`   Total de leads: ${todosLeads}`);
    console.log(`   Leads GANHOS: ${todosGanhos}`);
    console.log(`   Receita total: R$ ${receitaGlobal.toFixed(2)}`);

    console.log('\n👥 PERFORMANCE DA EQUIPE (TODOS):');

    const todosColaboradores = await prisma.user.count({ where: { companyId } });
    console.log(`   Total de colaboradores: ${todosColaboradores}`);

    const colaboradoresPorUnidade = await prisma.user.groupBy({
        by: ['unitId'],
        where: { companyId },
        _count: true,
    });

    console.log('\n   Distribuição por unidade:');
    for (const group of colaboradoresPorUnidade) {
        if (group.unitId) {
            const unit = units.find(u => u.id === group.unitId);
            console.log(`      ${unit?.name || 'Desconhecida'}: ${group._count} colaborador(es)`);
        } else {
            console.log(`      Sem unidade: ${group._count} colaborador(es)`);
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n✅ DEBUG COMPLETO\n');

    await prisma.$disconnect();
}

debugAnalyticsPerUnit().catch(console.error);
