const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

// Create budget
exports.createBudget = async (req, res) => {
    try {
        req.body.userId = req.user.id;
        
        const budget = await Budget.create(req.body);
        
        res.status(201).json({
            success: true,
            data: budget
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating budget',
            error: error.message
        });
    }
};

// Get all budgets for a user
exports.getUserBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ userId: req.user.id });
        
        res.status(200).json({
            success: true,
            count: budgets.length,
            data: budgets
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving budgets',
            error: error.message
        });
    }
};

// Get budget by ID
exports.getBudget = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);
        
        if (!budget) {
            return res.status(404).json({
                success: false,
                message: 'Budget not found'
            });
        }
        
        // Check if user owns budget or is admin
        if (budget.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        
        res.status(200).json({
            success: true,
            data: budget
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving budget',
            error: error.message
        });
    }
};

// Update budget
exports.updateBudget = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);
        
        if (!budget) {
            return res.status(404).json({
                success: false,
                message: 'Budget not found'
            });
        }
        
        // Check if user owns budget or is admin
        if (budget.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        
        Object.assign(budget, req.body);
        
        await budget.save();
        
        res.status(200).json({
            success: true,
            data: budget
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating budget',
            error: error.message
        });
    }
};

// Delete budget
exports.deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);
        
        if (!budget) {
            return res.status(404).json({
                success: false,
                message: 'Budget not found'
            });
        }
        
        // Check if user owns budget or is admin
        if (budget.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        
        await budget.remove();
        
        res.status(200).json({
            success: true,
            message: 'Budget deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting budget',
            error: error.message
        });
    }
};

// Notify users when nearing or exceeding budgets
exports.notifyBudgetStatus = async () => {
    try {
        const budgets = await Budget.find();
        
        for (const budget of budgets) {
            const transactions = await Transaction.find({
                userId: budget.userId,
                category: budget.category,
                date: { $gte: budget.startDate, $lte: budget.endDate }
            });
            
            const totalSpent = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
            const budgetUsage = totalSpent / budget.amount;
            
            if (budgetUsage >= budget.notificationThreshold) {
                const notification = new Notification({
                    userId: budget.userId,
                    type: 'budget',
                    message: `You have used ${Math.round(budgetUsage * 100)}% of your budget for ${budget.category}`,
                    status: 'unread'
                });
                
                await notification.save();
            }
        }
    } catch (error) {
        console.error('Error notifying budget status:', error);
    }
};

// Provide budget adjustment recommendations based on spending trends
exports.provideBudgetRecommendations = async () => {
    try {
        const budgets = await Budget.find();
        
        for (const budget of budgets) {
            const transactions = await Transaction.find({
                userId: budget.userId,
                category: budget.category,
                date: { $gte: budget.startDate, $lte: budget.endDate }
            });
            
            const totalSpent = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
            const budgetUsage = totalSpent / budget.amount;
            
            if (budgetUsage >= budget.notificationThreshold) {
                const recommendation = `Consider adjusting your budget for ${budget.category} based on your spending trends.`;
                
                const notification = new Notification({
                    userId: budget.userId,
                    type: 'budget-recommendation',
                    message: recommendation,
                    status: 'unread'
                });
                
                await notification.save();
            }
        }
    } catch (error) {
        console.error('Error providing budget recommendations:', error);
    }
};
