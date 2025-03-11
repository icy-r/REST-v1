const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const { createUniqueTestUser, cleanupTestData } = require("./testHelpers");
require("dotenv").config();

let server;
let testUser;
let authToken;

describe("Notification Controller", () => {
  beforeAll(async () => {
    const testDBUri = process.env.MONGO_TEST_URI || process.env.MONGO_URI;
    await mongoose.connect(testDBUri);
    server = app.listen(0); // Use random port

    // Create a unique test user
    testUser = await createUniqueTestUser();

    // Get auth token
    const loginRes = await request(app).post("/api/auth/login").send({
      username: testUser.username,
      password: "Password123!",
    });

    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    await cleanupTestData();
    if (server) await server.close();
    await mongoose.connection.close();
  });

  describe("POST /notifications", () => {
    it("should create a new notification", async () => {
      const res = await request(app)
        .post("/api/notifications")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          userId: testUser._id,
          type: "info",
          message: "This is a test notification",
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("type", "info");
      expect(res.body.data).toHaveProperty(
        "message",
        "This is a test notification"
      );

      notificationId = res.body.data._id;
    });
  });

  describe("GET /notifications", () => {
    it("should get all notifications for a user", async () => {
      const res = await request(app)
        .get("/api/notifications")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe("GET /notifications/:id", () => {
    it("should get a notification by ID", async () => {
      const res = await request(app)
        .get(`/api/notifications/${notificationId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("_id", notificationId);
    });
  });

  describe("PUT /notifications/:id", () => {
    it("should update a notification", async () => {
      const res = await request(app)
        .put(`/api/notifications/${notificationId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          message: "Updated test notification",
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty(
        "message",
        "Updated test notification"
      );
    });
  });

  describe("DELETE /notifications/:id", () => {
    it("should delete a notification", async () => {
      const res = await request(app)
        .delete(`/api/notifications/${notificationId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("success", true);
    });
  });

  describe("POST /notifications/send", () => {
    it("should send a notification to a user", async () => {
      const res = await request(app)
        .post("/api/notifications/send")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          userId: testUser._id,
          type: "info",
          message: "This is a test notification",
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("type", "info");
      expect(res.body.data).toHaveProperty(
        "message",
        "This is a test notification"
      );
    });
  });
});
