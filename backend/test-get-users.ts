import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testGetUsers() {
    console.log('🧪 Testando getCompanyUsers (simulando backend)...\n');

    // Buscar todas as companies
    const companies = await prisma.company.findMany({
        select: { id: true, name: true },
    });

    for (const company of companies) {
        console.log(`\n📊 Company: ${company.name}`);
        console.log(`ID: ${company.id}\n`);

        const users = await prisma.user.findMany({
            where: {
                companyId: company.id,
                role: {
                    not: 'SUPER_ADMIN',
                },
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                specialty: true,
                unitId: true,
                createdAt: true,
            },
            orderBy: {
                name: 'asc',
            },
        });

        console.log(`Usuários retornados (${users.length}):`);
        users.forEach(user => {
            console.log(`\n  👤 ${user.name}`);
            console.log(`     Email: ${user.email}`);
            console.log(`     Role: ${user.role}`);
            console.log(`     Specialty: ${user.specialty}`);
            console.log(`     ✨ UnitId: ${user.unitId || 'NULL'}`);
        });
    }

    await prisma.$disconnect();
}

testGetUsers().catch(console.error);
