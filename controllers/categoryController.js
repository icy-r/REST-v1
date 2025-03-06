const mongoose = require('mongoose');
const Category = require('../models/Category');

// Create new category (admin only)
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(409).json({ message: 'Category with this name already exists' });
        }
        
        const category = new Category({
            _id: new mongoose.Types.ObjectId(),
            name,
            description
        });
        
        await category.save();
        
        return res.status(201).json({
            message: 'Category created successfully',
            category
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error creating category', error: error.message });
    }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        return res.status(200).json(categories);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
};

// Get single category
exports.getCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        return res.status(200).json(category);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching category', error: error.message });
    }
};

// Update category (admin only)
exports.updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        if (name) category.name = name;
        if (description !== undefined) category.description = description;
        
        await category.save();
        
        return res.status(200).json({
            message: 'Category updated successfully',
            category
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error updating category', error: error.message });
    }
};

// Delete category (admin only)
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        await Category.findByIdAndDelete(req.params.id);
        
        return res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting category', error: error.message });
    }
};
