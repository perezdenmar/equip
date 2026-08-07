import prisma from './src/lib/prisma.js';
async function main() {
    try {
        const partners = await prisma.partner.count();
        const qualifications = await prisma.qualification.count();
        const users = await prisma.user.count();
        const enrollments = await prisma.enrollment.count();
        const jobs = await prisma.job.count();
        const notifications = await prisma.notification.count();

        console.log('--- Database Status ---');
        console.log('Partners:', partners);
        console.log('Qualifications:', qualifications);
        console.log('Users:', users);
        console.log('Enrollments:', enrollments);
        console.log('Jobs:', jobs);
        console.log('Notifications:', notifications);
    } catch (error) {
        console.error('Error querying database:', error);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}
main();
