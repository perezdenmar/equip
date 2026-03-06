import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Submit a new enrollment request
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { qualificationId } = req.body;
        const userId = req.user.userId;

        if (!qualificationId) {
            return res.status(400).json({ error: 'Qualification ID is required' });
        }

        // Check if already enrolled or requested
        const existing = await prisma.enrollment.findUnique({
            where: {
                userId_qualificationId: { userId, qualificationId }
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'You have already requested enrollment for this course.' });
        }

        const enrollment = await prisma.enrollment.create({
            data: {
                userId,
                qualificationId,
                status: 'PENDING'
            },
            include: {
                qualification: true
            }
        });

        // Log the activity
        await prisma.auditLog.create({
            data: {
                userId,
                action: 'ENROLLMENT_REQUEST',
                details: `Requested enrollment for: ${enrollment.qualification.title}`
            }
        });

        res.status(201).json(enrollment);
    } catch (error) {
        console.error('Enrollment request error:', error);
        res.status(500).json({ error: 'Failed to submit enrollment request' });
    }
});

// Get pending enrollment requests (Admin: all, Trainer: assigned courses)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { role, userId } = req.user;

        let whereClause = { status: 'PENDING' };

        if (role === 'TRAINER') {
            // Only show enrollments for qualifications where this user is a trainer
            whereClause.qualification = {
                trainers: {
                    some: { id: userId }
                }
            };
        } else if (role !== 'ADMIN') {
            return res.status(403).json({ error: 'Unauthorized to view enrollment requests' });
        }

        const enrollments = await prisma.enrollment.findMany({
            where: whereClause,
            include: {
                user: {
                    select: { id: true, firstName: true, lastName: true, email: true }
                },
                qualification: {
                    select: { id: true, title: true, code: true }
                }
            },
            orderBy: { requestedAt: 'desc' }
        });

        res.json(enrollments);
    } catch (error) {
        console.error('Fetch enrollments error:', error);
        res.status(500).json({ error: 'Failed to fetch enrollment requests' });
    }
});

// Update enrollment status (Approve/Reject)
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const { role, userId } = req.user;

        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const enrollment = await prisma.enrollment.findUnique({
            where: { id },
            include: {
                qualification: {
                    include: { trainers: true }
                },
                user: true
            }
        });

        if (!enrollment) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }

        // Check authorization
        const isAssignedTrainer = enrollment.qualification.trainers.some(t => t.id === userId);
        if (role !== 'ADMIN' && !isAssignedTrainer) {
            return res.status(403).json({ error: 'Unauthorized to update this enrollment' });
        }

        const updated = await prisma.enrollment.update({
            where: { id },
            data: { status },
            include: { qualification: true, user: true }
        });

        // Log activity for the staff/trainer
        await prisma.auditLog.create({
            data: {
                userId,
                action: `ENROLLMENT_${status}`,
                details: `${status} enrollment for ${updated.user.email} in ${updated.qualification.title}`
            }
        });

        // Log activity for the student
        await prisma.auditLog.create({
            data: {
                userId: updated.userId,
                action: `ENROLLMENT_${status}`,
                details: `Your enrollment for ${updated.qualification.title} was ${status.toLowerCase()}`
            }
        });

        res.json(updated);
    } catch (error) {
        console.error('Update enrollment status error:', error);
        res.status(500).json({ error: 'Failed to update enrollment status' });
    }
});

// Get user's recent activity (AuditLogs + Enrollments)
router.get('/activity', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Fetch AuditLogs
        const logs = await prisma.auditLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        // Map to a common format
        const activities = logs.map(log => ({
            id: log.id,
            text: log.details || log.action,
            time: log.createdAt,
            action: log.action
        }));

        res.json(activities);
    } catch (error) {
        console.error('Fetch activity error:', error);
        res.status(500).json({ error: 'Failed to fetch activity log' });
    }
});

export default router;
