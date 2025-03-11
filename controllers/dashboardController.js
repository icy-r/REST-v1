const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const mongoose = require('mongoose');

// Get admin dashboard data
exports.getAdminDashboard = async (req, res) => {
    try {
        // Ensure the user is an admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied - Admin authorization required'
            });
        }
        
        // Get user statistics
        const userCount = await User.countDocuments();
        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        
        // Get transaction statistics
        const totalTransactions = await Transaction.countDocuments();
        const transactionsByType = await Transaction.aggregate([
            { $group: { _id: '$type', count: { $sum: 1 }, total: { $sum: '$amount' } } }
        ]);
        
        // Get recent users
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('username name email createdAt');
            
        // Get financial summaries
        const financialSummary = await Transaction.aggregate([
            { 
                $group: { 
                    _id: null, 
                    totalIncome: { 
                        $sum: { 
                            $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] 
                        } 
                    },
                    totalExpense: { 
                        $sum: { 
                            $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] 
                        } 
                    }
                } 
            }
        ]);
        
        // Get active budgets and goals
        const activeBudgets = await Budget.countDocuments();
        const activeGoals = await Goal.countDocuments({ status: 'in-progress' });
        const completedGoals = await Goal.countDocuments({ status: 'completed' });
        
        res.status(200).json({
            success: true,
            data: {
                userStatistics: {
                    totalUsers: userCount,
                    usersByRole,
                    recentUsers
                },
                activityStatistics: {
                    totalTransactions,
                    transactionsByType,
                    activeBudgets,
                    activeGoals,
                    completedGoals
                },
                financialSummaries: financialSummary[0] || { totalIncome: 0, totalExpense: 0 }
            }
        });
    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving admin dashboard data',
            error: error.message
        });
    }
};

// Get user dashboard data
exports.getUserDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Get recent transactions
        const recentTransactions = await Transaction.find({ userId: userId })
          .sort({ date: -1 })
          .limit(5);

        // Get transaction summary
        const transactionSummary = await Transaction.aggregate([
          { $match: { userId: new mongoose.Types.ObjectId(userId) } },
          {
            $group: {
              _id: null,
              totalIncome: {
                $sum: {
                  $cond: [{ $eq: ["$type", "income"] }, "$amount", 0],
                },
              },
              totalExpense: {
                $sum: {
                  $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0],
                },
              },
            },
          },
        ]);

        // Calculate balance
        const balance =
          transactionSummary.length > 0
            ? transactionSummary[0].totalIncome -
              transactionSummary[0].totalExpense
            : 0;

        // Get active budgets
        const budgets = await Budget.find({ userId }).sort({ createdAt: -1 });

        // Get budget utilization
        const budgetUtilization = await Promise.all(
          budgets.map(async (budget) => {
            // Calculate spending for this budget category
            const spending = await Transaction.aggregate([
              {
                $match: {
                  userId: mongoose.Types.ObjectId(userId),
                  category: budget.category,
                  type: "expense",
                  date: {
                    $gte: budget.startDate,
                    $lte: budget.endDate || new Date(),
                  },
                },
              },
              { $group: { _id: null, total: { $sum: "$amount" } } },
            ]);

            const spentAmount = spending.length > 0 ? spending[0].total : 0;
            const percentage =
              budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0;

            return {
              budgetId: budget._id,
              name: budget.name,
              amount: budget.amount,
              spentAmount,
              percentage: parseFloat(percentage.toFixed(2)),
              remaining: budget.amount - spentAmount,
            };
          })
        );

        // Get goals
        const goals = await Goal.find({ userId }).sort({ targetDate: 1 });

        // Get goal progress
        const goalProgress = goals.map((goal) => ({
          goalId: goal._id,
          name: goal.name,
          targetAmount: goal.targetAmount,
          currentAmount: goal.currentAmount,
          percentage: parseFloat(
            ((goal.currentAmount / goal.targetAmount) * 100).toFixed(2)
          ),
          remaining: goal.targetAmount - goal.currentAmount,
          targetDate: goal.targetDate,
          status: goal.status,
        }));

        res.status(200).json({
          success: true,
          data: {
            financialSummary: {
              balance,
              income:
                transactionSummary.length > 0
                  ? transactionSummary[0].totalIncome
                  : 0,
              expense:
                transactionSummary.length > 0
                  ? transactionSummary[0].totalExpense
                  : 0,
            },
            recentTransactions,
            budgetSummary: {
              totalBudgets: budgets.length,
              budgetUtilization,
            },
            goalSummary: {
              totalGoals: goals.length,
              activeGoals: goals.filter((g) => g.status === "in-progress")
                .length,
              completedGoals: goals.filter((g) => g.status === "completed")
                .length,
              goalProgress,
            },
            savingsGoals: {
              totalGoals: goals.length,
              activeGoals: goals.filter((g) => g.status === "in-progress")
                .length,
              completedGoals: goals.filter((g) => g.status === "completed")
                .length,
              goalProgress,
            },
          },
        });
    } catch (error) {
        console.error('User dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving user dashboard data',
            error: error.message
        });
    }
};

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
    process.exit(1);
});
