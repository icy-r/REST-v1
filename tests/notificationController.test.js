const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const User = require('../models/User');

describe('Notification Controller', () => {
  let token;
  let userId;
  let notificationId;

  beforeAll(async () => {
    // Connect to the in-memory database
    await mongoose.connect(process.env.MONGO_URI);

    // Create a test user and get a token
    const user = await User.create({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password',
      name: 'Test User',
      role: 'user',
    });
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
    // Clean up the database
    await User.deleteMany({});
    await Notification.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /notifications', () => {
    it('should create a new notification', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId,
          type: 'info',
          message: 'This is a test notification',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('type', 'info');
      expect(res.body.data).toHaveProperty('message', 'This is a test notification');

      notificationId = res.body.data._id;
    });
  });

  describe('GET /notifications', () => {
    it('should get all notifications for a user', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /notifications/:id', () => {
    it('should get a notification by ID', async () => {
      const res = await request(app)
        .get(`/api/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('_id', notificationId);
    });
  });

  describe('PUT /notifications/:id', () => {
    it('should update a notification', async () => {
      const res = await request(app)
        .put(`/api/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: 'Updated test notification',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('message', 'Updated test notification');
    });
  });

  describe('DELETE /notifications/:id', () => {
    it('should delete a notification', async () => {
      const res = await request(app)
        .delete(`/api/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
    });
  });
});
