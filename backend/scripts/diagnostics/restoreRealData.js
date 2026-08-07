import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:1313@192.168.68.104:5444/equip_db?schema=public"
        }
    }
});

async function main() {
    console.log('--- RESTORING ACTUAL ADMIN RECORDS ---');

    console.log('1. Deleting Dummy Trainers...');
    const dummyNames = ['Ernesto', 'Roberto', 'Arturo', 'Manny'];
    const dummySurnames = ['Guevara', 'Sanchez', 'Dimagulangan', 'Pacquiao'];
    
    // Delete test users by first name and last name
    await prisma.user.deleteMany({
        where: {
            OR: [
                { firstName: 'Ernesto', lastName: 'Guevara' },
                { firstName: 'Roberto', lastName: 'Sanchez' },
                { firstName: 'Arturo', lastName: 'Dimagulangan' },
                { firstName: 'Manny', lastName: 'Pacquiao' }
            ]
        }
    });

    console.log('2. Removing Dummy Partners...');
    await prisma.partner.deleteMany({
        where: { name: 'Tech Corp' }
    });

    console.log('3. Inserting Real Partner...');
    await prisma.partner.upsert({
        where: { id: 'grab-food-partner' },
        update: {},
        create: {
            id: 'grab-food-partner',
            name: 'Grab Food',
            description: 'Leading platform for food delivery and logistics.',
            isActive: true
        }
    });

    console.log('4. Removing Dummy Courses...');
    // We can just rename HEO-FL-01 to HEO – Forklift NC II and HEO-GR-01 to Hydraulic Excavator
    await prisma.qualification.deleteMany({
        where: {
            code: { in: ['HEO-FL-01', 'HEO-GR-01'] }
        }
    });

    console.log('5. Inserting Real Qualifications...');
    await prisma.qualification.upsert({
        where: { code: 'HEO-FORK-NCII' },
        update: {},
        create: {
            title: 'HEO – Forklift NC II',
            code: 'HEO-FORK-NCII',
            description: 'Heavy Equipment Operations: Forklift Operations NC II Certification.',
            level: 'INTERMEDIATE',
            category: 'Construction',
            duration: '120 Hours',
            isActive: true,
            status: 'OPEN'
        }
    });

    await prisma.qualification.upsert({
        where: { code: 'HEO-HYD-NCII' },
        update: {},
        create: {
            title: 'HEO – Hydraulic Excavator NC II',
            code: 'HEO-HYD-NCII',
            description: 'Heavy Equipment Operations: Hydraulic Excavator NC II Certification.',
            level: 'ADVANCED',
            category: 'Construction',
            duration: '160 Hours',
            isActive: true,
            status: 'OPEN'
        }
    });

    console.log('--- DONE ---');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
