import db from './server/src/db';

jest.setTimeout(10000);

afterAll(async () => {
  await db.$disconnect();
});
