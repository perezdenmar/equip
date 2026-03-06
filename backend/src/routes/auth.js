import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { sendOtpEmail } from '../services/emailService.js';
import prisma from '../lib/prisma.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { STRICT_ADMINS, JWT_EXPIRY } from '../lib/config.js';

const router = express.Router();
const activeOtps = new Map();

// Rate limiters to prevent abuse
const otpSendLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { error: 'Too many OTP requests. Please try again later.' } });
const otpVerifyLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many verification attempts. Please try again later.' } });

// Generate and send OTP
router.post('/send-otp', otpSendLimiter, async (req, res) => {
    const { email } = req.body;
    // Accept any valid email — not restricted to Gmail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ error: 'A valid email address is required' });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    activeOtps.set(email, { otp, expires: Date.now() + 5 * 60000 }); // 5 min expiry

    try {
        await sendOtpEmail(email, otp);
        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Failed to send email:', error);
        res.status(500).json({ error: 'Failed to send OTP email. Please check server logs.' });
    }
});

// Verify OTP and Login
router.post('/verify-otp', otpVerifyLimiter, async (req, res) => {
    const { email, otp } = req.body;

    // Master OTP bypass — ONLY available in development
    const isBypassOtp = process.env.NODE_ENV === 'development' && otp === '123456';
    if (!isBypassOtp) {
        const record = activeOtps.get(email);
        if (!record || record.otp !== otp || record.expires < Date.now()) {
            return res.status(401).json({ error: 'Invalid or expired OTP' });
        }
    }

    try {
        const strictAdmins = STRICT_ADMINS;
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Auto-register: assign ADMIN only if in strict list
            const assignedRole = STRICT_ADMINS.includes(email.toLowerCase()) ? 'ADMIN' : 'STUDENT';
            user = await prisma.user.create({
                data: { email, role: assignedRole }
            });
        } else {
            // If an existing user's email is not in the strict list but they are ADMIN, demote them
            if (user.role === 'ADMIN' && !STRICT_ADMINS.includes(email.toLowerCase())) {
                user = await prisma.user.update({
                    where: { email },
                    data: { role: 'STAFF' }
                });
            }
        }

        activeOtps.delete(email);

        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role, isTrainer: user.isTrainer },
            process.env.JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                isTrainer: user.isTrainer,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: {
                enrollments: {
                    include: {
                        qualification: true
                    }
                }
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found. Session may be invalid or user was deleted.' });
        }
        res.json(user);
    } catch (error) {
        console.error('Fetch profile error:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const {
            firstName, lastName, middleName, extensionName,
            birthplaceRegion, birthplaceProvince, birthplaceCity, birthplaceDistrict, dateOfBirth, sex, nationality,
            contact, telephoneNumber, socials,
            street, barangay, district, city, province, region,
            parentName, parentAddress,
            rsbsaNumber, farmerName, farmerRelationship,
            privacyConsent,
            bio, profilePhoto
        } = req.body;

        // Ensure user still exists before updating
        const userExists = await prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!userExists) {
            return res.status(404).json({ error: 'Cannot update profile: User account no longer exists in the system.' });
        }

        // Helper to convert empty strings to undefined
        const cleanStr = (val) => (val === '' ? undefined : (val || undefined));

        // Only pass known schema fields to Prisma to avoid unknown field errors
        // Convert empty strings back to undefined so Prisma doesn't trip on enums/relations
        const updateData = {
            firstName: cleanStr(firstName),
            lastName: cleanStr(lastName),
            middleName: cleanStr(middleName),
            extensionName: cleanStr(extensionName),
            birthplaceRegion: cleanStr(birthplaceRegion),
            birthplaceProvince: cleanStr(birthplaceProvince),
            birthplaceCity: cleanStr(birthplaceCity),
            birthplaceDistrict: cleanStr(birthplaceDistrict),
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            sex: cleanStr(sex),
            nationality: cleanStr(nationality),
            contact: cleanStr(contact),
            telephoneNumber: cleanStr(telephoneNumber),
            socials: socials || undefined,
            street: cleanStr(street),
            barangay: cleanStr(barangay),
            district: cleanStr(district),
            city: cleanStr(city),
            province: cleanStr(province),
            region: cleanStr(region),
            parentName: cleanStr(parentName),
            parentAddress: cleanStr(parentAddress),
            rsbsaNumber: cleanStr(rsbsaNumber),
            farmerName: cleanStr(farmerName),
            farmerRelationship: cleanStr(farmerRelationship),
            bio: cleanStr(bio),
            profilePhoto: cleanStr(profilePhoto),
        };

        // Handle privacyConsent separately since it's a boolean
        if (typeof privacyConsent === 'boolean') {
            updateData.privacyConsent = privacyConsent;
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.userId },
            data: updateData
        });

        // Log the activity
        await prisma.auditLog.create({
            data: {
                userId: req.user.userId,
                action: 'PROFILE_UPDATE',
                details: 'Updated profile information'
            }
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update user profile. Please try again.' });
    }
});

export default router;
