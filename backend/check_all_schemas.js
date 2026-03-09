import { Client } from 'pg';

async function checkAllSchemas() {
    const connectionString = 'postgresql://postgres:1313@localhost:5433/equip_db';
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('--- Checking all schemas in equip_db ---');
        const schemas = await client.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema');");
        console.log('Schemas:', schemas.rows.map(r => r.schema_name));

        for (const schema of schemas.rows) {
            const name = schema.schema_name;
            const tables = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = '${name}';`);
            console.log(`Tables in ${name}:`, tables.rows.map(r => r.table_name));

            if (tables.rows.some(t => t.table_name === 'Partner')) {
                const count = await client.query(`SELECT COUNT(*) FROM "${name}"."Partner";`);
                console.log(`Partner count in ${name}:`, count.rows[0].count);
            }
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
        process.exit(0);
    }
}

checkAllSchemas();
