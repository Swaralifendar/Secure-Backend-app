const request = require('supertest');
const app = require('../server'); // exported from server.js
const mongoose = require('mongoose');

const TEST_EMAIL = 'jestuser12@gmail.com';
const TEST_PASSWORD = 'jestpassword123';

describe('🔐 Auth API - Secure Backend Jest Tests', () => {

  // Close DB connection after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // 1️⃣ Register a new user
  test('✅ Should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/verify your email/i);
  });

  // 2️⃣ Register same user again should fail
  test('❌ Should fail if user already exists', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  // 3️⃣ Login with wrong password
  test('❌ Should fail login with invalid password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: 'wrongpass' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/verify your email/i);
  });

  // 4️⃣ Login before email verification should fail
  test('❌ Should fail login if not verified', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/verify your email/i);
  });

  // 5️⃣ Access protected route without token
  test('❌ Should fail accessing protected route without token', async () => {
    const res = await request(app)
      .get('/api/auth/protected');

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/authorization header/i);
  });

  // 6️⃣ Generate JWT manually and access protected route
  test('✅ Access protected route with valid token', async () => {
    // First, manually generate token from server
    const tokenRes = await request(app)
      .get('/api/auth/generate-token/123456789'); // You can put a dummy ObjectId

    const token = tokenRes.body.token;

    const res = await request(app)
      .get('/api/auth/protected')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/protected route/i);
  });

});

























// const request = require('supertest');
// const app = require('../server'); // You might need to export `app` from server.js
// const mongoose = require('mongoose');

// describe('Auth API Tests', () => {

//     afterAll(async () => {
//         await mongoose.connection.close();
//     });

//     test('Should fail login with invalid credentials', async () => {
//         const res = await request(app)
//             .post('/api/auth/login')
//             .send({ email: 'fakeuser@gmail.com', password: 'wrongpass' });

//         expect(res.statusCode).toBe(400);
//         expect(res.body.message).toMatch(/Invalid credentials/i);
//     });

// });
