import { PrismaClient } from '@prisma/client';

let db = new PrismaClient({ log: ['info'] });

export default db;
