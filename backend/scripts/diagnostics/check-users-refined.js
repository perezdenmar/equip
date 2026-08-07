import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            select: { email: true, role: true }
        });

        const nonTestUsers = users.filter(u =>
            u.email &&
            !u.email.startsWith('student.') &&
            !u.email.includes('example.com')
        );

        console.log(`Total users: ${users.length}`);
        console.log(`Non-test users: ${nonTestUsers.length}`);
        nonTestUsers.forEach((u, i) => console.log(`${i + 1}. ${u.email} (${u.role})`));

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
