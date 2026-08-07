import { Client } from 'pg';

async function listDbs() {
    const connectionString = 'postgresql://postgres:1313@localhost:5433/postgres';
    const client = new Client({ connectionString });

    try {
        await client.connect();
        const res = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false;');
        console.log('Databases on 5433:', res.rows.map(r => r.datname));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

listDbs();
