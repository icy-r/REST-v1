const routes = require('express').Router();
const authController = require("../controllers/authController");
const { body } = require("express-validator");
const User = require("../models/User");
const { verifyToken } = require("../middleware/jwtauth");

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - name
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 5
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 5
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
routes.post(
  "/register",
  [
    body("username")
      .isLength({ min: 5 })
      .withMessage("Username must be at least 5 characters")
      .custom(async (value) => {
        const existingUser = await User.findOne({ username: value });
        if (existingUser) {
          throw new Error("Username already in use");
        }
        return true;
      }),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters"),
    body("email").isEmail().withMessage("Please include a valid email"),
    body("name").not().isEmpty().withMessage("Name is required"),
    body("role").optional().isIn(["user", "admin"]).withMessage("Invalid role"),
  ],
  authController.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
routes.post('/login', authController.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current logged in user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authorized
 */
routes.get('/me', verifyToken, authController.getMe);

/**
 * @swagger
 * /auth/update-details:
 *   put:
 *     summary: Update user details
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               preferredCurrency:
 *                 type: string
 *     responses:
 *       200:
 *         description: User details updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 */
routes.put('/update-details', verifyToken, [
    body('name').optional().not().isEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Invalid email'),
    body('preferredCurrency').optional().not().isEmpty().withMessage('Preferred currency cannot be empty')
], authController.updateDetails);

/**
 * @swagger
 * /auth/update-password:
 *   put:
 *     summary: Update user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 5
 *     responses:
 *       200:
 *         description: Password updated
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid credentials
 */
routes.put('/update-password', verifyToken, [
    body('currentPassword').not().isEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 5 }).withMessage('New password must be at least 5 characters long')
], authController.updatePassword);

module.exports = routes;
