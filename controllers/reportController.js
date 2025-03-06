const mongoose = require('mongoose');
const Report = require('../models/Report');
const Transaction = require('../models/Transaction');

// Generate report
exports.generateReport = async (req, res) => {
    try {
        const { reportType, startDate, endDate, filters } = req.body;
        
        const report = new Report({
            _id: new mongoose.Types.ObjectId(),
            userId: req.user.id,
            reportType,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            filters,
            createdAt: new Date()
        });

        // Query transactions based on date range and filters
        let query = {
            userId: req.user.id,
            date: { $gte: new Date(startDate), $lte: new Date(endDate) }
        };

        // Apply additional filters if provided
        if (filters) {
            if (filters.categories && filters.categories.length > 0) {
                query.category = { $in: filters.categories };
            }
            if (filters.tags && filters.tags.length > 0) {
                query.tags = { $in: filters.tags };
            }
            if (filters.type) {
                query.type = filters.type;
            }
        }

        const transactions = await Transaction.find(query);
        
        // Process transactions based on report type
        let reportData = {};
        
        switch (reportType) {
            case 'spending-by-category':
                reportData = transactions.reduce((result, transaction) => {
                    if (transaction.type === 'expense') {
                        if (!result[transaction.category]) {
                            result[transaction.category] = 0;
                        }
                        result[transaction.category] += transaction.amount;
                    }
                    return result;
                }, {});
                break;
                
            case 'income-vs-expense':
                reportData = transactions.reduce((result, transaction) => {
                    if (transaction.type === 'income') {
                        result.income = (result.income || 0) + transaction.amount;
                    } else {
                        result.expense = (result.expense || 0) + transaction.amount;
                    }
                    return result;
                }, { income: 0, expense: 0 });
                break;
                
            case 'monthly-trend':
                reportData = transactions.reduce((result, transaction) => {
                    const month = transaction.date.getMonth() + 1;
                    const year = transaction.date.getFullYear();
                    const key = `${year}-${month}`;
                    
                    if (!result[key]) {
                        result[key] = { income: 0, expense: 0 };
                    }
                    
                    if (transaction.type === 'income') {
                        result[key].income += transaction.amount;
                    } else {
                        result[key].expense += transaction.amount;
                    }
                    
                    return result;
                }, {});
                break;
                
            case 'tag-analysis':
                reportData = transactions.reduce((result, transaction) => {
                    if (transaction.tags && transaction.tags.length > 0) {
                        transaction.tags.forEach(tag => {
                            if (!result[tag]) {
                                result[tag] = 0;
                            }
                            result[tag] += transaction.amount;
                        });
                    }
                    return result;
                }, {});
                break;
        }
        
        report.data = reportData;
        await report.save();
        
        res.status(201).json({
            success: true,
            report
        });
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating report',
            error: error.message
        });
    }
};

// Get report by ID
exports.getReportById = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        
        if (!report) {
            return res.status(404).json({ 
                success: false,
                message: 'Report not found'
            });
        }
        
        if (report.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to access this report'
            });
        }
        
        res.status(200).json({
            success: true,
            report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving report',
            error: error.message
        });
    }
};

// Get all reports for a user
exports.getUserReports = async (req, res) => {
    try {
        const userId = req.params.userId || req.user.id;
        
        // Check authorization
        if (userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to access these reports'
            });
        }
        
        const reports = await Report.find({ userId }).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: reports.length,
            reports
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error retrieving reports',
            error: error.message
        });
    }
};

// Delete report
exports.deleteReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }
        
        if (report.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to delete this report'
            });
        }
        
        await report.remove();
        
        res.status(200).json({
            success: true,
            message: 'Report deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting report',
            error: error.message
        });
    }
};