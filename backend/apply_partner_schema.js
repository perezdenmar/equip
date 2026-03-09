import fs from 'fs';
import pg from 'pg';
const { Client } = pg;

async function apply() {
    const env = fs.readFileSync('.env', 'utf8');
    const dbUrl = env.match(/DATABASE_URL=\"(.+)\"/)[1];

    const client = new Client({ connectionString: dbUrl });
    try {
        await client.connect();
        console.log('Connected to DB');

        await client.query(`
      CREATE TABLE IF NOT EXISTS "Partner" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "logo" TEXT,
        "contact" TEXT,
        "email" TEXT,
        "socials" JSONB,
        "description" TEXT,
        "website" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS "PartnerReward" (
        "id" TEXT PRIMARY KEY,
        "partnerId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "points" INTEGER NOT NULL,
        "category" TEXT,
        "image" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PartnerReward_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
        console.log('Tables created successfully');
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
apply();
