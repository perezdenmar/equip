import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all notifications for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit to recent 50
        });
        res.json(notifications);
    } catch (error) {
        console.error('Fetch notifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark a specific notification as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await prisma.notification.findUnique({
            where: { id }
        });

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        if (notification.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const updated = await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });

        res.json(updated);
    } catch (error) {
        console.error('Update notification error:', error);
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

// Mark all notifications for the user as read
router.patch('/read-all', authenticateToken, async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: { userId: req.user.userId, isRead: false },
            data: { isRead: true }
        });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
});

// Delete a specific notification
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await prisma.notification.findUnique({
            where: { id }
        });

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        if (notification.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await prisma.notification.delete({
            where: { id }
        });

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

export default router;

