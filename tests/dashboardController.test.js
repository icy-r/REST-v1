const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dashboardController = require('../controllers/dashboardController');
const User = require('../models/User');
const { verifyToken } = require('../middleware/jwtauth');

const app = express();
app.use(express.json());
app.get('/api/dashboard', verifyToken, (req, res, next) => {
  if (req.user.role === 'admin') {
    dashboardController.getAdminDashboard(req, res, next);
  } else {
    dashboardController.getUserDashboard(req, res, next);
  }
});
app.get('/api/dashboard/admin', verifyToken, dashboardController.getAdminDashboard);
app.get('/api/dashboard/user', verifyToken, dashboardController.getUserDashboard);

describe('Dashboard Controller', () => {
  let token;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.create({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'user',
    });

    userId = user._id;

    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  describe('GET /api/dashboard', () => {
    it('should get user dashboard data', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('financialSummary');
      expect(res.body.data).toHaveProperty('recentTransactions');
      expect(res.body.data).toHaveProperty('budgetSummary');
      expect(res.body.data).toHaveProperty('goalSummary');
    });

    it('should not get dashboard data without a token', async () => {
      const res = await request(app)
        .get('/api/dashboard');

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Authentication token is required');
    });
  });

  describe('GET /api/dashboard/admin', () => {
    it('should get admin dashboard data', async () => {
      const adminUser = await User.create({
        username: 'adminuser',
        email: 'adminuser@example.com',
        password: 'password123',
        name: 'Admin User',
        role: 'admin',
      });

      const adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      const res = await request(app)
        .get('/api/dashboard/admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('userStatistics');
      expect(res.body.data).toHaveProperty('activityStatistics');
      expect(res.body.data).toHaveProperty('financialSummaries');
    });

    it('should not get admin dashboard data without admin role', async () => {
      const res = await request(app)
        .get('/api/dashboard/admin')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('message', 'Access denied - Admin authorization required');
    });
  });
});
