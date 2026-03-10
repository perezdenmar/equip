import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- START TEST ---');

    // 1. Create a dummy user
    const user = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'STUDENT'
        }
    });
    console.log('User created:', user.id);

    // 2. Create an announcement
    const ann = await prisma.announcement.create({
        data: {
            title: 'Performance Test',
            subject: 'Hello World',
            content: '<p>Testing reports</p>',
            status: 'SENT',
            authorId: user.id,
            channels: { inApp: true, email: true },
            targetCriteria: {}
        }
    });
    console.log('Announcement created:', ann.id);

    // 3. Create a recipient record
    const rec = await prisma.announcementRecipient.create({
        data: {
            announcementId: ann.id,
            userId: user.id,
            sentAt: new Date(),
            isRead: true
        }
    });
    console.log('Recipient created:', rec.id);

    console.log('--- TEST DATA READY ---');
    console.log('Try this URL: http://localhost:5173/admin/announcements/' + ann.id + '/report');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
