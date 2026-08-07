import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding partners...');
    
    await prisma.partner.create({
        data: {
            name: 'Tech Corp',
            email: 'contact@techcorp.com',
            description: 'A leading tech company partnering with EQUIP.',
            isActive: true,
            rewards: {
                create: [
                    { title: '10% Discount', points: 100, category: 'Discount' }
                ]
            }
        }
    });

    console.log('Partner seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
