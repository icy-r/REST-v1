const request = require('supertest');
const app = require('../app');
const Budget = require('../models/Budget');
const User = require('../models/User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

describe('Budget Controller', () => {
  let token;
  let userId;
  let budgetId;

  beforeAll(async () => {
    // Connect to the in-memory database
    await mongoose.connect(process.env.MONGO_URI);

    // Create a test user
    const user = await User.create({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'user',
    });

    userId = user._id;

    // Generate a JWT token for authentication
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
  });

  afterAll(async () => {
    // Clean up the database
    await User.deleteMany({});
    await Budget.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/budgets', () => {
    it('should create a new budget', async () => {
      const res = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Budget',
          amount: 1000,
          currency: 'USD',
          period: 'monthly',
          category: 'Test Category',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('name', 'Test Budget');
      expect(res.body.data).toHaveProperty('amount', 1000);
      expect(res.body.data).toHaveProperty('currency', 'USD');
      expect(res.body.data).toHaveProperty('period', 'monthly');
      expect(res.body.data).toHaveProperty('category', 'Test Category');

      budgetId = res.body.data._id;
    });
  });

  describe('GET /api/budgets', () => {
    it('should get all budgets for a user', async () => {
      const res = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/budgets/:id', () => {
    it('should get a budget by ID', async () => {
      const res = await request(app)
        .get(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('name', 'Test Budget');
      expect(res.body.data).toHaveProperty('amount', 1000);
      expect(res.body.data).toHaveProperty('currency', 'USD');
      expect(res.body.data).toHaveProperty('period', 'monthly');
      expect(res.body.data).toHaveProperty('category', 'Test Category');
    });
  });

  describe('PUT /api/budgets/:id', () => {
    it('should update a budget', async () => {
      const res = await request(app)
        .put(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Budget',
          amount: 1500,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('name', 'Updated Budget');
      expect(res.body.data).toHaveProperty('amount', 1500);
    });
  });

  describe('DELETE /api/budgets/:id', () => {
    it('should delete a budget', async () => {
      const res = await request(app)
        .delete(`/api/budgets/${budgetId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Budget deleted successfully');
    });
  });
});

module.exports = app;
