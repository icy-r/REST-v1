require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

//for ip logging and rate limiting
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");

//to run cron jobs
require('./utils/cronjobs');

const app = express();
const port = process.env.PORT ? process.env.PORT : 3000;
const mongoURI = process.env.MONGO_URI;

console.log(mongoURI);

if (!mongoURI) {
  console.error("MongoDB connection URI is not defined in environment variables.");
  process.exit(1);
}

mongoose.connect(mongoURI);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Don't count successful requests
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many requests from this IP, please try again after 15 minutes"
    });
  }
});

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

// setup the logger
app.use(morgan('combined', { stream: accessLogStream }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Apply rate limiter to the /api/test endpoint
app.use('/api/test', limiter);

// API Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
  })
);

const authRoutes = require("./routes/auth_routes");
const userRoutes = require("./routes/user_routes");
const transactionRoutes = require("./routes/transaction_routes");
const budgetRoutes = require("./routes/budget_routes");
const goalRoutes = require("./routes/goal_routes");
const categoryRoutes = require("./routes/category_routes");
const reportRoutes = require("./routes/report_routes");
const dashboardRoutes = require("./routes/dashboard_routes");
const notificationsRoutes = require('./routes/notification_routes'); // Added notifications routes

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/notifications', notificationsRoutes); // Register notifications endpoints

// Add a test route for rate limiting tests
app.get('/api/test', (req, res) => {
  res.status(200).send('OK');
});

// Updated home route to redirect to API docs
app.get("/", (_req, res) => {
  res.redirect("/api-docs");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Only start the server if this file is run directly (not imported as a module)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Finance Tracker is listening at http://localhost:${port}`);
    console.log(
      `API Documentation available at http://localhost:${port}/api-docs`
    );
  });
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
  process.exit(1);
});

module.exports = app;
