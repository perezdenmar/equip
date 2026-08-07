import { Client } from 'pg';

const emailsToFind = [
    'quantumgroupph@gmail.com',
    'pauieconde@gmail.com',
    'gepsearch@gmail.com',
    'skidz13@gmail.com'
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
                // Find all columns
                const colRes = await client.query(`
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = '${table}';
                `);
                const columns = colRes.rows.map(r => r.column_name);

                if (columns.length === 0) continue;

                // Search for any of our emails in any column
                for (const email of emailsToFind) {
                    const whereClause = columns.map(c => `CAST("${c}" AS text) = '${email}'`).join(' OR ');
                    const query = `SELECT * FROM "${table}" WHERE ${whereClause}`;

                    const res = await client.query(query);
                    if (res.rows.length > 0) {
                        console.log(`[FOUND] ${res.rows.length} matches for "${email}" in "${table}":`);
                        res.rows.forEach(r => console.log(JSON.stringify(r)));
                    }
                }
            } catch (e) {
                // Ignore errors
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
