import { PrismaClient } from '@prisma/client';

const emailsToFind = [
    'quantumgroupph@gmail.com',
    'pauieconde@gmail.com',
    'gepsearch@gmail.com',
    'skidz13@gmail.com'
];

async function testPort(port, password) {
    const url = `postgresql://postgres:${password}@127.0.0.1:${port}/equip_db?schema=public`;
    const prisma = new PrismaClient({ datasources: { db: { url } } });

    console.log(`[Test] Checking Port ${port}...`);
    try {
        const users = await prisma.user.findMany({
            where: { email: { in: emailsToFind } },
            select: { email: true }
        });

        if (users.length > 0) {
            console.log(`[FOUND] Successfully found ${users.length} production emails on Port ${port}!`);
            users.forEach(u => console.log(` - ${u.email}`));
            return true;
        } else {
            console.log(`[MISSED] No production emails found on Port ${port}.`);
            // List any users to be sure
            const count = await prisma.user.count();
            console.log(` - Total users on this port: ${count}`);
        }
    } catch (error) {
        console.error(`[ERROR] Port ${port} check failed:`, error.message.split('\n')[0]);
    } finally {
        await prisma.$disconnect();
    }
    return false;
}

async function run() {
    const ports = [5432, 5433, 5444];
    const passwords = ['1313', 'postgres', 'admin', 'root'];

    for (const port of ports) {
        for (const pwd of passwords) {
            const found = await testPort(port, pwd);
            if (found) {
                console.log(`\n*** PRODUCTION DATABASE IDENTIFIED AT PORT ${port} with password "${pwd}" ***`);
                // No break, let's scan all to be sure
            }
        }
    }
}

run();
