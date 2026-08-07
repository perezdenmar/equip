import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import rateLimit from 'express-rate-limit';
import pino from 'pino';

import prisma from './lib/prisma.js';
import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';
import jobsRoutes from './routes/jobs.js';
import qualificationsRoutes from './routes/qualifications.js';
import documentsRoutes from './routes/documents.js';
import usersRoutes from './routes/users.js';
import coursesRoutes from './routes/courses.js';
import settingsRoutes from './routes/settings.js';
import contactRoutes from './routes/contact.js';
import certificateRoutes from './routes/certificates.js';
import enrollmentRoutes from './routes/enrollments.js';
import notificationRoutes from './routes/notifications.js';
import analyticsRoutes from './routes/analytics.js';
import wishlistRoutes from './routes/wishlist.js';
import pointsRoutes from './routes/points.js';
import referralRoutes from './routes/referrals.js';
import partnerRoutes from './routes/partners.js';
import announcementRoutes from './routes/announcements.js';
import { initializeScheduler } from './services/syncScheduler.js';

// ─── Logger ────────────────────────────────────────────────────────────────
export const logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport: process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
});

logger.info('All modules imported. Initializing app...');

// ─── App Init ──────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = [
    'https://equipdigos.com',
    'https://www.equipdigos.com',
    'https://api.equipdigos.com',
    'http://localhost:5173',
    'http://localhost:8080'
];

if (process.env.CORS_ORIGIN) {
    process.env.CORS_ORIGIN.split(',').forEach(o => {
        const trimmed = o.trim();
        if (trimmed && !allowedOrigins.includes(trimmed)) allowedOrigins.push(trimmed);
    });
}

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const normalized = origin.toLowerCase().replace(/\/$/, '');
        const isExplicitlyAllowed = allowedOrigins.some(ao => ao.toLowerCase().replace(/\/$/, '') === normalized);
        const isEquipDomain = /^https?:\/\/(?:www\.|api\.)?equipdigos\.com(?::\d+)?$/.test(normalized);
        const isLocalhost = /^http:\/\/localhost(:\d+)?$/.test(normalized);
        if (isExplicitlyAllowed || isEquipDomain || isLocalhost) {
            callback(null, true);
        } else {
            logger.warn({ origin }, '[CORS Blocked]');
            callback(null, false);
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}));

// ─── Security Headers (Helmet + CSP) ───────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc:  ["'self'"],
            styleSrc:   ["'self'", "'unsafe-inline'"],
            imgSrc:     ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'https://api.equipdigos.com'],
            fontSrc:    ["'self'", 'https://fonts.gstatic.com'],
            objectSrc:  ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
}));

app.use(express.json());

// ─── Rate Limiting ─────────────────────────────────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many attempts. Please try again in 15 minutes.' }
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── Static File Serving ───────────────────────────────────────────────────
const uploadsDir = path.join(process.cwd(), 'uploads');
const rewardsDir = path.join(uploadsDir, 'rewards');
const partnersDir = path.join(uploadsDir, 'partners');

[uploadsDir, rewardsDir, partnersDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

app.use('/uploads', express.static(uploadsDir));

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',           authRoutes);
app.use('/api/ai',             aiRoutes);
app.use('/api/jobs',           jobsRoutes);
app.use('/api/qualifications', qualificationsRoutes);
app.use('/api/documents',      documentsRoutes);
app.use('/api/users',          usersRoutes);
app.use('/api/courses',        coursesRoutes);
app.use('/api/settings',       settingsRoutes);
app.use('/api/contact',        contactRoutes);
app.use('/api/certificates',   certificateRoutes);
app.use('/api/enrollments',    enrollmentRoutes);
app.use('/api/notifications',  notificationRoutes);
app.use('/api/analytics',      analyticsRoutes);
app.use('/api/wishlist',       wishlistRoutes);
app.use('/api/points',         pointsRoutes);
app.use('/api/referrals',      referralRoutes);
app.use('/api/partners',       partnerRoutes);
app.use('/api/announcements',  announcementRoutes);

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/', (req, res) => res.send('EQUIP API is running.'));

app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', db: 'connected', uptime: process.uptime() });
    } catch (err) {
        res.status(503).json({ status: 'error', db: 'disconnected' });
    }
});

// ─── Background Scheduler ──────────────────────────────────────────────────
logger.info('Initializing Sync Scheduler...');
initializeScheduler();
logger.info('Sync Scheduler initialized.');

// ─── Global Error Handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
    logger.error({ err, method: req.method, path: req.path }, 'Unhandled error');
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// ─── Server Start ──────────────────────────────────────────────────────────
try {
    const server = app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
    });

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            logger.fatal(`Port ${PORT} is already in use.`);
        } else {
            logger.fatal({ error }, 'Server error');
        }
        process.exit(1);
    });
} catch (startupError) {
    logger.fatal({ startupError }, 'FATAL STARTUP ERROR');
    process.exit(1);
}

process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down...');
    await prisma.$disconnect();
    process.exit();
});

process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'UNCAUGHT EXCEPTION');
});

process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'UNHANDLED REJECTION');
});
