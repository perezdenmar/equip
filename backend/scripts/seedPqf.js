import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
    try {
        const dataPath = path.join(process.cwd(), 'prisma', 'pqf_qualifications.json');
        if (!fs.existsSync(dataPath)) {
            console.error('Data file not found at', dataPath);
            return;
        }

        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const qualifications = JSON.parse(rawData);

        console.log(`Seeding ${qualifications.length} official qualifications...`);

        // Insert in batches or using createMany
        const result = await prisma.officialQualification.createMany({
            data: qualifications,
            skipDuplicates: true
        });

        console.log(`Successfully seeded ${result.count} official qualifications.`);
    } catch (error) {
        console.error('Error seeding official qualifications:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
