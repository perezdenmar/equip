import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const annCount = await prisma.announcement.count();
    const recCount = await prisma.announcementRecipient.count();
    const userCount = await prisma.user.count();

    console.log('--- DB SUMMARY ---');
    console.log('Announcements:', annCount);
    console.log('Recipients:', recCount);
    console.log('Users:', userCount);

    const lastAnn = await prisma.announcement.findFirst({
        orderBy: { createdAt: 'desc' }
    });
    console.log('Last Announcement:', lastAnn ? lastAnn.id : 'NONE');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
