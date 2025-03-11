const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

describe('Integration Tests for app.js', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
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

  it('should return 200 for /api/auth route', async () => {
    const res = await request(app).get('/api/auth');
    expect(res.statusCode).toEqual(200);
  });

  it('should return 200 for /api/users route', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toEqual(200);
  });

  it('should return 200 for /api/transactions route', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.statusCode).toEqual(200);
  });

  it('should return 200 for /api/budgets route', async () => {
    const res = await request(app).get('/api/budgets');
    expect(res.statusCode).toEqual(200);
  });

  it('should return 200 for /api/goals route', async () => {
    const res = await request(app).get('/api/goals');
    expect(res.statusCode).toEqual(200);
  });

  it('should return 200 for /api/categories route', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.statusCode).toEqual(200);
  });

  it('should return 200 for /api/reports route', async () => {
    const res = await request(app).get('/api/reports');
    expect(res.statusCode).toEqual(200);
  });

  it('should return 200 for /api/dashboard route', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.statusCode).toEqual(200);
  });
});

module.exports = app;
