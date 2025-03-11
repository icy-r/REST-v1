const mongoose = require('mongoose');
const Goal = require('../models/Goal');

// Create a new goal
exports.createGoal = async (req, res) => {
    try {
        req.body.userId = req.user.id;
        
        const goal = await Goal.create(req.body);
        
        res.status(201).json({
            success: true,
            data: goal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating goal',
            error: error.message
        });
    }
};

// Get all goals for a user
exports.getUserGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user.id });
        
        res.status(200).json({
            success: true,
            count: goals.length,
            data: goals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving goals',
            error: error.message
        });
    }
};

// Get a single goal by ID
exports.getGoal = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        
        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Goal not found'
            });
        }
        
        // Check user owns goal or is admin
        if (goal.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this goal'
            });
        }
        
        res.status(200).json({
            success: true,
            data: goal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving goal',
            error: error.message
        });
    }
};

// Update goal
exports.updateGoal = async (req, res) => {
    try {
        let goal = await Goal.findById(req.params.id);
        
        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Goal not found'
            });
        }
        
        // Check user owns goal or is admin
        if (goal.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this goal'
            });
        }
        
        goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        
        res.status(200).json({
            success: true,
            data: goal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating goal',
            error: error.message
        });
    }
};

// Update goal contribution (add to current amount)
exports.contributeToGoal = async (req, res) => {
    try {
        const { amount } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid positive amount'
            });
        }
        
        let goal = await Goal.findById(req.params.id);
        
        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Goal not found'
            });
        }
        
        // Check user owns goal or is admin
        if (goal.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to contribute to this goal'
            });
        }
        
        goal.currentAmount += amount;
        
        // Check if goal is now completed
        if (goal.currentAmount >= goal.targetAmount && goal.status === 'in-progress') {
            goal.status = 'completed';
        }
        
        await goal.save();
        
        res.status(200).json({
            success: true,
            data: goal
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error contributing to goal',
            error: error.message
        });
    }
};

// Delete goal
exports.deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        
        if (!goal) {
            return res.status(404).json({
                success: false,
                message: 'Goal not found'
            });
        }
        
        // Check user owns goal or is admin
        if (goal.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this goal'
            });
        }
        
        await goal.remove();
        
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting goal',
            error: error.message
        });
    }
};

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
    process.exit(1);
});
