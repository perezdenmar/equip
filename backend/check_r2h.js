import { Client } from 'pg';

async function checkRoad2Heaven() {
    const connectionString = 'postgresql://postgres:1313@localhost:5433/road2heaven';
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('--- Checking road2heaven ---');
        const partners = await client.query('SELECT COUNT(*) FROM "Partner";');
        console.log('Partners:', partners.rows[0].count);
        const users = await client.query('SELECT COUNT(*) FROM "User";');
        console.log('Users:', users.rows[0].count);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
        process.exit(0);
    }
}

checkRoad2Heaven();
