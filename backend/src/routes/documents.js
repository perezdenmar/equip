import express from 'express';
import multer from 'multer';
import crypto from 'crypto';
import prisma from '../lib/prisma.js';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/authMiddleware.js';

const ALLOWED_MIMETYPES = [
    'image/jpeg', 'image/png', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique string with timestamp and cryptographically secure random bytes
        const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(8).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG, WEBP, PDF, and DOCX are allowed.'), false);
        }
    }
});

// GET all user documents
router.get('/', authenticateToken, async (req, res) => {
    try {
        const documents = await prisma.document.findMany({
            where: { userId: req.user.userId },
            orderBy: { uploadedAt: 'desc' }
        });

        const baseUrl = `${req.protocol}://${req.get('host')}`;

        // Append full URL for frontend access
        const populatedDocs = documents.map(doc => ({
            ...doc,
            url: `${baseUrl}/uploads/${doc.filename}`
        }));

        res.json(populatedDocs);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ error: 'Failed to retrieve documents' });
    }
});

// POST a new document
router.post('/', authenticateToken, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { documentType } = req.body;

        const newDocument = await prisma.document.create({
            data: {
                userId: req.user.userId,
                filename: req.file.filename,
                filepath: req.file.path,
                documentType: documentType || 'Other'
            }
        });

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        res.status(201).json({
            ...newDocument,
            url: `${baseUrl}/uploads/${newDocument.filename}`
        });
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ error: 'Failed to save document record' });
    }
});

// DELETE a document
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const id = req.params.id;

        // Ensure the doc belongs to user before deleting
        const doc = await prisma.document.findUnique({ where: { id } });

        if (!doc) {
            return res.status(404).json({ error: 'Document not found' });
        }

        if (doc.userId !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized to delete this document' });
        }

        // Delete abstract record
        await prisma.document.delete({ where: { id } });

        // Delete physical file
        if (fs.existsSync(doc.filepath)) {
            fs.unlinkSync(doc.filepath);
        }

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ error: 'Failed to delete document' });
    }
});

export default router;
