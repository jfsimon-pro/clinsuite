import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixExistingLeadsUnitId() {
    console.log('🔧 Corrigindo unitId dos leads existentes...\n');

    // Buscar todos os leads SEM unitId
    const leadsSemUnidade = await prisma.lead.findMany({
        where: { unitId: null },
        include: {
            funnel: {
                select: { id: true, name: true, unitId: true },
            },
        },
    });

    console.log(`📊 Total de leads sem unitId: ${leadsSemUnidade.length}\n`);

    if (leadsSemUnidade.length === 0) {
        console.log('✅ Todos os leads já têm unitId atribuído!');
        await prisma.$disconnect();
        return;
    }

    let corrigidos = 0;
    let semFunil = 0;

    for (const lead of leadsSemUnidade) {
        if (lead.funnel?.unitId) {
            // Atualizar o lead com o unitId do funil
            await prisma.lead.update({
                where: { id: lead.id },
                data: { unitId: lead.funnel.unitId },
            });

            console.log(`✅ Lead "${lead.name || lead.phone}" → Unidade do funil "${lead.funnel.name}"`);
            corrigidos++;
        } else {
            console.log(`⚠️  Lead "${lead.name || lead.phone}" → Funil "${lead.funnel?.name}" não tem unidade`);
            semFunil++;
        }
    }

    console.log(`\n📈 Resumo:`);
    console.log(`   ✅ Leads corrigidos: ${corrigidos}`);
    if (semFunil > 0) {
        console.log(`   ⚠️  Leads com funil sem unidade: ${semFunil}`);
    }

    await prisma.$disconnect();
}

fixExistingLeadsUnitId().catch(console.error);
