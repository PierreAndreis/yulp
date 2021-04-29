import { Restaurants, Role } from '.prisma/client';
import request from 'supertest';
import app from '../src/app';
import { createToken, createRestaurant } from './helpers';

let RESTAURANT_SAVED: Restaurants;
let REVIEW_ID = '';

const TOKENS = {
  OWNER: '',
  OWNER_2: '',
  USER: '',
  ADMIN: '',
};

beforeAll(async () => {
  TOKENS.OWNER = await createToken(Role.OWNER);
  TOKENS.USER = await createToken(Role.USER);
  TOKENS.ADMIN = await createToken(Role.ADMIN);
  RESTAURANT_SAVED = await createRestaurant();
  TOKENS.OWNER_2 = await createToken(Role.OWNER);
});

test.each([
  ['get', '/reviews'],
  ['post', '/reviews'],
  ['put', '/reviews/1'],
  ['delete', '/reviews/1'],
  ['post', '/reviews/1/reply'],
  ['put', '/reviews/1/reply'],
  ['delete', '/reviews/1/reply'],
])('%p %p requires authentication', async (method, path) => {
  return request(app)[method](path).expect(401);
});

test('USER can create a review only once', async () => {
  const response = await request(app)
    .post('/reviews')
    .send({
      rating: 5,
      message: 'Hello!',
      restaurant_id: RESTAURANT_SAVED.id,
      visit_at: new Date(),
    })
    .set('Authorization', `Bearer ${TOKENS.USER}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(201);

  expect(response.body.id).toBeTruthy();
  REVIEW_ID = response.body.id;

  await request(app)
    .post('/reviews')
    .send({
      rating: 4,
      message: 'Hello 2!',
      restaurant_id: RESTAURANT_SAVED.id,
      visit_at: new Date(),
    })
    .set('Authorization', `Bearer ${TOKENS.USER}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(409);
});

test('USER cannot reply to its review', async () => {
  await request(app)
    .post(`/reviews/${REVIEW_ID}/reply`)
    .set('Authorization', `Bearer ${TOKENS.USER}`)
    .set('Accept', 'application/json')
    .send({
      message: 'ok',
    })
    .expect('Content-Type', /json/)
    .expect(403);
});

test('OWNER_2 cannot reply to another restaurant review', async () => {
  await request(app)
    .post(`/reviews/${REVIEW_ID}/reply`)
    .set('Authorization', `Bearer ${TOKENS.OWNER_2}`)
    .set('Accept', 'application/json')
    .send({
      message: 'ok',
    })
    .expect('Content-Type', /json/)
    .expect(403);
});

test('OWNER can reply only once to a review on its restaurant', async () => {
  const response_before = await request(app)
    .get('/reviews?replied=false')
    .set('Authorization', `Bearer ${TOKENS.OWNER}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200);

  expect(response_before.body.reviews.length).toBe(1);
  expect(response_before.body.reviews[0].reply).toBe(null);

  const reply_message = `Reply ${Date.now()}`;
  const response_reply = await request(app)
    .post(`/reviews/${REVIEW_ID}/reply`)
    .set('Authorization', `Bearer ${TOKENS.OWNER}`)
    .set('Accept', 'application/json')
    .send({
      message: reply_message,
    })
    .expect('Content-Type', /json/)
    .expect(201);

  expect(response_reply.body.reply).not.toBe(null);
  expect(response_reply.body.reply.message).toBe(reply_message);

  const response_after = await request(app)
    .get('/reviews?replied=false')
    .set('Authorization', `Bearer ${TOKENS.OWNER}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200);

  expect(response_after.body.reviews.length).toBe(0);

  // Can't reply more than once
  await request(app)
    .post(`/reviews/${REVIEW_ID}/reply`)
    .set('Authorization', `Bearer ${TOKENS.OWNER}`)
    .set('Accept', 'application/json')
    .send({
      message: reply_message + '2',
    })
    .expect('Content-Type', /json/)
    .expect(409);
});

test.each([['USER'], ['OWNER']])('%p does not have enough permission edit a review', async (user) => {
  const response = await request(app)
    .put(`/reviews/${REVIEW_ID}`)
    .set('Authorization', `Bearer ${TOKENS[user]}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(403);

  expect(response.body.error).toBe('ForbiddenError');
});

test.each([['USER'], ['OWNER']])('%p does not have enough permission delete a review', async (user) => {
  const response = await request(app)
    .delete(`/reviews/${REVIEW_ID}`)
    .set('Authorization', `Bearer ${TOKENS[user]}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(403);

  expect(response.body.error).toBe('ForbiddenError');
});

test('ADMIN can edit a review', async () => {
  const review_message_new = `review message ${Date.now()}`;
  const response = await request(app)
    .put(`/reviews/${REVIEW_ID}`)
    .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
    .set('Accept', 'application/json')
    .send({
      message: review_message_new,
    })
    .expect('Content-Type', /json/)
    .expect(200);

  expect(response.body.message).toBe(review_message_new);
});

test('ADMIN can edit and delete a review reply', async () => {
  const reply_review_message = `reply review message ${Date.now()}`;
  const response = await request(app)
    .put(`/reviews/${REVIEW_ID}`)
    .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
    .set('Accept', 'application/json')
    .send({
      replyMessage: reply_review_message,
    })
    .expect('Content-Type', /json/)
    .expect(200);

  expect(response.body.reply.message).toBe(reply_review_message);

  const response_delete_message = await request(app)
    .put(`/reviews/${REVIEW_ID}`)
    .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
    .set('Accept', 'application/json')
    .send({
      replyMessage: null,
    })
    .expect('Content-Type', /json/)
    .expect(200);

  expect(response_delete_message.body.reply).toBe(null);
});

test('ADMIN can delete a review', async () => {
  const response_before = await request(app)
    .get('/reviews?showOnlyOwned=false')
    .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200);

  expect(response_before.body.reviews.length).toBe(1);

  await request(app)
    .delete(`/reviews/${REVIEW_ID}`)
    .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
    .set('Accept', 'application/json')
    .expect(204);

  const response_after = await request(app)
    .get('/reviews?showOnlyOwned=false')
    .set('Authorization', `Bearer ${TOKENS.ADMIN}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200);

  expect(response_after.body.reviews.length).toBe(0);
});
