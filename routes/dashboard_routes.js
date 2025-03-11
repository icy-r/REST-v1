const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/jwtauth');
const { isAdmin } = require('../middleware/authmiddleware');

const router = express.Router();

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get dashboard data based on user role
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.get('/', verifyToken, (req, res, next) => {
    if (req.user.role === 'admin') {
        dashboardController.getAdminDashboard(req, res, next);
    } else {
        dashboardController.getUserDashboard(req, res, next);
    }
});

/**
 * @swagger
 * /dashboard/admin:
 *   get:
 *     summary: Get admin dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       403:
 *         description: Access denied - Admin authorization required
 *       500:
 *         description: Server error
 */
router.get('/admin', verifyToken, isAdmin, dashboardController.getAdminDashboard);

/**
 * @swagger
 * /dashboard/user:
 *   get:
 *     summary: Get user dashboard data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       500:
 *         description: Server error
 */
router.get('/user', verifyToken, dashboardController.getUserDashboard);

module.exports = router;
