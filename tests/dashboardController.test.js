const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User");
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const Goal = require("../models/Goal");
const { verifyToken } = require("../middleware/jwtauth");

// Use a test database URI
const MONGO_TEST_URI =
  process.env.MONGO_TEST_URI || "mongodb://localhost:27017/test-db";

// Store the IDs so we can access them in the tests
let testUserId, testAdminId;

// Mock JWT verification
jest.mock("../middleware/jwtauth", () => {
  // Create the IDs inside the mock factory function
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockAdminId = new mongoose.Types.ObjectId().toString();

  // Store the IDs for later use
  testUserId = mockUserId;
  testAdminId = mockAdminId;

  return {
    verifyToken: jest.fn((req, res, next) => {
      if (req.headers.authorization === "Bearer valid-user-token") {
        req.user = { id: mockUserId, role: "user" };
        next();
      } else if (req.headers.authorization === "Bearer valid-admin-token") {
        req.user = { id: mockAdminId, role: "admin" };
        next();
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
    }),
  };
});

describe("Dashboard Controller", () => {
  let userId, adminId;

  beforeAll(async () => {
    try {
      // Disconnect first if there's an active connection
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }

      // Connect to the test database
      await mongoose.connect(MONGO_TEST_URI);

      // Create test users
      const user = await User.create({
        _id: testUserId, // Use the ID created in the mock
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
        role: "user",
      });
      userId = user._id;

      const admin = await User.create({
        _id: testAdminId, // Use the ID created in the mock
        username: "testadmin",
        email: "testadmin@example.com",
        password: "adminpass123",
        role: "admin",
      });
      adminId = admin._id;

      // Create test data
      await Budget.create({
        _id: new mongoose.Types.ObjectId(),
        user: userId,
        amount: 1000,
        category: "Food",
        period: "monthly",
      });

      await Transaction.create({
        _id: new mongoose.Types.ObjectId(),
        user: userId,
        amount: 50,
        category: "Food",
        type: "expense",
        description: "Groceries",
      });

      await Goal.create({
        _id: new mongoose.Types.ObjectId(),
        user: userId,
        name: "Save for vacation",
        targetAmount: 2000,
        currentAmount: 500,
        deadline: new Date("2024-12-31"),
      });
    } catch (err) {
      console.error("Test setup error:", err);
    }
  });

  afterAll(async () => {
    // Clean up data collections instead of dropping database
    await User.deleteMany({});
    await Budget.deleteMany({});
    await Transaction.deleteMany({});
    await Goal.deleteMany({});
    await mongoose.connection.close();
  });

  describe("GET /api/dashboard", () => {
    it("should get user dashboard data", async () => {
      const res = await request(app)
        .get("/api/dashboard")
        .set("Authorization", "Bearer valid-user-token");

      expect(res.statusCode).toEqual(200);
      // Updated to match actual API response structure
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("recentTransactions");
      expect(res.body.data).toHaveProperty("budgetSummary");
      expect(res.body.data).toHaveProperty("savingsGoals");
    });

    it("should not get dashboard data without a token", async () => {
      const res = await request(app).get("/api/dashboard");

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("message", "Unauthorized");
    });
  });

  describe("GET /api/dashboard/admin", () => {
    it("should get admin dashboard data", async () => {
      const res = await request(app)
        .get("/api/dashboard/admin")
        .set("Authorization", "Bearer valid-admin-token");

      expect(res.statusCode).toEqual(200);
      // Updated to match actual API response structure
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("userStatistics");
      expect(res.body.data).toHaveProperty("financialSummaries");
      expect(res.body.data).toHaveProperty("activityStatistics");
    });

    it("should not get admin dashboard data without admin role", async () => {
      const res = await request(app)
        .get("/api/dashboard/admin")
        .set("Authorization", "Bearer valid-user-token");

      expect(res.statusCode).toEqual(403);
      // Updated to match actual error message from API
      expect(res.body).toHaveProperty("message", "Access denied - Admin only");
    });
  });
});
