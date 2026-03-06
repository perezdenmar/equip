import { generateCertificate } from './src/services/certificateService.js';
import prisma from './src/lib/prisma.js';
import fs from 'fs';
import path from 'path';

async function test() {
    console.log('--- Certificate Debug Script ---');

    // 1. Ensure a completed enrollment exists
    let enrollment = await prisma.enrollment.findFirst({
        where: { status: 'COMPLETED' },
        include: { user: true, qualification: true }
    });

    if (!enrollment) {
        console.log('No completed enrollment found. Creating dummy for test...');
        const user = await prisma.user.upsert({
            where: { email: 'cert.test@gmail.com' },
            update: {},
            create: {
                email: 'cert.test@gmail.com',
                firstName: 'Test',
                lastName: 'Student',
                role: 'STUDENT'
            }
        });

        const qual = await prisma.qualification.findFirst();
        if (!qual) {
            console.error('No qualifications found in DB. Seed first.');
            process.exit(1);
        }

        enrollment = await prisma.enrollment.upsert({
            where: { userId_qualificationId: { userId: user.id, qualificationId: qual.id } },
            update: { status: 'COMPLETED' },
            create: {
                userId: user.id,
                qualificationId: qual.id,
                status: 'COMPLETED'
            },
            include: { user: true, qualification: true }
        });
    }

    console.log(`Generating cert for: ${enrollment.user.email} -> ${enrollment.qualification.title}`);

    const doc = await generateCertificate(enrollment.id);
    const outputPath = path.join(process.cwd(), 'uploads', 'debug-certificate.pdf');
    const writeStream = fs.createWriteStream(outputPath);

    doc.pipe(writeStream);

    writeStream.on('finish', () => {
        console.log(`✅ Success! Certificate saved to: ${outputPath}`);
        process.exit(0);
    });
}

test().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
