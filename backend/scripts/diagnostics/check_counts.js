import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    console.log('--- Database Record Count Check ---');
    try {
        const counts = {
            User: await prisma.user.count(),
            Qualification: await prisma.qualification.count(),
            OfficialQualification: await prisma.officialQualification.count(),
            Partner: await prisma.partner.count(),
            PartnerReward: await prisma.partnerReward.count(),
            Notification: await prisma.notification.count(),
            Announcement: await prisma.announcement.count(),
        };
        console.table(counts);
    } catch (err) {
        console.error('Error checking counts:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
