import { Client } from 'pg';

const emailsToFind = [
    'quantumgroupph@gmail.com',
    'pauieconde@gmail.com',
    'gepsearch@gmail.com',
    'skidz13@gmail.com'
];

async function checkDb(dbName) {
    const connectionString = `postgresql://postgres:1313@localhost:5433/${dbName}`;
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log(`\n[Test] Connected to ${dbName}. Searching for users...`);

        const res = await client.query('SELECT email FROM "User" WHERE email = ANY($1)', [emailsToFind]);
        console.log(`Found ${res.rows.length} production users in ${dbName}:`);
        res.rows.forEach(r => console.log(` - ${r.email}`));

        const totalCount = await client.query('SELECT COUNT(*) FROM "User"');
        console.log(`Total users in ${dbName}: ${totalCount.rows[0].count}`);

    } catch (err) {
        console.log(`[SKIP] Table "User" likely missing in ${dbName}: ${err.message}`);
    } finally {
        await client.end();
    }
}

async function run() {
    await checkDb('road2heaven');
    await checkDb('equip_dev');
}

run();
