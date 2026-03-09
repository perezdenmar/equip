import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { sendReferralEmail } from '../services/emailService.js';

const router = express.Router();

// Get user's referrals
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const referrals = await prisma.referral.findMany({
            where: { referrerId: userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(referrals);
    } catch (error) {
        console.error('Error fetching referrals:', error);
        res.status(500).json({ error: 'Failed to fetch referrals' });
    }
});

// Submit a referral
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { email } = req.body;
        const referrerId = req.user.userId;

        if (!email) {
            return res.status(400).json({ error: 'Referee email is required' });
        }

        // Check if already referred by this user
        const existing = await prisma.referral.findUnique({
            where: {
                referrerId_refereeEmail: { referrerId, refereeEmail: email }
            }
        });

        if (existing) {
            return res.status(400).json({ error: 'You have already referred this email' });
        }

        // Check if referee is already a user
        const refereeAccount = await prisma.user.findUnique({
            where: { email }
        });

        if (refereeAccount) {
            return res.status(400).json({ error: 'This person is already a member of equip' });
        }

        const referral = await prisma.referral.create({
            data: { referrerId, refereeEmail: email }
        });

        // Log the activity
        await prisma.auditLog.create({
            data: {
                userId: referrerId,
                action: 'REFERRAL_SUBMIT',
                details: `Referred: ${email}`
            }
        });

        // Send the invitation email
        try {
            await sendReferralEmail(email, {
                referrerName: req.user.firstName || req.user.email.split('@')[0],
                referralCode: referral.id // Using the record ID as a temporary code
            });
        } catch (mailError) {
            console.error('Failed to send referral email:', mailError);
            // We still return 201 because the record was created
            return res.status(201).json({
                ...referral,
                warning: 'Referral recorded but email delivery failed. Please check SMTP settings.'
            });
        }

        res.status(201).json(referral);
    } catch (error) {
        console.error('Error submitting referral:', error);
        res.status(500).json({ error: 'Failed to submit referral' });
    }
});

export default router;
