import { Client } from 'pg';

async function inspectSchema() {
    const connectionString = 'postgresql://postgres:1313@localhost:5432/gepsys_db';
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('[Test] Inspecting "users" table schema in gepsys_db...');
        const res = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY ordinal_position;
        `);
        console.table(res.rows);

        console.log('\n[Test] Checking for any other users table anywhere on port 5432...');
        const allUsers = await client.query(`
            SELECT table_catalog, table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_name ILIKE '%user%' 
            AND table_schema NOT IN ('information_schema', 'pg_catalog');
        `);
        console.table(allUsers.rows);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end().catch(() => { });
    }
}

inspectSchema();
