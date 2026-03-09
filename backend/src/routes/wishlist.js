import express from 'express';
import prisma from '../lib/prisma.js';
import { notifyQualificationAction } from '../services/notificationService.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get the user's wishlist
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const wishlist = await prisma.wishlist.findMany({
            where: { userId },
            include: {
                qualification: {
                    select: {
                        id: true,
                        title: true,
                        code: true,
                        status: true,
                        category: true,
                        startDate: true,
                        endDate: true,
                        level: true,
                        duration: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(wishlist);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
});

// Add a qualification to the wishlist
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { qualificationId } = req.body;
        const userId = req.user.userId;

        if (!qualificationId) {
            return res.status(400).json({ error: 'Qualification ID is required' });
        }

        // Check if the qualification exists and is COMING_SOON
        const qualification = await prisma.qualification.findUnique({
            where: { id: qualificationId }
        });

        if (!qualification) {
            return res.status(404).json({ error: 'Qualification not found' });
        }

        // Students can wishlist COMING_SOON courses
        // If it's OPEN, they should probably enroll, but wishlisting is allowed for notifications

        const existing = await prisma.wishlist.findUnique({
            where: {
                userId_qualificationId: { userId, qualificationId }
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'Qualification is already in your wishlist' });
        }

        const added = await prisma.wishlist.create({
            data: { userId, qualificationId },
            include: { qualification: true }
        });

        // Log the activity
        await prisma.auditLog.create({
            data: {
                userId,
                action: 'WISHLIST_ADD',
                details: `Added to wishlist: ${added.qualification.title}`
            }
        });

        // Notify Admins
        try {
            const userData = await prisma.user.findUnique({ where: { id: userId } });
            if (userData) {
                await notifyQualificationAction(userData, qualificationId, 'WISHLIST');
            }
        } catch (err) {
            console.error('Wishlist notification failed:', err);
        }

        res.status(201).json(added);
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ error: 'Failed to add to wishlist' });
    }
});

// Remove a qualification from the wishlist
router.delete('/:qualificationId', authenticateToken, async (req, res) => {
    try {
        const { qualificationId } = req.params;
        const userId = req.user.userId;

        await prisma.wishlist.delete({
            where: {
                userId_qualificationId: { userId, qualificationId }
            }
        });

        res.json({ message: 'Removed from wishlist' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
});

// Get prioritized wishlist for a specific qualification (Admin/Staff/Trainer)
router.get('/qualification/:id', authenticateToken, authorizeRoles('ADMIN', 'STAFF', 'TRAINER'), async (req, res) => {
    try {
        const { id } = req.params;

        const wishlist = await prisma.wishlist.findMany({
            where: { qualificationId: id },
            include: {
                user: {
                    select: { id: true, firstName: true, lastName: true, email: true, points: true }
                }
            }
        });

        const now = new Date();
        const prioritized = wishlist.map(entry => {
            // Priority Algorithm:
            // Score = (Seconds since joining wishlist) + (Points/10 * 3600 seconds)
            const secondsSinceJoin = (now - new Date(entry.createdAt)) / 1000;
            const pointsBonus = (entry.user.points / 10) * 3600;
            const score = secondsSinceJoin + pointsBonus;

            return {
                id: entry.id,
                userId: entry.userId,
                user: entry.user,
                createdAt: entry.createdAt,
                priorityScore: Math.round(score)
            };
        }).sort((a, b) => b.priorityScore - a.priorityScore);

        res.json(prioritized);
    } catch (error) {
        console.error('Error fetching prioritized wishlist:', error);
        res.status(500).json({ error: 'Failed to fetch prioritized wishlist' });
    }
});

export default router;
