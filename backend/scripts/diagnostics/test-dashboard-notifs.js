import { PrismaClient } from '@prisma/client';
import { notifyQualificationAction } from './src/services/notificationService.js';

const prisma = new PrismaClient();

async function testDynamicNotifications() {
    console.log('--- Starting Dynamic Notification Verification ---');

    try {
        // 1. Setup Admin and Student
        const admin = await prisma.user.upsert({
            where: { email: 'admin_notif_test@example.com' },
            update: { role: 'ADMIN' },
            create: { email: 'admin_notif_test@example.com', role: 'ADMIN' }
        });

        const student = await prisma.user.upsert({
            where: { email: 'student_notif_test@example.com' },
            update: { role: 'STUDENT' },
            create: { email: 'student_notif_test@example.com', role: 'STUDENT' }
        });

        const qual = await prisma.qualification.create({
            data: { title: 'Test Notif Course', code: 'TNC-101' }
        });

        // 2. Disable In-App and Email for WISHLIST
        console.log('Disabling WISHLIST notifications...');
        await prisma.siteSetting.upsert({
            where: { key: 'notification_config' },
            update: { value: { WISHLIST: { inApp: false, email: false, recipients: ['ADMIN'] } } },
            create: { key: 'notification_config', value: { WISHLIST: { inApp: false, email: false, recipients: ['ADMIN'] } } }
        });

        // Trigger action
        await notifyQualificationAction(student, qual.id, 'WISHLIST');

        // Verify No Notification
        const notifs1 = await prisma.notification.findMany({ where: { userId: admin.id } });
        if (notifs1.length === 0) {
            console.log('✅ PASS: No In-App notification created when disabled.');
        } else {
            console.error('❌ FAIL: In-App notification created even when disabled.');
        }

        // 3. Enable In-App, Disable Email
        console.log('Enabling In-App, keeping Email disabled...');
        await prisma.siteSetting.update({
            where: { key: 'notification_config' },
            data: { value: { WISHLIST: { inApp: true, email: false, recipients: ['ADMIN'] } } }
        });

        await notifyQualificationAction(student, qual.id, 'WISHLIST');

        const notifs2 = await prisma.notification.findMany({ where: { userId: admin.id } });
        if (notifs2.length === 1) {
            console.log('✅ PASS: In-App notification created successfully.');
        } else {
            console.error('❌ FAIL: In-App notification count incorrect. Found:', notifs2.length);
        }

        // 4. Check Audit Log
        const audit = await prisma.auditLog.findFirst({
            where: { action: 'UPDATE_NOTIFICATION_CONFIG' },
            orderBy: { createdAt: 'desc' }
        });
        if (audit) {
            console.log('✅ PASS: Audit log recorded for config change.');
        }

        // Cleanup
        await prisma.notification.deleteMany({ where: { userId: admin.id } });
        await prisma.qualification.delete({ where: { id: qual.id } });
        await prisma.user.delete({ where: { id: admin.id } });
        await prisma.user.delete({ where: { id: student.id } });

    } catch (error) {
        console.error('Verification Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testDynamicNotifications();
