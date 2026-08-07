import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

async function check() {
    try {
        console.log('Connecting to:', process.env.DATABASE_URL);
        await client.connect();
        console.log('Successfully connected to database');
        const res = await client.query('SELECT current_database(), current_user, version()');
        console.log('Database info:', res.rows[0]);
        await client.end();
    } catch (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    }
}

check();
