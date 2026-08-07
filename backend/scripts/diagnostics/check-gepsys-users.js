import { Client } from 'pg';

const emailsToFind = [
    'quantumgroupph@gmail.com',
    'pauieconde@gmail.com',
    'gepsearch@gmail.com',
    'skidz13@gmail.com'
];

async function findUsers() {
    const connectionString = 'postgresql://postgres:1313@localhost:5432/gepsys_db';
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('[Test] Connected to gepsys_db. Searching for users in "users" table...');

        const res = await client.query('SELECT email FROM "users" WHERE email = ANY($1)', [emailsToFind]);

        if (res.rows.length > 0) {
            console.log(`[MATCH] Found ${res.rows.length} production users!`);
            res.rows.forEach(r => console.log(` - ${r.email}`));
        } else {
            const count = await client.query('SELECT COUNT(*) FROM "users"');
            console.log(`[MISSED] No production emails found, but "users" table has ${count.rows[0].count} records.`);

            console.log('\n--- Sample records from "users" ---');
            const samples = await client.query('SELECT email FROM "users" LIMIT 5');
            samples.rows.forEach(r => console.log(` - ${r.email}`));
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end().catch(() => { });
    }
}

findUsers();
