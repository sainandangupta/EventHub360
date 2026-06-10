const request = require('supertest');
const app = require('../../server');

describe('Leave API', () => {
  test('GET /api/leave/types requires authentication', async () => {
    const res = await request(app).get('/api/leave/types');
    expect(res.status).toBe(401);
  });

  test('POST /api/leave/apply validates body', async () => {
    const res = await request(app)
      .post('/api/leave/apply')
      .set('Authorization', 'invalid-token')
      .send({});
    expect([401, 422]).toContain(res.status);
  });
});
