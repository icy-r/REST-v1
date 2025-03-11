const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Finance Tracker API',
    version: '1.0.0',
    description: 'API for managing personal finances, tracking expenses, setting budgets and analyzing spending trends',
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC',
    },
    contact: {
      name: 'API Support',
      url: 'https://github.com/icy-r/REST-v1',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          username: { type: 'string' },
          email: { type: 'string' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['user', 'admin'] },
          preferredCurrency: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Transaction: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          userId: { type: 'string' },
          type: { type: 'string', enum: ['income', 'expense'] },
          amount: { type: 'number' },
          currency: { type: 'string' },
          category: { type: 'string' },
          description: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          tags: { type: 'array', items: { type: 'string' } },
          isRecurring: { type: 'boolean' }
        }
      },
      Budget: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          userId: { type: 'string' },
          name: { type: 'string' },
          amount: { type: 'number' },
          currency: { type: 'string' },
          period: { type: 'string', enum: ['weekly', 'monthly', 'yearly'] },
          category: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' }
        }
      },
      Goal: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          userId: { type: 'string' },
          name: { type: 'string' },
          targetAmount: { type: 'number' },
          currentAmount: { type: 'number' },
          currency: { type: 'string' },
          targetDate: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['in-progress', 'completed', 'cancelled'] }
        }
      },
      Notification: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          userId: { type: 'string' },
          type: { type: 'string' },
          message: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          isRead: { type: 'boolean' },
          status: { type: 'string', enum: ['pending', 'sent', 'failed'] }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          error: { type: 'string' }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: [
    './routes/*.js',
    './models/*.js',
    './controllers/*.js'
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
