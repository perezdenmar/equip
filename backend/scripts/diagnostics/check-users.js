import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('[Test] Listing users with emails...');
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true
            }
        });

        console.log(`Total reported users: ${users.length}`);
        const usersWithEmail = users.filter(u => u.email && !u.email.includes('example.com'));
        console.log(`Users with "real-looking" emails: ${usersWithEmail.length}`);

        usersWithEmail.forEach((u, i) => {
            console.log(`${i + 1}. ${u.email} (${u.role})`);
        });

    } catch (error) {
        console.error('[FAIL] Database query failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
