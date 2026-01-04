import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPerformanceQuery() {
    console.log('🧪 Testando query de Performance da Equipe...\n');

    const companyId = '7ba47538-6d79-4ba6-99b1-f49bdf002e40'; // Clínica Ianara
    const unitId = '7d4d238f-acc2-4084-a167-fef825de6bd4'; // SASA

    console.log('📍 Testando filtro por Unidade SASA\n');

    // Query SEM filtro
    console.log('1️⃣ SEM filtro de unidade:');
    const todosSemFiltro = await prisma.user.findMany({
        where: { companyId },
        select: { id: true, name: true, unitId: true },
    });
    console.log(`   Total: ${todosSemFiltro.length} usuários`);
    todosSemFiltro.forEach(u => {
        console.log(`   - ${u.name}: unitId = ${u.unitId || 'NULL'}`);
    });

    // Query COM filtro
    console.log('\n2️⃣ COM filtro de unidade SASA:');
    const usuariosFiltrados = await prisma.user.findMany({
        where: {
            companyId,
            unitId: unitId,
        },
        select: { id: true, name: true, unitId: true },
    });
    console.log(`   Total: ${usuariosFiltrados.length} usuários`);

    if (usuariosFiltrados.length === 0) {
        console.log('   ❌ NENHUM usuário encontrado com essa unidade!');
        console.log(`   \n   💡 Isso significa que nenhum colaborador está atribuído à unidade SASA`);
    } else {
        usuariosFiltrados.forEach(u => {
            console.log(`   ✅ ${u.name}`);
        });
    }

    // Verificar qual a expectativa
    console.log('\n3️⃣ Colaboradores por unidade:');
    const units = await prisma.unit.findMany({
        select: { id: true, name: true, code: true },
    });

    for (const unit of units) {
        const count = await prisma.user.count({
            where: { unitId: unit.id },
        });
        console.log(`   ${unit.name} (${unit.code}): ${count} colaborador(es)`);
    }

    const semUnidade = await prisma.user.count({
        where: { unitId: null },
    });
    console.log(`   Sem unidade: ${semUnidade} colaborador(es)`);

    await prisma.$disconnect();
}

testPerformanceQuery().catch(console.error);
