import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    try {
        const user = await prisma.user.findFirst();
        console.log('User:', JSON.stringify(user, null, 2));
    } finally {
        await prisma.$disconnect();
    }
}
check();
