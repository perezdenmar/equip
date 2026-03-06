import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting Official PQF Qualifications Seeding...');

    try {
        const jsonPath = path.join(__dirname, 'pqf_qualifications.json');
        const data = await fs.readFile(jsonPath, 'utf8');
        const qualifications = JSON.parse(data);

        console.log(`📦 Loaded ${qualifications.length} qualifications from JSON.`);

        let count = 0;
        // Batch processing for better performance and to avoid memory issues
        const batchSize = 100;

        for (let i = 0; i < qualifications.length; i += batchSize) {
            const batch = qualifications.slice(i, i + batchSize);

            await Promise.all(batch.map(q =>
                prisma.officialQualification.upsert({
                    where: { code: q.code },
                    update: {
                        title: q.title,
                        descriptor: q.descriptor
                    },
                    create: {
                        code: q.code,
                        title: q.title,
                        descriptor: q.descriptor
                    }
                })
            ));

            count += batch.length;
            process.stdout.write(`\r✅ Processed ${count}/${qualifications.length} qualifications...`);
        }

        console.log('\n\n✨ Seeding completed successfully!');
    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
