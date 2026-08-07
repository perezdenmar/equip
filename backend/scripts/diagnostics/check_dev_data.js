import { Client } from 'pg';

async function checkDevData() {
    const connectionString = 'postgresql://postgres:1313@localhost:5433/equip_dev';
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('--- Checking equip_dev ---');
        const partners = await client.query('SELECT COUNT(*) FROM "Partner";');
        console.log('Partners:', partners.rows[0].count);
        const users = await client.query('SELECT COUNT(*) FROM "User";');
        console.log('Users:', users.rows[0].count);
        const quals = await client.query('SELECT COUNT(*) FROM "Qualification";');
        console.log('Qualifications:', quals.rows[0].count);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
        process.exit(0);
    }
}

checkDevData();
