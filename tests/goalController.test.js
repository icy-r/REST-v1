const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Goal = require('../models/Goal');
const User = require('../models/User');
const { generateToken } = require('../middleware/jwtauth');

describe('Goal Controller', () => {
  let token;
  let userId;
  let goalId;

  beforeAll(async () => {
    // Connect to the in-memory database
    await mongoose.connect(process.env.MONGO_URI);

    // Create a test user
    const user = await User.create({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
      name: 'Test User',
    });

    userId = user._id;
    token = generateToken(user);

    // Create a test goal
    const goal = await Goal.create({
      userId,
      name: 'Test Goal',
      targetAmount: 1000,
      currentAmount: 0,
      targetDate: new Date('2023-12-31'),
    });

    goalId = goal._id;
  });

  afterAll(async () => {
    // Clean up the database
    await User.deleteMany({});
    await Goal.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/goals', () => {
    it('should create a new goal', async () => {
      const res = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Goal',
          targetAmount: 500,
          targetDate: new Date('2023-12-31'),
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('name', 'New Goal');
    });
  });

  describe('GET /api/goals', () => {
    it('should get all goals for a user', async () => {
      const res = await request(app)
        .get('/api/goals')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/goals/:id', () => {
    it('should get a goal by ID', async () => {
      const res = await request(app)
        .get(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('name', 'Test Goal');
    });
  });

  describe('PUT /api/goals/:id', () => {
    it('should update a goal', async () => {
      const res = await request(app)
        .put(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Goal',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('name', 'Updated Goal');
    });
  });

  describe('PUT /api/goals/:id/contribute', () => {
    it('should contribute to a goal', async () => {
      const res = await request(app)
        .put(`/api/goals/${goalId}/contribute`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 100,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('currentAmount', 100);
    });
  });

  describe('DELETE /api/goals/:id', () => {
    it('should delete a goal', async () => {
      const res = await request(app)
        .delete(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data', {});
    });
  });
});

module.exports = app;
