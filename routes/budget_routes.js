const express = require('express');
const budgetController = require('../controllers/budgetController');
const { verifyToken } = require('../middleware/jwtauth');
const { isAdmin, isResourceOwner } = require('../middleware/authmiddleware');
const Budget = require('../models/Budget');

const router = express.Router();

router.post('/', verifyToken, budgetController.createBudget);
router.get('/', verifyToken, budgetController.getUserBudgets);
router.get('/:id', verifyToken, isResourceOwner(Budget), budgetController.getBudget);
router.put('/:id', verifyToken, isResourceOwner(Budget), budgetController.updateBudget);
router.delete('/:id', verifyToken, isResourceOwner(Budget), budgetController.deleteBudget);

module.exports = router;
