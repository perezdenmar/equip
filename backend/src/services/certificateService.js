import PDFDocument from 'pdfkit';
import prisma from '../lib/prisma.js';
import path from 'path';
import fs from 'fs';

/**
 * Generates a certificate of completion as a PDF stream
 * @param {string} enrollmentId 
 * @returns {Promise<PDFDocument>}
 */
export const generateCertificate = async (enrollmentId) => {
    const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
            user: true,
            qualification: true
        }
    });

    if (!enrollment) {
        throw new Error('Enrollment not found');
    }

    if (enrollment.status !== 'COMPLETED') {
        throw new Error('Certificate can only be generated for completed courses');
    }

    const doc = new PDFDocument({
        layout: 'landscape',
        size: 'A4',
        margins: { top: 50, right: 50, bottom: 50, left: 50 }
    });

    const studentName = `${enrollment.user.firstName || ''} ${enrollment.user.lastName || ''}`.trim() || enrollment.user.email;
    const courseTitle = enrollment.qualification.title;
    const completionDate = new Date(enrollment.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Border
    doc.lineWidth(5)
        .strokeColor('#f97316')
        .rect(25, 25, doc.page.width - 50, doc.page.height - 50)
        .stroke();

    doc.lineWidth(2)
        .strokeColor('#1e293b')
        .rect(35, 35, doc.page.width - 70, doc.page.height - 70)
        .stroke();

    // Logo
    // Path resolution: current dir is backend/src/services
    const logoPath = path.join(process.cwd(), '..', 'frontend', 'public', 'logo.png');
    if (fs.existsSync(logoPath)) {
        doc.image(logoPath, (doc.page.width / 2) - 40, 60, { width: 80 });
    }

    // Header Branding
    doc.moveDown(7);
    doc.fillColor('#1e293b')
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('EQUIP QUANTUM UPSKILLING INSTITUTE', { align: 'center' });

    doc.fontSize(10)
        .font('Helvetica')
        .text('OF THE PHILIPPINES, INC.', { align: 'center' });

    // Certificate Title
    doc.moveDown(2);
    doc.fillColor('#f97316')
        .fontSize(40)
        .font('Helvetica-Bold')
        .text('CERTIFICATE OF COMPLETION', { align: 'center' });

    // Body
    doc.moveDown(1.5);
    doc.fillColor('#1e293b')
        .fontSize(16)
        .font('Helvetica')
        .text('This is to certify that', { align: 'center' });

    doc.moveDown(0.5);
    doc.fillColor('#1e293b')
        .fontSize(32)
        .font('Helvetica-Bold')
        .text(studentName.toUpperCase(), { align: 'center' });

    doc.moveDown(0.5);
    doc.fillColor('#1e293b')
        .fontSize(16)
        .font('Helvetica')
        .text('has successfully completed the prescribed course of study for', { align: 'center' });

    doc.moveDown(0.5);
    doc.fillColor('#f97316')
        .fontSize(24)
        .font('Helvetica-Bold')
        .text(courseTitle, { align: 'center' });

    // Date
    doc.moveDown(2);
    doc.fillColor('#1e293b')
        .fontSize(14)
        .font('Helvetica')
        .text(`Issued on this ${completionDate}`, { align: 'center' });

    // Signature Area
    const signatureY = doc.page.height - 120;

    doc.lineWidth(1)
        .strokeColor('#1e293b')
        .moveTo((doc.page.width / 2) - 100, signatureY)
        .lineTo((doc.page.width / 2) + 100, signatureY)
        .stroke();

    doc.fontSize(12)
        .font('Helvetica-Bold')
        .text('ADMINISTRATION', (doc.page.width / 2) - 100, signatureY + 10, { width: 200, align: 'center' });

    doc.end();
    return doc;
};
