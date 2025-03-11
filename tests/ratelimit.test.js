const request = require('supertest');
const express = require('express');
const rateLimit = require('express-rate-limit');
const app = require('../app');

// Create a test-specific app with a shorter rate limit window for testing
const testApp = express();
const testLimiter = rateLimit({
  windowMs: 1000, // 1 second for testing purposes
  max: 10, // Allow 10 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many requests from this IP, please try again after 15 minutes"
    });
  }
});

testApp.use('/api/test', testLimiter);
testApp.get('/api/test', (req, res) => {
  res.status(200).send('OK');
});

describe('Rate Limiting Tests', () => {
    it('should allow requests within rate limit', async () => {
        // Make multiple requests within limit
        for(let i = 0; i < 5; i++) {
            const response = await request(testApp)
                .get('/api/test')
                .expect(200);
        }
    });

    it('should block requests that exceed rate limit', async () => {
        // Make more requests than allowed
        for(let i = 0; i < 15; i++) {
            const response = await request(testApp)
                .get('/api/test');
            
            if(i >= 10) {
                expect(response.status).toBe(429);
                expect(response.body.message).toContain('Too many requests');
            }
        }
    });

    it('should reset rate limit after window expires', async () => {
        // Wait for rate limit window to expire (2 seconds for safety)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const response = await request(testApp)
            .get('/api/test')
            .expect(200);
    }, 5000); // Reduced timeout to 5 seconds
});