import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/dashboard/metrics
router.get('/metrics', authenticateToken, async (req, res) => {
    try {
        const { role } = req.user;
        if (role !== 'ADMIN' && role !== 'TRAINER') {
            return res.status(403).json({ error: 'Unauthorized to view dashboard metrics' });
        }

        const [totalStudents, totalPartners, activeCourses, pendingEnrollments] = await Promise.all([
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.partner.count(),
            prisma.qualification.count({ where: { status: 'OPEN' } }),
            prisma.enrollment.count({ where: { status: 'PENDING' } })
        ]);

        res.json({
            totalStudents,
            totalPartners,
            activeCourses,
            pendingEnrollments
        });
    } catch (error) {
        console.error('Fetch dashboard metrics error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
    }
});

export default router;
