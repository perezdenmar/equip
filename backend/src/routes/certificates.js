import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { generateCertificate } from '../services/certificateService.js';
import prisma from '../lib/prisma.js';

const router = express.Router();

/**
 * GET /api/certificates/:enrollmentId
 * Generates and downloads the certificate for a completed enrollment
 */
router.get('/:enrollmentId', authenticateToken, async (req, res) => {
    try {
        const { enrollmentId } = req.params;

        // Fetch enrollment to check ownership
        const enrollment = await prisma.enrollment.findUnique({
            where: { id: enrollmentId },
            select: { userId: true, status: true }
        });

        if (!enrollment) {
            return res.status(404).json({ error: 'Enrollment record not found' });
        }

        // Only the student who owns the enrollment or an ADMIN can download the certificate
        if (enrollment.userId !== req.user.userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Unauthorized access to this certificate' });
        }

        if (enrollment.status !== 'COMPLETED') {
            return res.status(400).json({ error: 'Course must be completed to generate a certificate' });
        }

        // Generate PDF
        const doc = await generateCertificate(enrollmentId);

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Certificate-${enrollmentId}.pdf`);

        // Stream the PDF to the response
        doc.pipe(res);

    } catch (error) {
        console.error('Certificate generation error:', error);
        res.status(500).json({ error: 'Failed to generate certificate PDF' });
    }
});

export default router;
