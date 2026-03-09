import { Client } from 'pg';

async function checkPort5444() {
    const connectionString = 'postgresql://postgres:1313@localhost:5444/equip_db';
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('--- Checking Port 5444 (Docker DB) ---');
        const partners = await client.query('SELECT COUNT(*) FROM "Partner";');
        console.log('Partners:', partners.rows[0].count);
        const users = await client.query('SELECT COUNT(*) FROM "User";');
        console.log('Users:', users.rows[0].count);
        const quals = await client.query('SELECT COUNT(*) FROM "Qualification";');
        console.log('Qualifications:', quals.rows[0].count);
    } catch (err) {
        console.error('Error on 5444:', err.message);
    } finally {
        await client.end();
        process.exit(0);
    }
}

checkPort5444();
