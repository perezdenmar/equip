import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const id = '64e2589e-809e-4cb1-b5ac-df538af9d119';
    console.log(`Checking announcement with ID: ${id}`);
    
    try {
        const announcement = await prisma.announcement.findUnique({
            where: { id },
            include: {
                author: true,
                _count: {
                    select: { recipients: true }
                },
                recipients: {
                    include: { user: true }
                }
            }
        });
        
        if (!announcement) {
            console.log('Announcement NOT FOUND in database.');
            
            // Check all announcements to see what we have
            const count = await prisma.announcement.count();
            console.log(`Total announcements in DB: ${count}`);
            
            const all = await prisma.announcement.findMany({
                take: 5,
                select: { id: true, title: true, status: true }
            });
            console.log('Sample announcements:', JSON.stringify(all, null, 2));
        } else {
            console.log('Announcement FOUND:');
            console.log(JSON.stringify({
                id: announcement.id,
                title: announcement.title,
                status: announcement.status,
                authorId: announcement.authorId,
                recipientCount: announcement._count.recipients
            }, null, 2));
            
            if (!announcement.author) {
                console.log('WARNING: Author relation is null (this should not happen per schema!)');
            }
        }
    } catch (error) {
        console.error('Database query failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
