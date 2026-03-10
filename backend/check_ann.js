import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const annId = '64e2589e-809e-4cb1-b5ac-df538af9d119';
    console.log('Checking announcement ID:', annId);

    const announcement = await prisma.announcement.findUnique({
        where: { id: annId },
        include: {
            _count: {
                select: { recipients: true }
            }
        }
    });

    if (announcement) {
        console.log('FOUND:', JSON.stringify(announcement, null, 2));
    } else {
        console.log('NOT FOUND in Announcement table.');

        const all = await prisma.announcement.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, status: true }
        });
        console.log('Last 5 announcements:', JSON.stringify(all, null, 2));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
