import express from 'express';
import rateLimit from 'express-rate-limit';
import { sendContactEmail } from '../services/emailService.js';

const router = express.Router();

// Rate limiter: max 5 contact submissions per 15 minutes per IP
const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { error: 'Too many submissions. Please try again later.' } });

// @route   POST /api/contact
// @desc    Receive contact form submissions and send email
// @access  Public
router.post('/', contactLimiter, async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format.' });
        }

        // Send email via configured nodemailer
        await sendContactEmail({ name, email, subject, message });

        res.status(200).json({ message: 'Message sent successfully.' });
    } catch (error) {
        console.error('Contact Form Error:', error);
        res.status(500).json({ error: 'Failed to send message. Please try again later.' });
    }
});

export default router;
