import { Client } from 'pg';

const emailsToFind = [
    'quantumgroupph@gmail.com',
    'pauieconde@gmail.com'
];

async function deepSearch(dbName, port) {
    const connectionString = `postgresql://postgres:1313@localhost:${port}/${dbName}`;
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log(`\n[DeepSearch] Scanning DB: ${dbName} on Port ${port}`);

        const tableRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE';
        `);
        const tables = tableRes.rows.map(r => r.table_name);

        for (const table of tables) {
            try {
                // Find all columns of type text or character varying
                const colRes = await client.query(`
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = '${table}' 
                    AND data_type IN ('text', 'character varying');
                `);
                const columns = colRes.rows.map(r => r.column_name);

                if (columns.length === 0) continue;

                const whereClause = columns.map(c => `"${c}" = ANY($1)`).join(' OR ');
                const query = `SELECT * FROM "${table}" WHERE ${whereClause}`;

                const res = await client.query(query, [emailsToFind]);
                if (res.rows.length > 0) {
                    console.log(`[FOUND] ${res.rows.length} matches in "${table}":`);
                    res.rows.forEach(r => console.log(JSON.stringify(r)));
                }
            } catch (e) {
                // Ignore errors like permission or missing columns
            }
        }

    } catch (err) {
        console.error(`Error on ${dbName}:`, err.message);
    } finally {
        await client.end().catch(() => { });
    }
}

async function run() {
    const dbs5433 = ['postgres', 'road2heaven', 'equip_db', 'equip_dev'];
    for (const db of dbs5433) {
        await deepSearch(db, 5433);
    }

    const dbs5432 = ['postgres', 'gepsys_db', 'road2heaven'];
    for (const db of dbs5432) {
        await deepSearch(db, 5432);
    }
}

run();
