const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Category = require('../models/Category');

// Create transaction
exports.createTransaction = async (req, res) => {
    try {
        req.body.userId = req.user.id;
        
        const transaction = await Transaction.create(req.body);
        
        res.status(201).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating transaction',
            error: error.message
        });
    }
};

// Get all transactions for a user
exports.getUserTransactions = async (req, res) => {
    try {
        const { startDate, endDate, category, type, tags } = req.query;
        
        // Build query
        let query = { userId: req.user.id };
        
        // Add date range filter
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (startDate) {
            query.date = { $gte: new Date(startDate) };
        } else if (endDate) {
            query.date = { $lte: new Date(endDate) };
        }
        
        // Add category filter
        if (category) {
            query.category = category;
        }
        
        // Add type filter
        if (type) {
            query.type = type;
        }
        
        // Add tags filter
        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            query.tags = { $in: tagArray };
        }
        
        const transactions = await Transaction.find(query).sort({ date: -1 });
        
        res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting transactions',
            error: error.message
        });
    }
};

// Get transaction by ID
exports.getTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }
        
        // Check user owns transaction or is admin
        if (transaction.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this transaction'
            });
        }
        
        res.status(200).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting transaction',
            error: error.message
        });
    }
};

// Update transaction
exports.updateTransaction = async (req, res) => {
    try {
        let transaction = await Transaction.findById(req.params.id);
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }
        
        // Check user owns transaction or is admin
        if (transaction.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this transaction'
            });
        }
        
        transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        
        res.status(200).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating transaction',
            error: error.message
        });
    }
};

// Delete transaction
exports.deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }
        
        // Check user owns transaction or is admin
        if (transaction.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this transaction'
            });
        }
        
        await transaction.deleteOne();
        
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting transaction',
            error: error.message
        });
    }
};

// Get transaction summary
exports.getTransactionSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        // Validate date range
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Please provide startDate and endDate'
            });
        }
        
        // Build match stage for aggregation
        const matchStage = { 
            userId: mongoose.Types.ObjectId(req.user.id),
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        };
        
        // Get total income
        const incomeResult = await Transaction.aggregate([
            { $match: { ...matchStage, type: 'income' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        // Get total expense
        const expenseResult = await Transaction.aggregate([
            { $match: { ...matchStage, type: 'expense' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        // Get expenses by category
        const categoryExpenses = await Transaction.aggregate([
            { $match: { ...matchStage, type: 'expense' } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } },
            { $sort: { total: -1 } }
        ]);
        
        const totalIncome = incomeResult.length > 0 ? incomeResult[0].total : 0;
        const totalExpense = expenseResult.length > 0 ? expenseResult[0].total : 0;
        
        res.status(200).json({
            success: true,
            data: {
                totalIncome,
                totalExpense,
                balance: totalIncome - totalExpense,
                categoryExpenses: categoryExpenses.map(item => ({
                    category: item._id,
                    amount: item.total
                }))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting transaction summary',
            error: error.message
        });
    }
};

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
