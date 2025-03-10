const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

describe('User Controller', () => {
  let token;
  let userId;

  beforeAll(async () => {
    const user = new User({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password',
      name: 'Test User',
      role: 'user'
    });
    await user.save();
    userId = user._id;
    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('GET /api/users/me', () => {
    it('should return the current logged in user', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('username', 'testuser');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/users/me');

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('PUT /api/users/update-details', () => {
    it('should update user details', async () => {
      const res = await request(app)
        .put('/api/users/update-details')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated User',
          email: 'updateduser@example.com'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('name', 'Updated User');
      expect(res.body.data).toHaveProperty('email', 'updateduser@example.com');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .put('/api/users/update-details')
        .send({
          name: 'Updated User',
          email: 'updateduser@example.com'
        });

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('PUT /api/users/update-password', () => {
    it('should update user password', async () => {
      const res = await request(app)
        .put('/api/users/update-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'password',
          newPassword: 'newpassword'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 401 if current password is incorrect', async () => {
      const res = await request(app)
        .put('/api/users/update-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword'
        });

      expect(res.statusCode).toEqual(401);
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .put('/api/users/update-password')
        .send({
          currentPassword: 'password',
          newPassword: 'newpassword'
        });

      expect(res.statusCode).toEqual(401);
    });
  });
});
