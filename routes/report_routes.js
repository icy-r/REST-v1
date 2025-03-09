const express = require('express');
const reportController = require('../controllers/reportController');
const { verifyToken } = require('../middleware/jwtauth');
const { isAdmin, isResourceOwner } = require('../middleware/authmiddleware');
const Report = require('../models/Report');

const router = express.Router();

/**
 * @swagger
 * /reports/generate:
 *   post:
 *     summary: Generate a new report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reportType
 *               - startDate
 *               - endDate
 *             properties:
 *               reportType:
 *                 type: string
 *                 enum: [spending-by-category, income-vs-expense, monthly-trend, tag-analysis]
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               filters:
 *                 type: object
 *                 properties:
 *                   categories:
 *                     type: array
 *                     items:
 *                       type: string
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *                   type:
 *                     type: string
 *                     enum: [income, expense]
 *     responses:
 *       201:
 *         description: Report generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 report:
 *                   $ref: '#/components/schemas/Report'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authorized
 */
router.post('/generate', verifyToken, reportController.generateReport);

/**
 * @swagger
 * /reports/{id}:
 *   get:
 *     summary: Get a report by ID
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 report:
 *                   $ref: '#/components/schemas/Report'
 *       404:
 *         description: Report not found
 *       401:
 *         description: Not authorized
 */
router.get('/:id', verifyToken, isResourceOwner(Report), reportController.getReportById);

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Get all reports for a user
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reports
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
 *                 reports:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Report'
 *       401:
 *         description: Not authorized
 */
router.get('/', verifyToken, reportController.getUserReports);

/**
 * @swagger
 * /reports/{id}:
 *   delete:
 *     summary: Delete a report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report deleted
 *       404:
 *         description: Report not found
 *       401:
 *         description: Not authorized
 */
router.delete('/:id', verifyToken, isResourceOwner(Report), reportController.deleteReport);

module.exports = router;
