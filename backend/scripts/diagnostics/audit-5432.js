import { Client } from 'pg';

const emailsToFind = [
    'quantumgroupph@gmail.com',
    'pauieconde@gmail.com',
    'gepsearch@gmail.com',
    'skidz13@gmail.com'
];

async function checkDatabase(dbName) {
    const connectionString = `postgresql://postgres:1313@localhost:5432/${dbName}`;
    const client = new Client({ connectionString });

    try {
        await client.connect();
        console.log(`\n[Test] Checking Database: ${dbName}`);

        // Check for User table first
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'User'
            );
        `);

        if (!tableCheck.rows[0].exists) {
            console.log(`[SKIP] No "User" table in ${dbName}`);
            return;
        }

        const res = await client.query('SELECT email FROM "User" WHERE email = ANY($1)', [emailsToFind]);

        if (res.rows.length > 0) {
            console.log(`[MATCH] Found ${res.rows.length} production users in ${dbName}!`);
            res.rows.forEach(r => console.log(` - ${r.email}`));
        } else {
            const count = await client.query('SELECT COUNT(*) FROM "User"');
            console.log(`[MISSED] No production emails, but "User" table exists with ${count.rows[0].count} records.`);
        }

    } catch (error) {
        console.log(`[FAIL] Could not access ${dbName}: ${error.message.split('\n')[0]}`);
    } finally {
        await client.end().catch(() => { });
    }
}

async function run() {
    // List databases first to be sure
    const client = new Client({ connectionString: 'postgresql://postgres:1313@localhost:5432/postgres' });
    try {
        await client.connect();
        const res = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false;');
        const dbs = res.rows.map(r => r.datname);
        console.log('Databases on 5432:', dbs);

        for (const db of dbs) {
            await checkDatabase(db);
        }
    } catch (e) {
        console.error('Initial connection failed:', e.message.split('\n')[0]);
    } finally {
        await client.end().catch(() => { });
    }
}

run();
