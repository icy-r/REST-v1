const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');

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
