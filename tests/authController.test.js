const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const authController = require("../controllers/authController");
const User = require("../models/User");
const { verifyToken } = require("../middleware/jwtauth");

const app = express();
app.use(express.json());
app.post("/api/auth/register", authController.register);
app.post("/api/auth/login", authController.login);
app.get("/api/auth/me", verifyToken, authController.getMe);
app.put("/api/auth/update-details", verifyToken, authController.updateDetails);
app.put(
  "/api/auth/update-password",
  verifyToken,
  authController.updatePassword
);

describe("Auth Controller", () => {
  let mongoServer;

  beforeAll(async () => {
    jest.setTimeout(30000);
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }, 30000);

  afterAll(async () => {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  describe("Register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "testuser",
        email: "testuser@example.com",
        password: "password123",
        name: "Test User",
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body.data).toHaveProperty("username", "testuser");
    });

    it("should not register a user with an existing email or username", async () => {
      await request(app).post("/api/auth/register").send({
        username: "testuser2",
        email: "testuser2@example.com",
        password: "password123",
        name: "Test User 2",
      });

      const res = await request(app).post("/api/auth/register").send({
        username: "testuser2",
        email: "testuser2@example.com",
        password: "password123",
        name: "Test User 2",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty(
        "message",
        "User already exists with that email or username"
      );
    });
  });

  describe("Login", () => {
    it("should login a user", async () => {
      await request(app).post("/api/auth/register").send({
        username: "testuser3",
        email: "testuser3@example.com",
        password: "password123",
        name: "Test User 3",
      });

      const res = await request(app).post("/api/auth/login").send({
        username: "testuser3",
        password: "password123",
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.data).toHaveProperty("username", "testuser3");
    });

    it("should not login a user with invalid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        username: "invaliduser",
        password: "invalidpassword",
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("message", "Invalid credentials");
    });
  });

  describe("GetMe", () => {
    it("should get the current logged in user", async () => {
      const registerRes = await request(app).post("/api/auth/register").send({
        username: "testuser4",
        email: "testuser4@example.com",
        password: "password123",
        name: "Test User 4",
      });

      const token = registerRes.body.token;

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty("username", "testuser4");
    });

    it("should not get the current logged in user without a token", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty(
        "message",
        "Authentication token is required"
      );
    });
  });

  describe("UpdateDetails", () => {
    it("should update user details", async () => {
      const registerRes = await request(app).post("/api/auth/register").send({
        username: "testuser5",
        email: "testuser5@example.com",
        password: "password123",
        name: "Test User 5",
      });

      const token = registerRes.body.token;

      const res = await request(app)
        .put("/api/auth/update-details")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Updated Test User 5",
          email: "updatedtestuser5@example.com",
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toHaveProperty("name", "Updated Test User 5");
      expect(res.body.data).toHaveProperty(
        "email",
        "updatedtestuser5@example.com"
      );
    });

    it("should not update user details without a token", async () => {
      const res = await request(app).put("/api/auth/update-details").send({
        name: "Updated Test User 5",
        email: "updatedtestuser5@example.com",
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty(
        "message",
        "Authentication token is required"
      );
    });
  });

  describe("UpdatePassword", () => {
    it("should update user password", async () => {
      const registerRes = await request(app).post("/api/auth/register").send({
        username: "testuser6",
        email: "testuser6@example.com",
        password: "password123",
        name: "Test User 6",
      });

      const token = registerRes.body.token;

      const res = await request(app)
        .put("/api/auth/update-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: "password123",
          newPassword: "newpassword123",
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty(
        "message",
        "Password updated successfully"
      );
    });

    it("should not update user password with incorrect current password", async () => {
      const registerRes = await request(app).post("/api/auth/register").send({
        username: "testuser7",
        email: "testuser7@example.com",
        password: "password123",
        name: "Test User 7",
      });

      const token = registerRes.body.token;

      const res = await request(app)
        .put("/api/auth/update-password")
        .set("Authorization", `Bearer ${token}`)
        .send({
          currentPassword: "wrongpassword",
          newPassword: "newpassword123",
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty(
        "message",
        "Current password is incorrect"
      );
    });
  });
});

module.exports = app;
