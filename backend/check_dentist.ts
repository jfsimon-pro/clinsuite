
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const dentists = await prisma.user.findMany({
        where: {
            role: 'DENTIST',
        },
    });

    if (dentists.length > 0) {
        console.log('Found dentists:', dentists);
    } else {
        console.log('No dentists found.');
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
