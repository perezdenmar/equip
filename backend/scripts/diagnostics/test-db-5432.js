import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:1313@127.0.0.1:5432/equip_db?schema=public"
        }
    }
});

async function main() {
    console.log('[Test-5432] Querying database records on port 5432...');
    try {
        const userCount = await prisma.user.count();
        const qualificationCount = await prisma.qualification.count();

        console.log(`[PASS] Users: ${userCount}`);
        console.log(`[PASS] Qualifications: ${qualificationCount}`);

    } catch (error) {
        console.error('[FAIL] Database query failed on 5432:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
