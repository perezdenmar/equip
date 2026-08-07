import { Client } from 'pg';

async function checkPort5432() {
    const passwords = ['postgres', '1313', ''];
    console.log('--- Checking 5432 with multiple passwords ---');

    for (const pw of passwords) {
        const connectionString = `postgresql://postgres:${pw}@localhost:5432/postgres`;
        const client = new Client({ connectionString });
        try {
            await client.connect();
            console.log(`Success with password: "${pw}"`);
            const res = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false;');
            console.log('Databases on 5432:', res.rows.map(r => r.datname));

            if (res.rows.some(r => r.datname === 'equip_db')) {
                const client2 = new Client({ connectionString: `postgresql://postgres:${pw}@localhost:5432/equip_db` });
                await client2.connect();
                const partners = await client2.query('SELECT COUNT(*) FROM "Partner";');
                console.log('Partners on 5432 (equip_db):', partners.rows[0].count);
                await client2.end();
            }
            await client.end();
            break;
        } catch (err) {
            console.log(`Failed with password "${pw}": ${err.message}`);
            await client.end().catch(() => { });
        }
    }
    process.exit(0);
}

checkPort5432();
