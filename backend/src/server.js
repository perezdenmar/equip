console.log('[Debug] Importing modules...');
console.log('[Debug] Importing express...');
import express from 'express';
console.log('[Debug] Importing cors...');
import cors from 'cors';
console.log('[Debug] Importing helmet...');
import helmet from 'helmet';
console.log('[Debug] Importing dotenv...');
import dotenv from 'dotenv';
console.log('[Debug] Importing path...');
import path from 'path';
console.log('[Debug] Importing fs...');
import fs from 'fs';
console.log('[Debug] Importing prisma...');
import prisma from './lib/prisma.js';
console.log('[Debug] Importing authRoutes...');
import authRoutes from './routes/auth.js';
console.log('[Debug] Importing aiRoutes...');
import aiRoutes from './routes/ai.js';
console.log('[Debug] Importing jobsRoutes...');
import jobsRoutes from './routes/jobs.js';
console.log('[Debug] Importing qualificationsRoutes...');
import qualificationsRoutes from './routes/qualifications.js';
console.log('[Debug] Importing documentsRoutes...');
import documentsRoutes from './routes/documents.js';
console.log('[Debug] Importing usersRoutes...');
import usersRoutes from './routes/users.js';
console.log('[Debug] Importing coursesRoutes...');
import coursesRoutes from './routes/courses.js';
console.log('[Debug] Importing settingsRoutes...');
import settingsRoutes from './routes/settings.js';
console.log('[Debug] Importing contactRoutes...');
import contactRoutes from './routes/contact.js';
console.log('[Debug] Importing certificateRoutes...');
import certificateRoutes from './routes/certificates.js';
console.log('[Debug] Importing enrollmentRoutes...');
import enrollmentRoutes from './routes/enrollments.js';
console.log('[Debug] Importing notificationRoutes...');
import notificationRoutes from './routes/notifications.js';
console.log('[Debug] Importing analyticsRoutes...');
import analyticsRoutes from './routes/analytics.js';
console.log('[Debug] Importing wishlistRoutes...');
import wishlistRoutes from './routes/wishlist.js';
console.log('[Debug] Importing pointsRoutes...');
import pointsRoutes from './routes/points.js';
console.log('[Debug] Importing referralRoutes...');
import referralRoutes from './routes/referrals.js';
console.log('[Debug] Importing partnerRoutes...');
import partnerRoutes from './routes/partners.js';
import announcementRoutes from './routes/announcements.js';
console.log('[Debug] Importing initializeScheduler...');
import { initializeScheduler } from './services/syncScheduler.js';

console.log('[Debug] All modules imported. Running dotenv.config()...');
dotenv.config();

console.log('[Debug] Initializing Express app...');
const app = express();
const PORT = process.env.PORT || 5000;

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

        // Normalize origin: lowercase and remove trailing slash for comparison
        const normalized = origin.toLowerCase().replace(/\/$/, '');

        const isExplicitlyAllowed = allowedOrigins.some(ao => ao.toLowerCase().replace(/\/$/, '') === normalized);
        const isEquipDomain = /^https?:\/\/(?:www\.|api\.)?equipdigos\.com(?::\d+)?$/.test(normalized);
        const isLocalhost = /^http:\/\/localhost(:\d+)?$/.test(normalized);

        if (isExplicitlyAllowed || isEquipDomain || isLocalhost) {
            callback(null, true);
        } else {
            console.error(`[CORS Blocked] Origin: ${origin}`);
            callback(null, false); // Standard way to deny
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
}));
app.use(express.json());

// Serve static files from the uploads directory
const uploadsDir = path.join(process.cwd(), 'uploads');
const rewardsDir = path.join(uploadsDir, 'rewards');
const partnersDir = path.join(uploadsDir, 'partners');

[uploadsDir, rewardsDir, partnersDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/qualifications', qualificationsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/announcements', announcementRoutes);

app.get('/', (req, res) => {
    res.send('EQUIP API is running.');
});

// Health check endpoint for deployment monitoring & load balancers
app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', db: 'connected', uptime: process.uptime() });
    } catch (err) {
        res.status(503).json({ status: 'error', db: 'disconnected' });
    }
});

// Initialize Background Data Synchronization
console.log('[Main] Initializing Sync Scheduler...');
initializeScheduler();
console.log('[Main] Sync Scheduler Initialized.');

// Global error-handling middleware (must be after all routes)
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err.stack || err.message);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

try {
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`[FATAL] Port ${PORT} is already in use.`);
        } else {
            console.error('[FATAL] Server error:', error);
        }
        process.exit(1);
    });
} catch (startupError) {
    console.error('FATAL STARTUP ERROR:', startupError);
    process.exit(1);
}

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit();
});

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});
