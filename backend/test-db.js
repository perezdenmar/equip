import prisma from './src/lib/prisma.js';

async function test() {
    try {
        console.log('Attempting to connect to database...');
        await prisma.$connect();
        console.log('Connected successfully!');
        const users = await prisma.user.count();
        console.log('User count:', users);
        await prisma.$disconnect();
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
}

test();
