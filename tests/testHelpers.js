const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Helper to create a test user with unique username
 */
async function createUniqueTestUser(username = null) {
  // Generate a unique username if none provided
  const uniqueUsername = username || `testuser_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  
  try {
    // Check if user exists and delete
    await User.deleteOne({ username: uniqueUsername });
    
    // Create fresh test user
    const user = new User({
      username: uniqueUsername,
      email: `${uniqueUsername}@example.com`,
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User'
    });
    
    await user.save();
    return user;
  } catch (err) {
    console.error('Error creating test user:', err);
    throw err;
  }
}

/**
 * Clean up test data
 */
async function cleanupTestData() {
  try {
    // Add any cleanup tasks here
    // Example: await User.deleteMany({ email: /testuser.*@example.com/ });
  } catch (err) {
    console.error('Error cleaning up test data:', err);
  }
}

module.exports = {
  createUniqueTestUser,
  cleanupTestData
};
