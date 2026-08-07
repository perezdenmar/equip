async function debug() {
    console.log('Starting debug imports...');

    const modules = [
        'express', 'cors', 'helmet', 'dotenv', 'path',
        './src/lib/prisma.js',
        './src/routes/auth.js',
        './src/routes/ai.js',
        './src/routes/jobs.js',
        './src/routes/qualifications.js',
        './src/routes/documents.js',
        './src/routes/users.js',
        './src/routes/courses.js',
        './src/routes/settings.js',
        './src/routes/contact.js',
        './src/routes/certificates.js',
        './src/routes/enrollments.js',
        './src/routes/notifications.js',
        './src/routes/analytics.js',
        './src/routes/wishlist.js',
        './src/routes/points.js',
        './src/routes/referrals.js',
        './src/routes/partners.js',
        './src/services/syncScheduler.js'
    ];

    for (const mod of modules) {
        try {
            console.log(`Importing ${mod}...`);
            await import(mod);
            console.log(`Successfully imported ${mod}`);
        } catch (err) {
            console.error(`FAILED to import ${mod}:`, err.message);
        }
    }

    console.log('ALL IMPORTS FINISHED');
}

debug();
