import prisma from './src/lib/prisma.js';
async function main() {
    const count = await prisma.partner.count();
    console.log('Partner count:', count);
    const partners = await prisma.partner.findMany();
    console.log('Partners:', JSON.stringify(partners, null, 2));
    process.exit(0);
}
main().catch(err => {
    console.error(err);
    process.exit(1);
});
