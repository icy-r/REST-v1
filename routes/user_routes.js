const express = require('express');
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/jwtauth');

const router = express.Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current logged in user
 *     tags: [Users]
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
router.get('/me', verifyToken, userController.getMe);

/**
 * @swagger
 * /users/update-details:
 *   put:
 *     summary: Update user details
 *     tags: [Users]
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
router.put('/update-details', verifyToken, userController.updateDetails);

/**
 * @swagger
 * /users/update-password:
 *   put:
 *     summary: Update user password
 *     tags: [Users]
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
router.put('/update-password', verifyToken, userController.updatePassword);

module.exports = router;
