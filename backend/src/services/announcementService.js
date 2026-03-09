import prisma from '../lib/prisma.js';
import { sendAdminStaffNotificationEmail } from './emailService.js';

/**
 * Resolves target users based on criteria.
 */
export const resolveTargets = async (criteria) => {
    const { roles, locations, qualificationIds } = criteria;

    let where = {};

    if (roles && roles.length > 0) {
        where.role = { in: roles };
    }

    if (locations && locations.length > 0) {
        // Simple location match for city/region
        where.OR = [
            { city: { in: locations } },
            { region: { in: locations } },
            { province: { in: locations } }
        ];
    }

    if (qualificationIds && qualificationIds.length > 0) {
        where.enrollments = {
            some: {
                qualificationId: { in: qualificationIds },
                status: 'APPROVED' // Only notify actively enrolled students
            }
        };
    }

    return await prisma.user.findMany({
        where,
        select: { id: true, email: true, firstName: true }
    });
};

/**
 * Process and deliver an announcement.
 */
export const processAnnouncement = async (announcementId) => {
    const announcement = await prisma.announcement.findUnique({
        where: { id: announcementId }
    });

    if (!announcement || announcement.status === 'SENT') return;

    try {
        const recipients = await resolveTargets(announcement.targetCriteria);
        if (recipients.length === 0) {
            await prisma.announcement.update({
                where: { id: announcementId },
                data: { status: 'SENT', sentAt: new Date() }
            });
            return;
        }

        const channels = announcement.channels;

        // 1. In-App Notifications
        if (channels.inApp) {
            await prisma.notification.createMany({
                data: recipients.map(r => ({
                    userId: r.id,
                    title: announcement.title,
                    message: announcement.content.substring(0, 200), // Summary
                    type: announcement.priority ? 'WARNING' : 'INFO'
                }))
            });

            // Track recipients for read status
            await prisma.announcementRecipient.createMany({
                data: recipients.map(r => ({
                    announcementId,
                    userId: r.id
                })),
                skipDuplicates: true
            });
        }

        // 2. Email Delivery (Batched)
        if (channels.email) {
            const batchSize = 50;
            for (let i = 0; i < recipients.length; i += batchSize) {
                const batch = recipients.slice(i, i + batchSize);
                await sendAdminStaffNotificationEmail({
                    recipients: batch.map(u => u.email),
                    subject: announcement.subject || announcement.title,
                    body: `
                        <h2>${announcement.title}</h2>
                        <div>${announcement.content}</div>
                        ${announcement.ctaLink ? `<p><a href="${announcement.ctaLink}" style="background:#f97316; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Check it out</a></p>` : ''}
                    `
                });

                // Small delay between batches to avoid overloading the mail server
                if (i + batchSize < recipients.length) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
        }

        await prisma.announcement.update({
            where: { id: announcementId },
            data: { status: 'SENT', sentAt: new Date() }
        });

        console.log(`[AnnouncementService] Delivered announcement ${announcementId} to ${recipients.length} users.`);

    } catch (error) {
        console.error(`[AnnouncementService] Failed to deliver ${announcementId}:`, error);
        await prisma.announcement.update({
            where: { id: announcementId },
            data: { status: 'FAILED' }
        });
    }
};

/**
 * Check and process scheduled announcements.
 */
export const checkScheduledAnnouncements = async () => {
    const now = new Date();
    const scheduled = await prisma.announcement.findMany({
        where: {
            status: 'SCHEDULED',
            scheduledAt: { lte: now }
        }
    });

    for (const ann of scheduled) {
        console.log(`[AnnouncementService] Triggering scheduled announcement: ${ann.title}`);
        await processAnnouncement(ann.id);
    }
};
