const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

describe('Transaction Controller', () => {
  let token;
  let userId;
  let transactionId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);

    const user = new User({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password',
      name: 'Test User',
      role: 'user',
    });
    await user.save();
    userId = user._id;

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'password',
      });

    token = res.body.token;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/transactions', () => {
    it('should create a new transaction', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'income',
          amount: 100,
          category: 'Salary',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('data');
      transactionId = res.body.data._id;
    });

    it('should not create a transaction without required fields', async () => {
      const res = await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'income',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Error creating transaction');
    });
  });

  describe('GET /api/transactions', () => {
    it('should get all transactions for a user', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should filter transactions by date range', async () => {
      const res = await request(app)
        .get('/api/transactions')
        .set('Authorization', `Bearer ${token}`)
        .query({ startDate: '2023-01-01', endDate: '2023-12-31' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
    });
  });

  describe('GET /api/transactions/:id', () => {
    it('should get a transaction by ID', async () => {
      const res = await request(app)
        .get(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data._id).toEqual(transactionId);
    });

    it('should return 404 if transaction not found', async () => {
      const res = await request(app)
        .get('/api/transactions/invalidId')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Transaction not found');
    });
  });

  describe('PUT /api/transactions/:id', () => {
    it('should update a transaction', async () => {
      const res = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 200,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.amount).toEqual(200);
    });

    it('should return 404 if transaction not found', async () => {
      const res = await request(app)
        .put('/api/transactions/invalidId')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 200,
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Transaction not found');
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    it('should delete a transaction', async () => {
      const res = await request(app)
        .delete(`/api/transactions/${transactionId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
    });

    it('should return 404 if transaction not found', async () => {
      const res = await request(app)
        .delete('/api/transactions/invalidId')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Transaction not found');
    });
  });

  describe('GET /api/transactions/summary', () => {
    it('should get transaction summary', async () => {
      const res = await request(app)
        .get('/api/transactions/summary')
        .set('Authorization', `Bearer ${token}`)
        .query({ startDate: '2023-01-01', endDate: '2023-12-31' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('totalIncome');
      expect(res.body.data).toHaveProperty('totalExpense');
      expect(res.body.data).toHaveProperty('balance');
      expect(res.body.data).toHaveProperty('categoryExpenses');
    });

    it('should return 400 if date range is not provided', async () => {
      const res = await request(app)
        .get('/api/transactions/summary')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Please provide startDate and endDate');
    });
  });
});

module.exports = app;
