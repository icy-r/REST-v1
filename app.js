require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

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

app.use(express.json());

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

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);

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
