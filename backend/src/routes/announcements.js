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

// Get detailed report (Admin Only) - Moved up to avoid conflicts with /:id
router.get('/:id/report', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const announcement = await prisma.announcement.findUnique({
            where: { id },
            include: {
                author: {
                    select: { firstName: true, lastName: true, email: true }
                },
                _count: {
                    select: { recipients: true }
                },
                recipients: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                role: true,
                                city: true,
                                province: true,
                                region: true
                            }
                        }
                    },
                    orderBy: { sentAt: 'desc' }
                }
            }
        });

        if (!announcement) return res.status(404).json({ error: 'Announcement not found' });

        // Calculate stats with fallback for empty recipients
        const recipients = announcement.recipients || [];
        const totalSent = announcement._count?.recipients || 0;
        const readCount = recipients.filter(r => r.isRead).length;

        res.json({
            ...announcement,
            stats: {
                totalSent,
                readCount,
                readRate: totalSent > 0 ? Math.round((readCount / totalSent) * 100) : 0
            }
        });
    } catch (error) {
        console.error('Fetch report error:', error);
        res.status(500).json({ error: 'Failed to fetch announcement report', details: error.message });
    }
});

// Get single announcement (Admin Only)
router.get('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const announcement = await prisma.announcement.findUnique({
            where: { id }
        });

        if (!announcement) return res.status(404).json({ error: 'Announcement not found' });

        res.json(announcement);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch announcement' });
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

// Update announcement (Admin Only)
router.patch('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, subject, content, ctaLink, targetCriteria, channels, scheduledAt, priority } = req.body;

        const existing = await prisma.announcement.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: 'Announcement not found' });
        if (existing.status === 'SENT') return res.status(400).json({ error: 'Cannot edit sent announcement' });

        const announcement = await prisma.announcement.update({
            where: { id },
            data: {
                title,
                subject,
                content,
                ctaLink,
                targetCriteria,
                channels,
                priority: !!priority,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                status: (scheduledAt && existing.status !== 'SENT') ? 'SCHEDULED' : (scheduledAt === null && existing.status === 'SCHEDULED' ? 'DRAFT' : existing.status)
            }
        });

        res.json(announcement);
    } catch (error) {
        console.error('Update announcement error:', error);
        res.status(500).json({ error: 'Failed to update announcement' });
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

        // If it was scheduled, clear the schedule so it doesn't double-send
        if (announcement.scheduledAt) {
            await prisma.announcement.update({
                where: { id },
                data: { scheduledAt: null }
            });
        }

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

export default router;
