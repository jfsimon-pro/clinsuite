import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Buscando lead "Janaina"...');
    const lead = await prisma.lead.findFirst({
        where: {
            name: {
                contains: 'Janaina',
                mode: 'insensitive'
            }
        },
        include: {
            dentistUser: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });

    if (lead) {
        console.log('✅ Lead encontrado:');
        console.log(JSON.stringify(lead, null, 2));
    } else {
        console.log('❌ Lead "Janaina" não encontrado.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
