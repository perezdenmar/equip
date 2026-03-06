import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/analytics/dashboard
 * Returns aggregated stats for the Admin Dashboard
 */
router.get('/dashboard', authenticateToken, authorizeRoles('ADMIN', 'TRAINER'), async (req, res) => {
    try {
        // 1. Total Counts
        const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
        const totalTrainers = await prisma.user.count({ where: { role: 'TRAINER' } });
        const activeCourses = await prisma.qualification.count({ where: { isActive: true } });

        // 2. Enrollment Stats by Status
        const enrollmentStats = await prisma.enrollment.groupBy({
            by: ['status'],
            _count: {
                id: true
            }
        });

        const pendingEnrollments = enrollmentStats.find(s => s.status === 'PENDING')?._count.id || 0;
        const approvedEnrollments = enrollmentStats.find(s => s.status === 'APPROVED')?._count.id || 0;
        const completedEnrollments = enrollmentStats.find(s => s.status === 'COMPLETED')?._count.id || 0;

        // 3. Trends: Enrollments in the last 6 months
        // This is a simplified version - in a real app we might use a more complex raw query for labels
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const enrollmentsTrend = await prisma.enrollment.findMany({
            where: {
                requestedAt: { gte: sixMonthsAgo }
            },
            select: {
                requestedAt: true
            },
            orderBy: {
                requestedAt: 'asc'
            }
        });

        // Grouping logic for the chart (Frontend usually prefers { month: 'Jan', count: 10 })
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const trendData = {};

        enrollmentsTrend.forEach(e => {
            const date = new Date(e.requestedAt);
            const monthLabel = `${months[date.getMonth()]} ${date.getFullYear()}`;
            trendData[monthLabel] = (trendData[monthLabel] || 0) + 1;
        });

        const formattedTrend = Object.keys(trendData).map(label => ({
            month: label,
            count: trendData[label]
        }));

        res.json({
            overview: {
                totalStudents,
                totalTrainers,
                activeCourses,
                pendingEnrollments,
                approvedEnrollments,
                completedEnrollments
            },
            trend: formattedTrend,
            enrollmentStats // Raw breakdown for pie charts if needed
        });
    } catch (error) {
        console.error('Analytics Fetch Error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
    }
});

export default router;
