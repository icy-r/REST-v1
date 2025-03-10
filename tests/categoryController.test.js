const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const { verifyToken } = require('../middleware/jwtauth');

jest.mock('../middleware/jwtauth', () => ({
  verifyToken: jest.fn((req, res, next) => {
    req.user = { id: 'testUserId', role: 'admin' };
    next();
  }),
}));

describe('Category Controller', () => {
  beforeAll(async () => {
    const url = global.__MONGO_URI__;
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  describe('POST /categories', () => {
    it('should create a new category', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send({
          name: 'Test Category',
          description: 'Test Description',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Category created successfully');
      expect(res.body.category).toHaveProperty('name', 'Test Category');
    });

    it('should not create a category with an existing name', async () => {
      await Category.create({ name: 'Duplicate Category', description: 'Test Description' });

      const res = await request(app)
        .post('/api/categories')
        .send({
          name: 'Duplicate Category',
          description: 'Test Description',
        });

      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('message', 'Category with this name already exists');
    });
  });

  describe('GET /categories', () => {
    it('should get all categories', async () => {
      const res = await request(app).get('/api/categories');

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /categories/:id', () => {
    it('should get a category by ID', async () => {
      const category = await Category.create({ name: 'Test Category', description: 'Test Description' });

      const res = await request(app).get(`/api/categories/${category._id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('name', 'Test Category');
    });

    it('should return 404 if category not found', async () => {
      const res = await request(app).get('/api/categories/invalidId');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Category not found');
    });
  });

  describe('PUT /categories/:id', () => {
    it('should update a category', async () => {
      const category = await Category.create({ name: 'Old Category', description: 'Old Description' });

      const res = await request(app)
        .put(`/api/categories/${category._id}`)
        .send({
          name: 'Updated Category',
          description: 'Updated Description',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Category updated successfully');
      expect(res.body.category).toHaveProperty('name', 'Updated Category');
    });

    it('should return 404 if category not found', async () => {
      const res = await request(app)
        .put('/api/categories/invalidId')
        .send({
          name: 'Updated Category',
          description: 'Updated Description',
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Category not found');
    });
  });

  describe('DELETE /categories/:id', () => {
    it('should delete a category', async () => {
      const category = await Category.create({ name: 'Category to Delete', description: 'Description' });

      const res = await request(app).delete(`/api/categories/${category._id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Category deleted successfully');
    });

    it('should return 404 if category not found', async () => {
      const res = await request(app).delete('/api/categories/invalidId');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Category not found');
    });
  });
});

module.exports = app;
