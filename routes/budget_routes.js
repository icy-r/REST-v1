const express = require('express');
const budgetController = require('../controllers/budgetController');
const { verifyToken } = require('../middleware/jwtauth');
const { isAdmin, isResourceOwner } = require('../middleware/authmiddleware');
const Budget = require('../models/Budget');

const router = express.Router();

/**
 * @swagger
 * /budgets:
 *   post:
 *     summary: Create a new budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - amount
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 default: USD
 *               period:
 *                 type: string
 *                 enum: [weekly, monthly, yearly]
 *               category:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               notificationThreshold:
 *                 type: number
 *                 default: 0.8
 *     responses:
 *       201:
 *         description: Budget created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Budget'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 */
router.post('/', verifyToken, budgetController.createBudget);

/**
 * @swagger
 * /budgets:
 *   get:
 *     summary: Get all budgets for a user
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of budgets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Budget'
 *       401:
 *         description: Not authorized
 */
router.get(
  "/",
  verifyToken,
  isResourceOwner(Budget),
  budgetController.getUserBudgets
);

/**
 * @swagger
 * /budgets/user/{userId}:
 *   get:
 *     summary: Get all budgets for a user
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of budgets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Budget'
 *       401:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */

router.get(
  "/user/:userId",
  verifyToken,
  isAdmin,
  budgetController.getUserBudgets
);

/**
 * @swagger
 * /budgets/{id}:
 *   get:
 *     summary: Get a budget by ID
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget ID
 *     responses:
 *       200:
 *         description: Budget data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Budget'
 *       404:
 *         description: Budget not found
 *       401:
 *         description: Not authorized
 */
router.get('/:id', verifyToken, isResourceOwner(Budget), budgetController.getBudget);

/**
 * @swagger
 * /budgets/{id}:
 *   put:
 *     summary: Update a budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *               period:
 *                 type: string
 *                 enum: [weekly, monthly, yearly]
 *               category:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               notificationThreshold:
 *                 type: number
 *     responses:
 *       200:
 *         description: Budget updated
 *       404:
 *         description: Budget not found
 *       401:
 *         description: Not authorized
 */
router.put('/:id', verifyToken, isResourceOwner(Budget), budgetController.updateBudget);

/**
 * @swagger
 * /budgets/{id}:
 *   delete:
 *     summary: Delete a budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget ID
 *     responses:
 *       200:
 *         description: Budget deleted
 *       404:
 *         description: Budget not found
 *       401:
 *         description: Not authorized
 */
router.delete('/:id', verifyToken, isResourceOwner(Budget), budgetController.deleteBudget);

module.exports = router;
