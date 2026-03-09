import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all active qualifications
router.get('/', async (req, res) => {
    try {
        const qualifications = await prisma.qualification.findMany({
            where: { isActive: true },
            include: { trainers: { select: { id: true, firstName: true, lastName: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(qualifications);
    } catch (error) {
        console.error('Error fetching qualifications:', error);
        res.status(500).json({ error: 'Failed to fetch qualifications' });
    }
});

// Search official qualifications
router.get('/official/search', authenticateToken, authorizeRoles('ADMIN', 'TRAINER'), async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.json([]);
        }

        const results = await prisma.officialQualification.findMany({
            where: {
                OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { code: { contains: q, mode: 'insensitive' } }
                ]
            },
            take: 20
        });
        res.json(results);
    } catch (error) {
        console.error('Error searching official qualifications:', error);
        res.status(500).json({ error: 'Failed to search official qualifications' });
    }
});

// Get a single qualification by ID
router.get('/:id', async (req, res) => {
    try {
        const qualification = await prisma.qualification.findUnique({
            where: { id: req.params.id },
            include: { trainers: { select: { id: true, firstName: true, lastName: true, email: true } } }
        });
        if (!qualification) {
            return res.status(404).json({ error: 'Qualification not found' });
        }
        res.json(qualification);
    } catch (error) {
        console.error('Error fetching qualification:', error);
        res.status(500).json({ error: 'Failed to fetch qualification' });
    }
});

// Create a new qualification
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'TRAINER'), async (req, res) => {
    try {
        const { title, description, code, trainerIds, duration, level, category, coverImage, syllabus, status, startDate, endDate } = req.body;

        // Basic validation
        if (!title || !code) {
            return res.status(400).json({ error: 'Title and code are required' });
        }

        const newQualification = await prisma.qualification.create({
            data: {
                title,
                description,
                code,
                duration,
                level,
                category,
                coverImage,
                syllabus: syllabus || [],
                status: status || 'COMING_SOON',
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                trainers: trainerIds?.length > 0 ? {
                    connect: trainerIds.map(id => ({ id }))
                } : undefined
            },
            include: { trainers: { select: { id: true, firstName: true, lastName: true, email: true } } }
        });
        res.status(201).json(newQualification);
    } catch (error) {
        console.error('Error creating qualification:', error);
        // Handle unique constraint violation for code
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Qualification code already exists' });
        }
        res.status(500).json({ error: 'Failed to create qualification' });
    }
});

// Update a qualification
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'TRAINER'), async (req, res) => {
    try {
        const { title, description, code, trainerIds, duration, level, category, coverImage, syllabus, isActive, status, startDate, endDate } = req.body;
        const updatedQualification = await prisma.qualification.update({
            where: { id: req.params.id },
            data: {
                title,
                description,
                code,
                duration,
                level,
                category,
                coverImage,
                syllabus: syllabus || [],
                isActive,
                status,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                trainers: trainerIds ? {
                    set: trainerIds.map(id => ({ id }))
                } : undefined
            },
            include: { trainers: { select: { id: true, firstName: true, lastName: true, email: true } } }
        });
        res.json(updatedQualification);
    } catch (error) {
        console.error('Error updating qualification:', error);
        res.status(500).json({ error: 'Failed to update qualification' });
    }
});

// Delete a qualification (soft delete by setting isActive to false)
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN', 'TRAINER'), async (req, res) => {
    try {
        const deletedQualification = await prisma.qualification.update({
            where: { id: req.params.id },
            data: { isActive: false }
        });
        res.json({ message: 'Qualification deactivated successfully', qualification: deletedQualification });
    } catch (error) {
        console.error('Error deleting qualification:', error);
        res.status(500).json({ error: 'Failed to delete qualification' });
    }
});

export default router;
