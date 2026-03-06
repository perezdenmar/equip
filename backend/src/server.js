import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
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
import { initializeScheduler } from './services/syncScheduler.js';

dotenv.config();

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
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

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
initializeScheduler();

// Global error-handling middleware (must be after all routes)
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.path}:`, err.stack || err.message);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit();
});
