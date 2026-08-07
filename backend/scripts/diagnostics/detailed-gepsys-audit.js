import { Client } from 'pg';

const emailsToFind = [
    'quantumgroupph@gmail.com',
    'pauieconde@gmail.com',
    'gepsearch@gmail.com',
    'skidz13@gmail.com'
];

async function run() {
    const connectionString = 'postgresql://postgres:1313@localhost:5432/gepsys_db';
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('[Test] Connected to gepsys_db on 5432.');

        // 1. Get ALL columns of the users table (not truncated)
        const cols = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY ordinal_position;
        `);
        console.log('\n--- Full "users" Table Schema ---');
        cols.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

        // 2. Search for the missing emails in EVERY table (just in case they are in a different table)
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);

        console.log('\n--- Deep Search for missing emails in gepsys_db ---');
        for (const t of tables.rows.map(r => r.table_name)) {
            try {
                const searchCols = await client.query(`
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = '${t}' 
                    AND data_type IN ('text', 'character varying');
                `);
                if (searchCols.rows.length === 0) continue;

                const where = searchCols.rows.map(c => `"${c.column_name}" = ANY($1)`).join(' OR ');
                const res = await client.query(`SELECT * FROM "${t}" WHERE ${where}`, [emailsToFind]);
                if (res.rows.length > 0) {
                    console.log(`[FOUND] Match in ${t}:`);
                    res.rows.forEach(r => console.log(JSON.stringify(r)));
                }
            } catch (e) { }
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end().catch(() => { });
    }
}

run();
