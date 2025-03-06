const routes = require('express').Router();
const authController = require('../middleware/authmiddleware');
const { body } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { verifyToken } = require('../middleware/jwtauth');

routes.post('/register', [
    body('username').isLength({ min: 5 }).custom((value, { req }) => {
        return
    }),
    body('password').isLength({ min: 5 }),
    body('email').isEmail(),
    body('name').not().isEmpty().withMessage('Name is required'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role')
], authController.register);

routes.post('/login', authController.login);

routes.get('/me', verifyToken, authController.getMe);

routes.put('/update-details', verifyToken, [
    body('name').optional().not().isEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Invalid email'),
    body('preferredCurrency').optional().not().isEmpty().withMessage('Preferred currency cannot be empty')
], authController.updateDetails);

routes.put('/update-password', verifyToken, [
    body('currentPassword').not().isEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 5 }).withMessage('New password must be at least 5 characters long')
], authController.updatePassword);

module.exports = routes;
