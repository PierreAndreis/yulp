import { PrismaClient } from '@prisma/client';
const db = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['info'] : [],
});

db.$use(async (params, next) => {
  const before = Date.now();

  const result = await next(params);

  const after = Date.now();

  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
  }

  return result;
});

export default db;
