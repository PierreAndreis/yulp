import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  await prisma.users.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: `admin@admin.com`,
      name: 'Admin',
      password: bcrypt.hashSync('admin', 10),
      role: Role.ADMIN,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
