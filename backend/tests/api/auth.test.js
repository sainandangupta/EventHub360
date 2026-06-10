const request = require('supertest');
const app = require('../../server');

describe('Auth API', () => {
  test('POST /api/auth/login validates required fields', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  test('POST /api/auth/signup validates email format', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Test', email: 'invalid', password: '123456' });
    expect(res.status).toBe(422);
    expect(res.body.message).toContain('Validation');
  });

  test('POST /api/v1/auth/login validates required fields', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({});
    expect(res.status).toBe(422);
  });
});
