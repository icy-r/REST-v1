const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middleware/jwtauth');
const { isAdmin } = require('../middleware/authmiddleware');

const router = express.Router();

// Get dashboard based on user role
router.get('/', verifyToken, (req, res, next) => {
    if (req.user.role === 'admin') {
        dashboardController.getAdminDashboard(req, res, next);
    } else {
        dashboardController.getUserDashboard(req, res, next);
    }
});

// Specific endpoints
router.get('/admin', verifyToken, isAdmin, dashboardController.getAdminDashboard);
router.get('/user', verifyToken, dashboardController.getUserDashboard);

module.exports = router;
