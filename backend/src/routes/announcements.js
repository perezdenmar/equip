import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import { processAnnouncement, resolveTargets } from '../services/announcementService.js';
import { sendAdminStaffNotificationEmail } from '../services/emailService.js';

const router = express.Router();

// Get all announcements (Admin Only)
router.get('/', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const announcements = await prisma.announcement.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { recipients: true }
                }
            }
        });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
});

// Create announcement (Admin Only)
router.post('/', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const { title, subject, content, ctaLink, targetCriteria, channels, scheduledAt, priority } = req.body;

        // Server-side validation
        if (!title || !subject || !content || content === '<p><br></p>') {
            return res.status(400).json({ error: 'Title, Subject, and Content are required.' });
        }

        const announcement = await prisma.announcement.create({
            data: {
                title,
                subject,
                content,
                ctaLink,
                targetCriteria,
                channels,
                priority: !!priority,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
                authorId: req.user.userId
            }
        });

        res.status(201).json(announcement);
    } catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).json({ error: 'Failed to create announcement' });
    }
});

// Delete announcement (Admin Only)
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const announcement = await prisma.announcement.findUnique({ where: { id } });

        if (!announcement) return res.status(404).json({ error: 'Announcement not found' });

        await prisma.announcement.delete({ where: { id } });

        // Record in Audit Log
        await prisma.auditLog.create({
            data: {
                userId: req.user.userId,
                action: 'DELETE_ANNOUNCEMENT',
                details: `Deleted announcement: ${announcement.title} (ID: ${id})`
            }
        });

        res.json({ message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error('Delete announcement error:', error);
        res.status(500).json({ error: 'Failed to delete announcement' });
    }
});

// Send Now (Admin Only)
router.post('/:id/send', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const announcement = await prisma.announcement.findUnique({ where: { id } });

        if (!announcement) return res.status(404).json({ error: 'Announcement not found' });
        if (announcement.status === 'SENT') return res.status(400).json({ error: 'Already sent' });

        // Process in background to avoid timeout
        processAnnouncement(id);

        res.json({ message: 'Delivery started in background' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to trigger delivery' });
    }
});

// Preview / Test Message (Admin Only)
router.post('/preview', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const { title, subject, content, ctaLink } = req.body;

        await sendAdminStaffNotificationEmail({
            recipients: [req.user.email],
            subject: `[TEST] ${subject || title}`,
            body: `
                <div style="border: 2px dashed #ccc; padding: 10px; margin-bottom: 20px; text-align: center; color: #666;">
                    <strong>ANNOUNCEMENT PREVIEW MODE</strong>
                </div>
                <h2>${title}</h2>
                <div>${content}</div>
                ${ctaLink ? `<p><a href="${ctaLink}">CTA Link</a></p>` : ''}
            `
        });

        res.json({ message: 'Test email sent to your address' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send test email' });
    }
});

// Get potential recipient count
router.post('/count-targets', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const recipients = await resolveTargets(req.body);
        res.json({ count: recipients.length });
    } catch (error) {
        res.status(500).json({ error: 'Failed to count targets' });
    }
});

// Get detailed report (Admin Only)
router.get('/:id/report', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const announcement = await prisma.announcement.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { recipients: true }
                },
                recipients: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                                location: true
                            }
                        }
                    },
                    orderBy: { sentAt: 'desc' }
                }
            }
        });

        if (!announcement) return res.status(404).json({ error: 'Announcement not found' });

        // Calculate stats
        const readCount = announcement.recipients.filter(r => r.isRead).length;

        res.json({
            ...announcement,
            stats: {
                totalSent: announcement._count.recipients,
                readCount,
                readRate: announcement._count.recipients > 0
                    ? Math.round((readCount / announcement._count.recipients) * 100)
                    : 0
            }
        });
    } catch (error) {
        console.error('Fetch report error:', error);
        res.status(500).json({ error: 'Failed to fetch announcement report' });
    }
});

export default router;
