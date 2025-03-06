const express = require('express');
const reportController = require('../controllers/reportController');
const { verifyToken } = require('../middleware/jwtauth');
const { isAdmin, isResourceOwner } = require('../middleware/authmiddleware');
const Report = require('../models/Report');

const router = express.Router();

router.post('/generate', verifyToken, reportController.generateReport);
router.get('/:id', verifyToken, isResourceOwner(Report), reportController.getReportById);
router.get('/', verifyToken, reportController.getUserReports);
router.delete('/:id', verifyToken, isResourceOwner(Report), reportController.deleteReport);

module.exports = router;
