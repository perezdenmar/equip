import { Client } from 'pg';

async function listTables() {
    const connectionString = 'postgresql://postgres:1313@localhost:5432/gepsys_db';
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('[Test] Connected to gepsys_db. Listing tables...');
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `);
        console.log('Tables in gepsys_db:', res.rows.map(r => r.table_name));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end().catch(() => { });
    }
}

listTables();
