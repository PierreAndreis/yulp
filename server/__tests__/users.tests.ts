import { Role } from '.prisma/client';
import request from 'supertest';
import app from '../src/app';
import db from '../src/db';
import { createRestaurant, createUser, createTokenFromUser } from './helpers';

let USER_ID = '';
let OWNER_ID = '';
let ADMIN_ID = '';

const TOKENS = {
  OWNER: '',
  USER: '',
  ADMIN: '',
};

beforeAll(async () => {
  const user = await createUser(Role.USER);
  USER_ID = user.id;
  const owner = await createUser(Role.OWNER);
  OWNER_ID = owner.id;
  TOKENS.OWNER = await createTokenFromUser(owner);
  TOKENS.USER = await createTokenFromUser(user);
  const admin = await createUser(Role.ADMIN);
  ADMIN_ID = owner.id;
  TOKENS.ADMIN = await createTokenFromUser(admin);

  await createRestaurant();
});

test.each([
  ['get', '/users'],
  ['put', '/users/1'],
  ['delete', '/users/1'],
])('%p %p requires authentication', async (method, path) => {
  return request(app)[method](path).expect(401);
});

test.each([
  ['get', '/users'],
  ['put', '/users/1'],
  ['delete', '/users/1'],
])('OWNER cannot access %p %p endpoint', async (method, path) => {
  return request(app)[method](path).set('Authorization', `Bearer ${TOKENS.OWNER}`).expect(403);
});

test.each([
  ['get', '/users'],
  ['put', '/users/1'],
  ['delete', '/users/1'],
])('USER cannot access %p %p endpoint', async (method, path) => {
  return request(app)[method](path).set('Authorization', `Bearer ${TOKENS.USER}`).expect(403);
});

test('ADMIN can view all users', async () => {
  const response = await request(app)
    .get('/users')
    .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200);

  expect(response.body.users.length).toBe(3);
});

test('ADMIN can edit an user name', async () => {
  const user_name_new = `User ${Date.now()}`;
  const response = await request(app)
    .put(`/users/${USER_ID}`)
    .send({
      name: user_name_new,
    })
    .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200);

  expect(response.body.name).toBe(user_name_new);
});
test('ADMIN can edit an user name', async () => {
  const user_name_new = `User ${Date.now()}`;
  const response = await request(app)
    .put(`/users/${USER_ID}`)
    .send({
      name: user_name_new,
    })
    .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200);

  expect(response.body.name).toBe(user_name_new);
});

test('ADMIN can change a role and transfer all restaurants to itself', async () => {
  const restaurant_before = await db.restaurants.findFirst({
    where: {
      owner_user_id: OWNER_ID,
    },
  });

  expect(restaurant_before).toBeDefined();

  const response = await request(app)
    .put(`/users/${OWNER_ID}`)
    .send({
      role: Role.USER,
    })
    .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200);

  expect(response.body.role).toBe(Role.USER);

  const restaurant_after = await db.restaurants.findUnique({
    where: {
      id: restaurant_before.id,
    },
  });

  expect(restaurant_after.owner_user_id).toBe(ADMIN_ID);
});

test('ADMIN can delete an user', async () => {
  await request(app)
    .delete(`/users/${OWNER_ID}`)
    .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
    .set('Accept', 'application/json')
    .expect(204);
});
