[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/xIbq4TFL)
# REST-v1

## Project Description and Objectives

This project is a RESTful API for managing a Personal Finance Tracker system. The system facilitates users in managing their financial records, tracking expenses, setting budgets, and analyzing spending trends. The project emphasizes secure access, data integrity, and user-friendly interfaces, simulating real-world software development challenges and solutions within a financial management context.

### Objectives:
- Develop a RESTful API using either Express JS (Node.js) or Spring Boot (Java).
- Use MongoDB to store and manage user, transaction, budget, and report data.
- Implement secure authentication and authorization mechanisms.
- Apply software development best practices to ensure code quality, maintainability, and application scalability.

## API Documentation

The API is fully documented using Swagger/OpenAPI. Once the application is running, you can access the interactive API documentation at:

### Authentication Routes
- **POST /api/auth/register**: Register a new user.
- **POST /api/auth/login**: Login a user.
- **GET /api/auth/me**: Get the current logged-in user.
- **PUT /api/auth/update-details**: Update user details.
- **PUT /api/auth/update-password**: Update user password.

### User Routes
- **GET /api/users**: Get all users (Admin only).
- **GET /api/users/:id**: Get user by ID (Admin only).
- **PUT /api/users/:id**: Update user details (Admin only).
- **DELETE /api/users/:id**: Delete user (Admin only).

### Transaction Routes
- **POST /api/transactions**: Create a new transaction.
- **GET /api/transactions**: Get all transactions for a user.
- **GET /api/transactions/:id**: Get transaction by ID.
- **PUT /api/transactions/:id**: Update transaction.
- **DELETE /api/transactions/:id**: Delete transaction.

### Budget Routes
- **POST /api/budgets**: Create a new budget.
- **GET /api/budgets**: Get all budgets for a user.
- **GET /api/budgets/:id**: Get budget by ID.
- **PUT /api/budgets/:id**: Update budget.
- **DELETE /api/budgets/:id**: Delete budget.

### Goal Routes
- **POST /api/goals**: Create a new goal.
- **GET /api/goals**: Get all goals for a user.
- **GET /api/goals/:id**: Get goal by ID.
- **PUT /api/goals/:id**: Update goal.
- **PUT /api/goals/:id/contribute**: Contribute to a goal.
- **DELETE /api/goals/:id**: Delete goal.

### Category Routes
- **POST /api/categories**: Create a new category (Admin only).
- **GET /api/categories**: Get all categories.
- **GET /api/categories/:id**: Get category by ID.
- **PUT /api/categories/:id**: Update category (Admin only).
- **DELETE /api/categories/:id**: Delete category (Admin only).

### Report Routes
- **POST /api/reports**: Generate a new report.
- **GET /api/reports**: Get all reports for a user.
- **GET /api/reports/:id**: Get report by ID.
- **DELETE /api/reports/:id**: Delete report.

## Instructions for Running the Project

1. Clone the repository:
   ```bash
   git clone https://github.com/icy-r/REST-v1.git
   cd REST-v1
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env` file in the root directory and add the following environment variables:
   ```
   PORT=3000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   JWT_COOKIE_EXPIRE=30
   ```

4. Start the server:
   ```bash
   pnpm start
   ```

5. For development, you can use:
   ```bash
   pnpm dev
   ```

## Instructions for Running Tests

1. Ensure the server is running.

2. Run the tests:
   ```bash
   pnpm test
   ```

3. For unit testing, use libraries such as Jest or Mocha with Chai for Express JS, and JUnit and Mockito for Spring Boot.

4. For integration testing, ensure different parts of the application work together seamlessly, including interactions between controllers, services, and the MongoDB database.

5. Perform security tests to identify vulnerabilities within your application using tools like OWASP ZAP or Burp Suite.

6. Evaluate the API's performance under various loads using tools like JMeter (for Spring Boot applications) or Artillery.io (for Express JS applications).
