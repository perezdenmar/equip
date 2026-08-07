import { Client } from 'pg';

async function checkPort5432() {
    const connectionString = 'postgresql://postgres:1313@localhost:5432/postgres';
    const client = new Client({ connectionString });

    try {
        await client.connect();
        const res = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false;');
        console.log('Databases on 5432:', res.rows.map(r => r.datname));

        if (res.rows.some(r => r.datname === 'equip_db')) {
            const client2 = new Client({ connectionString: 'postgresql://postgres:1313@localhost:5432/equip_db' });
            await client2.connect();
            const partners = await client2.query('SELECT COUNT(*) FROM "Partner";');
            console.log('Partners on 5432:', partners.rows[0].count);
            const quals = await client2.query('SELECT COUNT(*) FROM "Qualification";');
            console.log('Qualifications on 5432:', quals.rows[0].count);
            await client2.end();
        }
    } catch (err) {
        console.error('Error on 5432:', err.message);
    } finally {
        await client.end();
        process.exit(0);
    }
}

checkPort5432();
