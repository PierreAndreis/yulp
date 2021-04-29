import { Role } from '.prisma/client';
import request from 'supertest';
import app from '../src/app';
import { createToken } from './helpers';

let RESTAURANT_ID = '';
let RESTAURANT_NAME = `Restaurant ${Date.now()}`;

const TOKENS = {
  OWNER: '',
  USER: '',
  ADMIN: '',
};

beforeAll(async () => {
  TOKENS.OWNER = await createToken(Role.OWNER);
  TOKENS.USER = await createToken(Role.USER);
  TOKENS.ADMIN = await createToken(Role.ADMIN);
});

test.each([
  ['get', '/restaurants'],
  ['post', '/restaurants'],
  ['put', '/restaurants/1'],
  ['delete', '/restaurants/1'],
])('%p %p requires authentication', async (method, path) => {
  return request(app)[method](path).expect(401);
});

test('OWNER can create a restaurant', async () => {
  const response = await request(app)
    .post('/restaurants')
    .send({
      name: RESTAURANT_NAME,
    })
    .set('Authorization', `Bearer ${TOKENS.OWNER}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(201);

  expect(response.body.id).toBeTruthy();
  RESTAURANT_ID = response.body.id;
});

test.each([['USER'], ['OWNER']])('%p can view the restaurant created on the list', async (user) => {
  const response = await request(app)
    .get('/restaurants')
    .set('Authorization', `Bearer ${TOKENS[user]}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200);

  expect(response.body.restaurants[0].name).toBe(RESTAURANT_NAME);
});

test('restaurant does not show up when filtering by rating above its own', async () => {
  const response = await request(app)
    .get('/restaurants?ratingLeast=1')
    .set('Authorization', `Bearer ${TOKENS.USER}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200);

  expect(response.body.restaurants.length).toBe(0);
});

test.each([['USER'], ['OWNER']])('%p does not have enough permission edit a restaurant', async (user) => {
  const response = await request(app)
    .put(`/restaurants/${RESTAURANT_ID}`)
    .set('Authorization', `Bearer ${TOKENS[user]}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(403);

  expect(response.body.error).toBe('ForbiddenError');
});

test.each([['USER'], ['OWNER']])('%p does not have enough permission delete a restaurant', async (user) => {
  const response = await request(app)
    .delete(`/restaurants/${RESTAURANT_ID}`)
    .set('Authorization', `Bearer ${TOKENS[user]}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(403);

  expect(response.body.error).toBe('ForbiddenError');
});

test('ADMIN can edit restaurants', async () => {
  const restaurant_name_new = `Restaurant ${Date.now()}`;
  const response = await request(app)
    .put(`/restaurants/${RESTAURANT_ID}`)
    .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
    .set('Accept', 'application/json')
    .send({
      name: restaurant_name_new,
    })
    .expect('Content-Type', /json/)
    .expect(200);

  expect(response.body.name).toBe(restaurant_name_new);

  RESTAURANT_NAME = restaurant_name_new;
});

test('ADMIN can delete restaurants', async () => {
  const response_before = await request(app)
    .get('/restaurants')
    .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200);

  expect(response_before.body.restaurants.length).toBe(1);

  await request(app)
    .delete(`/restaurants/${RESTAURANT_ID}`)
    .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200);

  const response_after = await request(app)
    .get('/restaurants')
    .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200);

  expect(response_after.body.restaurants.length).toBe(0);
});
