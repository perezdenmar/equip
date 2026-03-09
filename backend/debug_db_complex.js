import { Client } from 'pg';

async function checkDatabases() {
    const connectionString = 'postgresql://postgres:1313@localhost:5433/postgres';
    const client = new Client({ connectionString });

    try {
        await client.connect();
        const res = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false;');
        console.log('Databases available:', res.rows.map(r => r.datname));

        // Switch to equip_db and check tables/counts again specifically
        const client2 = new Client({ connectionString: 'postgresql://postgres:1313@localhost:5433/equip_db' });
        await client2.connect();
        const tables = await client2.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
        console.log('Tables in equip_db:', tables.rows.map(r => r.table_name));

        await client2.end();
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
        process.exit(0);
    }
}

checkDatabases();
