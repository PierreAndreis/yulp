import { Role, Users } from '@prisma/client';
import db from '../src/db';
import { signJwt } from '../src/jwt';

export const createUser = async (role: Role) => {
  return db.users.create({
    data: {
      email: `test-${Date.now()}@test.com`,
      name: `Test ${Date.now()}`,
      // Does not matter since we won't try to login anyway
      password: '1',
      role: role,
    },
  });
};

export const createTokenFromUser = async (user: Users) => {
  return signJwt(user);
};

export const createToken = async (role: Role) => {
  const user = await createUser(role);
  return signJwt(user);
};

export const createRestaurant = async () => {
  let owner = await db.users.findFirst({
    where: {
      role: Role.OWNER,
    },
  });

  if (!owner) owner = await createUser(Role.OWNER);

  return db.restaurants.create({
    data: {
      name: `Restaurant-${Date.now()}`,
      owner_user_id: owner.id,
    },
  });
};
