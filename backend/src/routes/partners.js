import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import prisma from '../lib/prisma.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ensure partners upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'partners');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage for partner logos
const partnerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(4).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, `partner-logo-${uniqueSuffix}${ext}`);
    }
});

// Multer storage for reward photos
const rewardUploadDir = path.join(process.cwd(), 'uploads', 'rewards');
if (!fs.existsSync(rewardUploadDir)) {
    fs.mkdirSync(rewardUploadDir, { recursive: true });
}

const rewardStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, rewardUploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(4).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, `reward-photo-${uniqueSuffix}${ext}`);
    }
});

const uploadParams = {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG, and WEBP are allowed.'), false);
        }
    }
};

const uploadPartner = multer({
    storage: partnerStorage,
    ...uploadParams
});

const uploadReward = multer({
    storage: rewardStorage,
    ...uploadParams
});

// List all partners (Publicly accessible)
router.get('/', async (req, res) => {
    try {
        const partners = await prisma.partner.findMany({
            where: { isActive: true },
            include: {
                rewards: {
                    where: { isActive: true }
                }
            },
            orderBy: { name: 'asc' }
        });
        res.json(partners);
    } catch (error) {
        console.error('Error fetching partners:', error);
        res.status(500).json({ error: 'Failed to fetch partners' });
    }
});

// Admin: Manage Partners
router.post('/', authenticateToken, authorizeRoles('ADMIN'), uploadPartner.single('logo'), async (req, res) => {
    try {
        const { name, contact, email, specials, description, website } = req.body;

        let logoUrl = '';
        if (req.file) {
            logoUrl = `/uploads/partners/${req.file.filename}`;
        }

        const partner = await prisma.partner.create({
            data: {
                name,
                logo: logoUrl,
                contact,
                email,
                socials: specials,
                description,
                website
            }
        });
        res.status(201).json(partner);
    } catch (error) {
        console.error('Error creating partner:', error);
        res.status(500).json({ error: 'Failed to create partner' });
    }
});

router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), uploadPartner.single('logo'), async (req, res) => {
    try {
        const { name, contact, email, specials, description, website, isActive } = req.body;

        const updateData = {
            name,
            contact,
            email,
            socials: specials,
            description,
            website,
            isActive: isActive === 'true' || isActive === true
        };

        if (req.file) {
            updateData.logo = `/uploads/partners/${req.file.filename}`;
        }

        const partner = await prisma.partner.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(partner);
    } catch (error) {
        console.error('Error updating partner:', error);
        res.status(500).json({ error: 'Failed to update partner' });
    }
});

router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        await prisma.partner.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Partner deleted successfully' });
    } catch (error) {
        console.error('Error deleting partner:', error);
        res.status(500).json({ error: 'Failed to delete partner' });
    }
});

// Admin: Manage Rewards
router.post('/rewards', authenticateToken, authorizeRoles('ADMIN'), uploadReward.single('image'), async (req, res) => {
    try {
        const { partnerId, title, description, points, category } = req.body;

        let imageUrl = '';
        if (req.file) {
            imageUrl = `/uploads/rewards/${req.file.filename}`;
        } else if (req.body.image) {
            imageUrl = req.body.image; // Keep external URL if provided
        }

        const reward = await prisma.partnerReward.create({
            data: {
                partnerId,
                title,
                description,
                points: parseInt(points),
                category,
                image: imageUrl
            }
        });
        res.status(201).json(reward);
    } catch (error) {
        console.error('Error creating reward:', error);
        res.status(500).json({ error: 'Failed to create reward' });
    }
});

router.put('/rewards/:id', authenticateToken, authorizeRoles('ADMIN'), uploadReward.single('image'), async (req, res) => {
    try {
        const { title, description, points, category, isActive } = req.body;

        const updateData = {
            title,
            description,
            points: parseInt(points),
            category,
            isActive: isActive === 'true' || isActive === true
        };

        if (req.file) {
            updateData.image = `/uploads/rewards/${req.file.filename}`;
        } else if (req.body.image) {
            updateData.image = req.body.image;
        }

        const reward = await prisma.partnerReward.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(reward);
    } catch (error) {
        console.error('Error updating reward:', error);
        res.status(500).json({ error: 'Failed to update reward' });
    }
});

router.delete('/rewards/:id', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        await prisma.partnerReward.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Reward deleted successfully' });
    } catch (error) {
        console.error('Error deleting reward:', error);
        res.status(500).json({ error: 'Failed to delete reward' });
    }
});

export default router;
