import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMarcioData() {
    console.log('🔍 Procurando usuário "Marcio"...\n');

    const users = await prisma.user.findMany({
        where: {
            name: {
                contains: 'Marcio',
                mode: 'insensitive',
            },
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            unitId: true,
            unit: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
        },
    });

    if (users.length === 0) {
        console.log('❌ Nenhum usuário com nome "Marcio" encontrado');

        console.log('\n📋 Listando TODOS os usuários:');
        const allUsers = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                unitId: true,
            },
        });

        allUsers.forEach(u => {
            console.log(`- ${u.name} (${u.role}): unitId = ${u.unitId || 'NULL'}`);
        });
    } else {
        console.log(`✅ Encontrado ${users.length} usuário(s):\n`);
        users.forEach(user => {
            console.log(`👤 ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   UnitId: ${user.unitId || 'NULL'}`);
            if (user.unit) {
                console.log(`   Unidade: ${user.unit.name} (${user.unit.code})`);
            } else {
                console.log(`   Unidade: Nenhuma`);
            }
            console.log('');
        });
    }

    await prisma.$disconnect();
}

checkMarcioData().catch(console.error);
