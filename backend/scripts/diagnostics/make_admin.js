import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const email = 'perezdenmars@gmail.com'; // From .env ADMIN_EMAILS
    console.log(`Checking/Creating Admin: ${email}`);

    const user = await prisma.user.upsert({
        where: { email },
        update: { role: 'ADMIN' },
        create: {
            email,
            role: 'ADMIN',
            firstName: 'Admin',
            lastName: 'User'
        }
    });

    console.log('Admin user updated/created:', user.email, 'Role:', user.role);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
