const routes = require('express').Router();
const authController = require('../middleware/authmiddleware');
const { body } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

routes.post('/register', [
    body('username').isLength({ min: 5 }).custom((value, { req }) => {
        return
    }
    ),
    body('password').isLength({ min: 5 }),
    body('email').isEmail()
], authController.register);

routes.post('/login', authController.login);

module.exports = routes;
