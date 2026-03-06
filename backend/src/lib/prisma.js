import { PrismaClient } from '@prisma/client';

/**
 * Singleton PrismaClient instance.
 * All route files should import from here instead of creating their own instances.
 * This prevents redundant connection pools and ensures efficient database usage.
 */
const prisma = new PrismaClient();

export default prisma;
