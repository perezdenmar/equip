import pkg from 'pg';
const { Client } = pkg;

async function checkTables() {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'equip_db',
        password: '1313',
        port: 5433,
    });

    try {
        await client.connect();
        console.log("Connected to equip_db successfully.");
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log("Tables in equip_db:", res.rows);
    } catch (err) {
        console.error("Error connecting to database:", err);
    } finally {
        await client.end();
    }
}

checkTables();
