import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('[Audit] Searching for all stored email addresses...');

    try {
        // 1. Users
        const users = await prisma.user.findMany({ select: { email: true, role: true } });
        console.log(`\n--- Users (${users.length}) ---`);
        users.forEach(u => console.log(`User: ${u.email} [${u.role}]`));

        // 2. Enrollments (often have contact info if not linked to users)
        // Check schema for other email fields

        // 3. Contact Requests / Messages
        try {
            const contacts = await prisma.contactMessage.findMany({ select: { email: true } });
            console.log(`\n--- Contact Messages (${contacts.length}) ---`);
            contacts.forEach(c => console.log(`Contact: ${c.email}`));
        } catch (e) { /* Table might not exist or have email */ }

        // 4. Newsletter/Subscribers
        try {
            const subscribers = await prisma.subscriber.findMany({ select: { email: true } });
            console.log(`\n--- Subscribers (${subscribers.length}) ---`);
            subscribers.forEach(s => console.log(`Subscriber: ${s.email}`));
        } catch (e) { }

        // 5. Partners
        try {
            const partners = await prisma.partner.findMany({ select: { email: true } });
            console.log(`\n--- Partners (${partners.length}) ---`);
            partners.forEach(p => console.log(`Partner: ${p.email}`));
        } catch (e) { }

    } catch (error) {
        console.error('Audit failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
