import { Client } from 'pg';

const emailsToFind = [
    'quantumgroupph@gmail.com',
    'pauieconde@gmail.com'
];

async function findInRoad2Heaven() {
    const connectionString = 'postgresql://postgres:1313@localhost:5433/road2heaven';
    const client = new Client({ connectionString });

    try {
        await client.connect();

        // Find user-related tables first
        const tableRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND (table_name ILIKE '%user%' OR table_name ILIKE '%account%');
        `);
        const tables = tableRes.rows.map(r => r.table_name);
        console.log('User-related tables in road2heaven:', tables);

        for (const table of tables) {
            try {
                const res = await client.query(`SELECT email FROM "${table}" WHERE email = ANY($1)`, [emailsToFind]);
                if (res.rows.length > 0) {
                    console.log(`[MATCH] Found records in "${table}":`);
                    res.rows.forEach(r => console.log(` - ${r.email}`));
                }
            } catch (e) {
                console.log(`[SKIP] Table "${table}" doesn't have an "email" column.`);
            }
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end().catch(() => { });
    }
}

findInRoad2Heaven();
