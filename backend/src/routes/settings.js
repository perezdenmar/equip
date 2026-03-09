import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import prisma from '../lib/prisma.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage for branding assets
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(4).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, `branding-${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit for branding assets
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and ICO are allowed.'), false);
        }
    }
});

// Upload branding asset (Admin Only)
router.post('/upload', authenticateToken, authorizeRoles('ADMIN'), upload.single('asset'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

        res.json({
            url: fileUrl,
            filename: req.file.filename,
            path: `/uploads/${req.file.filename}`
        });
    } catch (error) {
        console.error('Error uploading branding asset:', error);
        res.status(500).json({ error: 'Failed to upload asset' });
    }
});

// Get all site settings (Public to render the frontend)
router.get('/', async (req, res) => {
    try {
        const settings = await prisma.siteSetting.findMany();
        // Convert to a more usable dictionary format: { "landing_hero": {...}, "theme_config": {...} }
        const settingsDict = {};
        settings.forEach(setting => {
            settingsDict[setting.key] = setting.value;
        });

        res.json(settingsDict);
    } catch (error) {
        console.error('Error fetching site settings:', error);
        res.status(500).json({ error: 'Failed to fetch site settings' });
    }
});

// Update or create a site setting (Admin Only)
router.put('/:key', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const { key } = req.params;
        const value = req.body;

        if (!value || typeof value !== 'object') {
            return res.status(400).json({ error: 'Setting value must be a valid JSON object' });
        }

        const updatedSetting = await prisma.siteSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });

        res.json(updatedSetting);
    } catch (error) {
        console.error(`Error updating site setting ${req.params.key}:`, error);
        res.status(500).json({ error: 'Failed to update site setting' });
    }
});

// Bulk update site settings (Admin Only)
router.put('/', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const settings = req.body; // Expects an object like { landing_hero: {...}, theme_config: {...} }

        if (!settings || typeof settings !== 'object') {
            return res.status(400).json({ error: 'Body must be a valid JSON object mapping keys to values' });
        }

        const upsertPromises = Object.entries(settings).map(([key, value]) => {
            return prisma.siteSetting.upsert({
                where: { key },
                update: { value },
                create: { key, value }
            });
        });

        await Promise.all(upsertPromises);
        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Error bulk updating site settings:', error);
        res.status(500).json({ error: 'Failed to bulk update site settings' });
    }
});

// Update specialized notification settings (Admin Only)
router.put('/notifications', authenticateToken, authorizeRoles('ADMIN'), async (req, res) => {
    try {
        const config = req.body;
        const key = 'notification_config';

        // Basic validation
        if (!config || typeof config !== 'object') {
            return res.status(400).json({ error: 'Config must be a valid JSON object' });
        }

        // Fetch current for logging
        const current = await prisma.siteSetting.findUnique({ where: { key } });

        const updatedSetting = await prisma.siteSetting.upsert({
            where: { key },
            update: { value: config },
            create: { key, value: config }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                userId: req.user.userId,
                action: 'UPDATE_NOTIFICATION_CONFIG',
                details: `Updated notification configuration. Changes: ${JSON.stringify({
                    from: current ? current.value : {},
                    to: config
                })}`
            }
        });

        res.json(updatedSetting);
    } catch (error) {
        console.error('Error updating notification config:', error);
        res.status(500).json({ error: 'Failed to update notification configuration' });
    }
});

export default router;
