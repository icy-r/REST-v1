const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const { verifyToken } = require('../middleware/jwtauth');

// Mock the authentication middleware
jest.mock('../middleware/jwtauth', () => ({
  verifyToken: jest.fn((req, res, next) => {
    req.user = { id: 'testUserId', role: 'admin' };
    next();
  }),
}));

// Use a test database
const MONGO_TEST_URI = process.env.MONGO_TEST_URI || "mongodb://localhost:27017/test-db";

describe('Category Controller', () => {
  beforeAll(async () => {
    try {
      await mongoose.connect(MONGO_TEST_URI);
    } catch (err) {
      console.error('Error connecting to test database:', );
    }
  });

  afterAll(async () => {
    // Clean up all test data instead of dropping database
    await Category.deleteMany({});
    await mongoose.connection.close();
  });

  // Clean up before each test
  beforeEach(async () => {
    await Category.deleteMany({});
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
      // First create a category
      const category = new Category({
        _id: new mongoose.Types.ObjectId(),
        name: 'Duplicate Category',
        description: 'Test Description'
      });
      await category.save();

      // Then try to create another with the same name
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
      // Create test categories
      const category1 = new Category({
        _id: new mongoose.Types.ObjectId(),
        name: 'Test Category 1',
        description: 'Test Description 1'
      });
      await category1.save();

      const res = await request(app).get('/api/categories');

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /categories/:id', () => {
    it('should get a category by ID', async () => {
      const category = new Category({
        _id: new mongoose.Types.ObjectId(),
        name: 'Test Category',
        description: 'Test Description'
      });
      await category.save();

      const res = await request(app).get(`/api/categories/${category._id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('name', 'Test Category');
    });

    it('should return 404 if category not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/categories/${nonExistentId}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Category not found');
    });
  });

  describe('PUT /categories/:id', () => {
    it('should update a category', async () => {
      const category = new Category({
        _id: new mongoose.Types.ObjectId(),
        name: 'Old Category',
        description: 'Old Description'
      });
      await category.save();

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
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/categories/${nonExistentId}`)
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
      const category = new Category({
        _id: new mongoose.Types.ObjectId(),
        name: 'Category to Delete',
        description: 'Description'
      });
      await category.save();

      const res = await request(app).delete(`/api/categories/${category._id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Category deleted successfully');
    });

    it('should return 404 if category not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/categories/${nonExistentId}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Category not found');
    });
  });
});

// Remove this line as it causes circular dependencies in tests
// module.exports = app;
