const request = require('supertest');
const app = require('../../server');

describe('Employee API', () => {
  test('GET /api/employees requires authentication', async () => {
    const res = await request(app).get('/api/employees');
    expect(res.status).toBe(401);
  });

  test('GET /api/v1/employees requires authentication', async () => {
    const res = await request(app).get('/api/v1/employees');
    expect(res.status).toBe(401);
  });
});
