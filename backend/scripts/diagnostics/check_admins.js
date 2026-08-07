import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- ADMIN CHECK ---');
    const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' }
    });
    console.log('Admins found:', admins.map(u => u.email));

    if (admins.length === 0) {
        console.log('No admins found! Should we create one?');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
