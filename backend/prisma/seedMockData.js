const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const firstNames = ["Juan", "Maria", "Pedro", "Ana", "Jose", "Luis", "Carlos", "Miguel", "Elena", "Rosa", "Marcos", "Antonio", "Javier", "Isabel", "Cristina", "Fernando", "Ricardo", "Gabriel", "Patricia", "Lucia", "Jorge", "Raul", "Andres", "Diego", "Manuel", "Adrian", "Beatriz", "Carmen", "Daniel", "Eduardo"];
const lastNames = ["Garcia", "Martinez", "Rodriguez", "Lopez", "Gonzalez", "Cruz", "Santos", "Reyes", "Dela Cruz", "Bautista", "Ocampo", "Ramos", "Flores", "Villanueva", "Navarro", "Del Rosario", "Aquino", "Mendoza", "Soriano", "Tolentino"];
const regions = ["NCR", "Region III", "Region IVA", "Region I", "Region II"];
const barangays = ["San Jose", "San Antonio", "Poblacion", "San Juan", "San Isidro", "Santo Nino"];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
    console.log('Starting seed generation...');

    // 1. Create Courses
    const course1 = await prisma.qualification.upsert({
        where: { code: 'HEO-FL-01' },
        update: {},
        create: {
            title: 'HEO Forklift',
            code: 'HEO-FL-01',
            description: 'Heavy Equipment Operations: Forklift Operations Certification.',
            level: 'INTERMEDIATE',
            category: 'Construction',
            duration: '120 Hours'
        }
    });
    console.log(`Created Course: ${course1.title}`);

    const course2 = await prisma.qualification.upsert({
        where: { code: 'HEO-GR-01' },
        update: {},
        create: {
            title: 'HEO Grader',
            code: 'HEO-GR-01',
            description: 'Heavy Equipment Operations: Grader Operations Certification.',
            level: 'ADVANCED',
            category: 'Construction',
            duration: '160 Hours'
        }
    });
    console.log(`Created Course: ${course2.title}`);

    // 2. Create Trainers
    const trainersData = [
        { email: 'trainer.forklift1@tesda.gov.ph', firstName: 'Ernesto', lastName: 'Guevara', courses: [course1.id] },
        { email: 'trainer.forklift2@tesda.gov.ph', firstName: 'Roberto', lastName: 'Sanchez', courses: [course1.id] },
        { email: 'trainer.grader1@tesda.gov.ph', firstName: 'Arturo', lastName: 'Dimagulangan', courses: [course2.id] },
        { email: 'trainer.grader2@tesda.gov.ph', firstName: 'Manny', lastName: 'Pacquiao', courses: [course2.id] },
    ];

    for (const td of trainersData) {
        await prisma.user.upsert({
            where: { email: td.email },
            update: {},
            create: {
                email: td.email,
                role: 'TRAINER',
                firstName: td.firstName,
                lastName: td.lastName,
                contact: `09${Math.floor(100000000 + Math.random() * 900000000)}`,
                assignedCourses: {
                    connect: td.courses.map(id => ({ id }))
                }
            }
        });
        console.log(`Created Trainer: ${td.firstName} ${td.lastName}`);
    }

    // 3. Create Students (50 students in 2 batches)
    const generateStudentData = (emailPrefix, courseId, batchNum) => {
        const fName = getRandomItem(firstNames);
        const lName = getRandomItem(lastNames);
        return {
            email: `student.${emailPrefix}@gmail.com`,
            role: 'STUDENT',
            studentStatus: 'ENROLLED',
            firstName: fName,
            middleName: getRandomItem(lastNames),
            lastName: lName,
            sex: Math.random() > 0.5 ? 'Male' : 'Female',
            nationality: 'Filipino',
            contact: `09${Math.floor(100000000 + Math.random() * 900000000)}`,
            dateOfBirth: getRandomDate(new Date(1980, 0, 1), new Date(2005, 0, 1)),
            birthplaceRegion: getRandomItem(regions),
            street: `${Math.floor(Math.random() * 100)} Main St`,
            barangay: getRandomItem(barangays),
            region: getRandomItem(regions),
            privacyConsent: true,
            enrollments: {
                create: {
                    qualificationId: courseId,
                    status: 'APPROVED'
                }
            }
        };
    };

    console.log('Generating 50 students...');
    let studentCount = 0;

    // Batch 1: 25 students for HEO Forklift
    for (let i = 1; i <= 25; i++) {
        const sData = generateStudentData(`fl${i}`, course1.id, 1);
        await prisma.user.upsert({
            where: { email: sData.email },
            update: {},
            create: sData
        });
        studentCount++;
    }

    // Batch 2: 25 students for HEO Grader
    for (let i = 1; i <= 25; i++) {
        const sData = generateStudentData(`gr${i}`, course2.id, 2);
        await prisma.user.upsert({
            where: { email: sData.email },
            update: {},
            create: sData
        });
        studentCount++;
    }

    console.log(`Successfully generated ${studentCount} students and enrolled them into batches!`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
