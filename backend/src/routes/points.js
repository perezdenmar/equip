import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get user's points balance and recent transactions
router.get('/balance', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { points: true }
        });

        const transactions = await prisma.pointsTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        res.json({
            balance: user.points,
            transactions
        });
    } catch (error) {
        console.error('Error fetching points balance:', error);
        res.status(500).json({ error: 'Failed to fetch points balance' });
    }
});

// Redeem points for a reward
router.post('/redeem', authenticateToken, authorizeRoles('STUDENT'), async (req, res) => {
    try {
        const { amount, rewardTitle } = req.body;
        const userId = req.user.userId;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid redemption amount' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (user.points < amount) {
            return res.status(400).json({ error: 'Insufficient points' });
        }

        // Use a transaction to update points and create record
        const result = await prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: { points: { decrement: amount } }
            });

            const transaction = await tx.pointsTransaction.create({
                data: {
                    userId,
                    amount: -amount,
                    reason: `Redeemed for ${rewardTitle || 'Gift Certificate'}`,
                    type: 'REDEMPTION'
                }
            });

            return { updatedUser, transaction };
        });

        // Log the activity
        await prisma.auditLog.create({
            data: {
                userId,
                action: 'POINTS_REDEMPTION',
                details: `Redeemed ${amount} points for ${rewardTitle || 'Gift Certificate'}`
            }
        });

        res.json({
            message: 'Points redeemed successfully',
            newBalance: result.updatedUser.points,
            transaction: result.transaction
        });
    } catch (error) {
        console.error('Error redeeming points:', error);
        res.status(500).json({ error: 'Failed to redeem points' });
    }
});

export default router;
