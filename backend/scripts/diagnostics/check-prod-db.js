import { Client } from 'pg';

const emailsToFind = [
    'quantumgroupph@gmail.com',
    'pauieconde@gmail.com',
    'gepsearch@gmail.com',
    'skidz13@gmail.com'
];

async function checkProdDb() {
    const connectionString = 'postgresql://postgres:1313@localhost:5433/equip_prod_db';
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log('[Test] Connected to equip_prod_db. Searching for users...');

        const res = await client.query('SELECT email FROM "User" WHERE email = ANY($1)', [emailsToFind]);
        console.log(`Found ${res.rows.length} production users:`);
        res.rows.forEach(r => console.log(` - ${r.email}`));

        const totalCount = await client.query('SELECT COUNT(*) FROM "User"');
        console.log(`Total users in equip_prod_db: ${totalCount.rows[0].count}`);

    } catch (err) {
        console.error('Error on equip_prod_db:', err.message);
    } finally {
        await client.end();
    }
}

checkProdDb();
