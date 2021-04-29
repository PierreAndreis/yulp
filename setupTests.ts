import db from './server/src/db';

jest.setTimeout(10000);

afterAll(async (done) => {
  await db.$disconnect();
  done();
});
