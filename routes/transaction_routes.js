const express = require('express');
const transactionController = require('../controllers/transactionController');
const { verifyToken } = require('../middleware/jwtauth');
const { isResourceOwner } = require('../middleware/authmiddleware');
const Transaction = require('../models/Transaction');

const router = express.Router();

router.post('/', verifyToken, transactionController.createTransaction);
router.get('/', verifyToken, transactionController.getUserTransactions);
router.get('/:id', verifyToken, isResourceOwner(Transaction), transactionController.getTransaction);
router.put('/:id', verifyToken, isResourceOwner(Transaction), transactionController.updateTransaction);
router.delete('/:id', verifyToken, isResourceOwner(Transaction), transactionController.deleteTransaction);

module.exports = router;
