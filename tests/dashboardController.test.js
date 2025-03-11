const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User");
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const Goal = require("../models/Goal");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

// Create test IDs before mocking
const testUserId = new mongoose.Types.ObjectId().toString();
const testAdminId = new mongoose.Types.ObjectId().toString();
const mockUserId = new mongoose.Types.ObjectId().toString();
const mockAdminId = new mongoose.Types.ObjectId().toString();
// Mock JWT verification
jest.mock("../middleware/jwtauth", () => {
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

jest.setTimeout(60000);

describe("Dashboard Controller", () => {
  let userId, adminId;

  beforeAll(async () => {
    try {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();

      // Disconnect first if there's an active connection
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }

      // Connect to the test database
      await mongoose.connect(uri);

      // Create test users
      const user = await User.create({
        _id: testUserId, // Use the ID created in the mock
        name: "Test User",
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
        role: "user",
      });
      userId = user._id;

      const admin = await User.create({
        _id: testAdminId, // Use the ID created in the mock
        name: "Test Admin",
        username: "testadmin",
        email: "testadmin@example.com",
        password: "adminpass123",
        role: "admin",
      });
      adminId = admin._id;

      // Create test data
      await Budget.create({
        _id: new mongoose.Types.ObjectId(),
        userId: userId,
        name: "Food Budget",
        amount: 1000,
        category: "Food",
        period: "monthly",
      });

      await Transaction.create({
        _id: new mongoose.Types.ObjectId(),
        userId: userId,
        amount: 50,
        category: "Food",
        type: "expense",
        description: "Groceries",
      });

      await Goal.create({
        _id: new mongoose.Types.ObjectId(),
        userId: userId,
        name: "Save for vacation",
        targetAmount: 2000,
        currentAmount: 500,
        targetDate: new Date("2024-12-31"),
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
    if (mongoServer) {
      await mongoServer.stop();
    }
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
