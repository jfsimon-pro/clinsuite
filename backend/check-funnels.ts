import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndFixFunnels() {
    console.log('🔍 Verificando estado dos funis...\n');

    // Buscar todos os funis
    const funnels = await prisma.funnel.findMany({
        select: { id: true, name: true, unitId: true, companyId: true },
    });

    console.log(`Total de funis: ${funnels.length}`);
    console.log(`Funis SEM unidade: ${funnels.filter(f => !f.unitId).length}`);
    console.log(`Funis COM unidade: ${funnels.filter(f => f.unitId).length}\n`);

    // Listar funis
    funnels.forEach(f => {
        console.log(`- ${f.name}: unitId=${f.unitId || 'NULL'}`);
    });

    // Verificar unidades disponíveis
    console.log('\n🏢 Unidades disponíveis:');
    const units = await prisma.unit.findMany({
        select: { id: true, name: true, code: true, companyId: true },
    });

    units.forEach(u => {
        console.log(`- ${u.name} (${u.code}): ${u.id}`);
    });

    // Corrigir funis sem unidade
    const funnelsWithoutUnit = funnels.filter(f => !f.unitId);

    if (funnelsWithoutUnit.length > 0) {
        console.log(`\n⚠️  Encontrados ${funnelsWithoutUnit.length} funis sem unidade!`);
        console.log('🔧 Atribuindo à unidade SEDE...\n');

        for (const funnel of funnelsWithoutUnit) {
            // Buscar unidade SEDE da company deste funil
            const defaultUnit = await prisma.unit.findFirst({
                where: {
                    companyId: funnel.companyId,
                    code: 'SEDE',
                },
            });

            if (defaultUnit) {
                await prisma.funnel.update({
                    where: { id: funnel.id },
                    data: { unitId: defaultUnit.id },
                });
                console.log(`✅ Funil "${funnel.name}" → Unidade "${defaultUnit.name}"`);
            } else {
                console.log(`❌ Não encontrou unidade SEDE para funil "${funnel.name}"`);
            }
        }
    } else {
        console.log('\n✅ Todos os funis já possuem unidade!');
    }

    await prisma.$disconnect();
}

checkAndFixFunnels().catch(console.error);
