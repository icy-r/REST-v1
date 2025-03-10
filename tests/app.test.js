const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

describe('Integration Tests for app.js', () => {
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should redirect to /api-docs on home route', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/api-docs');
  });

  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.statusCode).toEqual(404);
  });

  it('should return 500 for server errors', async () => {
    const res = await request(app).get('/api/trigger-error');
    expect(res.statusCode).toEqual(500);
    expect(res.text).toEqual('Something broke!');
  });
});

module.exports = app;
