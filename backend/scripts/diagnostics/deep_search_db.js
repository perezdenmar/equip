import { Client } from 'pg';

async function run() {
    const client = new Client({ connectionString: 'postgresql://postgres:1313@192.168.68.104:5444/equip_db' });
    try {
        await client.connect();
        
        console.log('--- ALL SCHEMAS ---');
        const schemas = await client.query("SELECT schema_name FROM information_schema.schemata");
        console.log(schemas.rows.map(r => r.schema_name));

        console.log('--- ALL TABLES (including other schemas) ---');
        const tables = await client.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('information_schema', 'pg_catalog')");
        tables.rows.forEach(r => console.log(`${r.table_schema}.${r.table_name}`));

        console.log('--- SEARCHING FOR pauieconde@gmail.com IN ALL TABLES ---');
        // We'll only check tables that have an 'email' column
        const emailTables = await client.query("SELECT table_schema, table_name FROM information_schema.columns WHERE column_name = 'email' AND table_schema NOT IN ('information_schema', 'pg_catalog')");
        for (const row of emailTables.rows) {
            try {
                const search = await client.query(`SELECT email FROM "${row.table_schema}"."${row.table_name}" WHERE email = 'pauieconde@gmail.com'`);
                if (search.rows.length > 0) {
                    console.log(`FOUND IN ${row.table_schema}.${row.table_name}`);
                }
            } catch (e) {
                // Ignore errors (e.g. table name conflicts with quotes)
            }
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}
run();
