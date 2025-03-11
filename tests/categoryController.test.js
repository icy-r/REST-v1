require("dotenv").config();
const Category = require("../models/Category");
const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const { createUniqueTestUser, cleanupTestData } = require("./testHelpers");
const User = require("../models/User");

let server;
let testUser;
let authToken;

// Helper function to create an admin user
async function createAdminUser() {
  // Generate a unique username to avoid conflicts
  const timestamp = Date.now();
  const username = `admin_test_${timestamp}`;

  // Create admin user
  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    username: username,
    email: `${username}@example.com`,
    password: "Password123!",
    role: "admin", // Set the role to admin
    firstName: "Admin",
    lastName: "User",
    name: "Admin User",
  });

  // Hash password before saving
  await user.save();

  // Log the created user role
  console.log("Created user role:", user.role);

  return user;
}

describe("Category Controller", () => {
  beforeAll(async () => {
    // Use a separate test database for tests
    const testDBUri = process.env.MONGO_TEST_URI || process.env.MONGO_URI;

    try {
      if (mongoose.connection.readyState === 0) {
        // Only connect if not already connected
        await mongoose.connect(testDBUri);
      }

      // Create a separate server instance for testing
      server = app.listen(0); // Use port 0 to get a random available port

      // Create an admin user for testing instead of a regular user
      testUser = await createAdminUser();
      console.log("Created admin test user:", testUser.username);

      const loginRes = await request(app).post("/api/auth/login").send({
        username: testUser.username,
        password: "Password123!",
      });

      authToken = loginRes.body.token;
      console.log("Auth token obtained:", authToken ? "Yes" : "No");

      // Log the authentication token
      console.log("Authentication token:", authToken);
    } catch (err) {
      console.error("Error connecting to test database:", err);
    }
  });

  afterAll(async () => {
    // Clean up created admin user
    if (testUser && testUser._id) {
      await User.findByIdAndDelete(testUser._id);
    }
    await cleanupTestData();
    if (server) await server.close();
    // Don't close the mongoose connection if other tests are using it
  });

  // Clean up before each test
  beforeEach(async () => {
    await Category.deleteMany({});
  });

  describe("GET /categories", () => {
    it("should get all categories", async () => {
      // Create test categories
      const category1 = new Category({
        _id: new mongoose.Types.ObjectId(),
        name: "Test Category 1",
        description: "Test Description 1",
      });
      await category1.save();

      // Add authentication token to GET request
      const res = await request(app)
        .get("/api/categories")
        .set("Authorization", `Bearer ${authToken}`);

      console.log("GET /categories response:", res.status, res.body);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("GET /categories/:id", () => {
    it("should get a category by ID", async () => {
      const category = new Category({
        _id: new mongoose.Types.ObjectId(),
        name: "Test Category",
        description: "Test Description",
      });
      await category.save();

      // Add authentication token to GET request
      const res = await request(app)
        .get(`/api/categories/${category._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("name", "Test Category");
    });

    it("should return 404 if category not found", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      // Add authentication token to GET request
      const res = await request(app)
        .get(`/api/categories/${nonExistentId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty("message", "Category not found");
    });
  });
});
