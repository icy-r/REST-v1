const express = require('express');
const goalController = require('../controllers/goalController');
const { verifyToken } = require('../middleware/jwtauth');
const { isAdmin, isResourceOwner } = require('../middleware/authmiddleware');
const Goal = require('../models/Goal');

const router = express.Router();

/**
 * @swagger
 * /goals:
 *   post:
 *     summary: Create a new goal
 *     tags: [Goals]
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
 *               - targetAmount
 *               - targetDate
 *             properties:
 *               name:
 *                 type: string
 *               targetAmount:
 *                 type: number
 *               currentAmount:
 *                 type: number
 *                 default: 0
 *               currency:
 *                 type: string
 *                 default: USD
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               targetDate:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *               autoAllocate:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                     default: false
 *                   percentage:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 100
 *               status:
 *                 type: string
 *                 enum: [in-progress, completed, cancelled]
 *                 default: in-progress
 *     responses:
 *       201:
 *         description: Goal created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Goal'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 */
router.post('/', verifyToken, goalController.createGoal);

/**
 * @swagger
 * /goals:
 *   get:
 *     summary: Get all goals for a user
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of goals
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
 *                     $ref: '#/components/schemas/Goal'
 *       401:
 *         description: Not authorized
 */
router.get('/', verifyToken, goalController.getUserGoals);

/**
 * @swagger
 * /goals/{id}:
 *   get:
 *     summary: Get a goal by ID
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Goal ID
 *     responses:
 *       200:
 *         description: Goal data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Goal'
 *       404:
 *         description: Goal not found
 *       401:
 *         description: Not authorized
 */
router.get('/:id', verifyToken, isResourceOwner(Goal), goalController.getGoal);

/**
 * @swagger
 * /goals/{id}:
 *   put:
 *     summary: Update a goal
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Goal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               targetAmount:
 *                 type: number
 *               currentAmount:
 *                 type: number
 *               currency:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               targetDate:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *               autoAllocate:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   percentage:
 *                     type: number
 *                     minimum: 0
 *                     maximum: 100
 *               status:
 *                 type: string
 *                 enum: [in-progress, completed, cancelled]
 *     responses:
 *       200:
 *         description: Goal updated
 *       404:
 *         description: Goal not found
 *       401:
 *         description: Not authorized
 */
router.put('/:id', verifyToken, isResourceOwner(Goal), goalController.updateGoal);

/**
 * @swagger
 * /goals/{id}/contribute:
 *   put:
 *     summary: Contribute to a goal
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Goal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Contribution added to goal
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Goal not found
 *       401:
 *         description: Not authorized
 */
router.put('/:id/contribute', verifyToken, isResourceOwner(Goal), goalController.contributeToGoal);

/**
 * @swagger
 * /goals/{id}:
 *   delete:
 *     summary: Delete a goal
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Goal ID
 *     responses:
 *       200:
 *         description: Goal deleted
 *       404:
 *         description: Goal not found
 *       401:
 *         description: Not authorized
 */
router.delete('/:id', verifyToken, isResourceOwner(Goal), goalController.deleteGoal);

module.exports = router;
