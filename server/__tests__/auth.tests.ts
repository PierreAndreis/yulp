import request from 'supertest';
import app from '../src/app';

const user = {
  name: 'pierre',
  email: 'pierre@loud.gg',
  password: '12345678',
  role: 'USER',
};

test('user cannot register given wrong body', async () => {
  const response = await request(app)
    .post('/register')
    .send({
      ...user,
      randomField123: true,
      password: undefined,
    })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(400);

  expect(response.body.error).toBeTruthy();
});

test('user can register', async () => {
  const response = await request(app)
    .post('/register')
    .send(user)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200);

  expect(response.body.user.id).toBeDefined();
  expect(response.body.user.password).not.toBeDefined();
  expect(response.body.token).toBeDefined();
});

test('user can login given right credentials', async () => {
  const response = await request(app)
    .post('/login')
    .send({ email: user.email, password: user.password })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200);

  expect(response.body.token).toBeDefined();
});

test('user cannot login given wrong credentials', async () => {
  const response = await request(app)
    .post('/login')
    .send({ email: user.email, password: 'wrongpassword' })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(401);

  expect(response.body.token).not.toBeDefined();
});
