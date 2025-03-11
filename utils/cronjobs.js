const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

/**
 * Process recurring transactions - checks and creates new transaction instances
 * as needed based on recurrence patterns
 */
exports.processRecurringTransactions = async () => {
    try {
        console.log('Processing recurring transactions...');
        
        // Find all recurring transactions
        const recurringTransactions = await Transaction.find({ 
            isRecurring: true 
        });
        
        const now = new Date();
        let processedCount = 0;
        
        for (const transaction of recurringTransactions) {
            // Skip if no recurring details are present
            if (!transaction.recurringDetails || !transaction.recurringDetails.frequency) {
                continue;
            }
            
            // Skip if transaction has an end date that has passed
            if (transaction.recurringDetails.endDate && 
                new Date(transaction.recurringDetails.endDate) < now) {
                continue;
            }
            
            // Get the last time this recurring transaction was processed
            const lastProcessed = transaction.recurringDetails.lastProcessed 
                ? new Date(transaction.recurringDetails.lastProcessed) 
                : new Date(transaction.date);
            
            // Check if it's time to process based on frequency
            let shouldProcess = false;
            
            switch (transaction.recurringDetails.frequency) {
                case 'daily':
                    // Check if at least 24 hours have passed
                    shouldProcess = (now - lastProcessed) >= (24 * 60 * 60 * 1000);
                    break;
                    
                case 'weekly':
                    // Check if at least 7 days have passed
                    shouldProcess = (now - lastProcessed) >= (7 * 24 * 60 * 60 * 1000);
                    break;
                    
                case 'monthly':
                    // Check if at least a month has passed (approximated to 30 days)
                    shouldProcess = (now - lastProcessed) >= (30 * 24 * 60 * 60 * 1000);
                    break;
                    
                case 'yearly':
                    // Check if at least a year has passed (approximated to 365 days)
                    shouldProcess = (now - lastProcessed) >= (365 * 24 * 60 * 60 * 1000);
                    break;
                    
                default:
                    shouldProcess = false;
            }
            
            // If it's time to process, create a new transaction instance
            if (shouldProcess) {
                // Create a new transaction with the same details
                const newTransaction = new Transaction({
                    userId: transaction.userId,
                    type: transaction.type,
                    amount: transaction.amount,
                    currency: transaction.currency,
                    category: transaction.category,
                    description: transaction.description ? 
                        `${transaction.description} (Recurring)` : '(Recurring Transaction)',
                    date: now,
                    tags: transaction.tags,
                    isRecurring: false, // This instance is not recurring itself
                });
                
                await newTransaction.save();
                
                // Update the lastProcessed date of the original recurring transaction
                transaction.recurringDetails.lastProcessed = now;
                await transaction.save();
                
                processedCount++;
            }
        }
        
        console.log(`Processed ${processedCount} recurring transactions`);
        return { success: true, processedCount };
    } catch (error) {
        console.error('Error processing recurring transactions:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send notifications for upcoming recurring transactions
 * Notifies users about transactions that are due in the next 3 days
 */
exports.sendRecurringTransactionNotifications = async () => {
    try {
        console.log('Checking for upcoming recurring transactions...');
        
        const now = new Date();
        const threeDaysFromNow = new Date(now);
        threeDaysFromNow.setDate(now.getDate() + 3);
        
        // Find all recurring transactions
        const recurringTransactions = await Transaction.find({ 
            isRecurring: true 
        });
        
        let notificationCount = 0;
        
        for (const transaction of recurringTransactions) {
            // Skip if no recurring details are present
            if (!transaction.recurringDetails || !transaction.recurringDetails.frequency) {
                continue;
            }
            
            // Skip if transaction has an end date that has passed
            if (transaction.recurringDetails.endDate && 
                new Date(transaction.recurringDetails.endDate) < now) {
                continue;
            }
            
            // Get the last time this recurring transaction was processed
            const lastProcessed = transaction.recurringDetails.lastProcessed 
                ? new Date(transaction.recurringDetails.lastProcessed) 
                : new Date(transaction.date);
                
            // Calculate next due date
            let nextDueDate = new Date(lastProcessed);
            
            switch (transaction.recurringDetails.frequency) {
                case 'daily':
                    nextDueDate.setDate(nextDueDate.getDate() + 1);
                    break;
                    
                case 'weekly':
                    nextDueDate.setDate(nextDueDate.getDate() + 7);
                    break;
                    
                case 'monthly':
                    nextDueDate.setMonth(nextDueDate.getMonth() + 1);
                    break;
                    
                case 'yearly':
                    nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
                    break;
                    
                default:
                    continue;
            }
            
            // Check if the next due date falls within the next 3 days
            if (nextDueDate >= now && nextDueDate <= threeDaysFromNow) {
                // Here you would implement the actual notification sending logic
                // For example, sending an email, push notification, or adding to a notification queue
                console.log(`Notification for transaction ${transaction._id}: ${transaction.description || transaction.category} due on ${nextDueDate.toISOString()}`);
                
                notificationCount++;
            }
        }
        
        console.log(`Sent ${notificationCount} notifications for upcoming recurring transactions`);
        return { success: true, notificationCount };
    } catch (error) {
        console.error('Error sending recurring transaction notifications:', error);
        return { success: false, error: error.message };
    }
};

// Function to check for missed recurring transactions
exports.checkMissedRecurringTransactions = async () => {
    try {
        console.log('Checking for missed recurring transactions...');
        
        const now = new Date();
        
        // Find all recurring transactions
        const recurringTransactions = await Transaction.find({ 
            isRecurring: true 
        });
        
        let missedCount = 0;
        
        for (const transaction of recurringTransactions) {
            // Skip if no recurring details are present
            if (!transaction.recurringDetails || !transaction.recurringDetails.frequency) {
                continue;
            }
            
            // Skip if transaction has an end date that has passed
            if (transaction.recurringDetails.endDate && 
                new Date(transaction.recurringDetails.endDate) < now) {
                continue;
            }
            
            // Get the last time this recurring transaction was processed
            const lastProcessed = transaction.recurringDetails.lastProcessed 
                ? new Date(transaction.recurringDetails.lastProcessed) 
                : new Date(transaction.date);
                
            // Calculate when the next transaction should have occurred
            let nextExpectedDate = new Date(lastProcessed);
            let hasMissed = false;
            
            switch (transaction.recurringDetails.frequency) {
                case 'daily':
                    nextExpectedDate.setDate(nextExpectedDate.getDate() + 1);
                    hasMissed = nextExpectedDate < now && (now - nextExpectedDate) > (24 * 60 * 60 * 1000);
                    break;
                    
                case 'weekly':
                    nextExpectedDate.setDate(nextExpectedDate.getDate() + 7);
                    hasMissed = nextExpectedDate < now && (now - nextExpectedDate) > (24 * 60 * 60 * 1000);
                    break;
                    
                case 'monthly':
                    nextExpectedDate.setMonth(nextExpectedDate.getMonth() + 1);
                    hasMissed = nextExpectedDate < now && (now - nextExpectedDate) > (24 * 60 * 60 * 1000);
                    break;
                    
                case 'yearly':
                    nextExpectedDate.setFullYear(nextExpectedDate.getFullYear() + 1);
                    hasMissed = nextExpectedDate < now && (now - nextExpectedDate) > (24 * 60 * 60 * 1000);
                    break;
                    
                default:
                    hasMissed = false;
            }
            
            if (hasMissed) {
                // Here you would implement the notification for missed transactions
                console.log(`Missed transaction alert for ${transaction._id}: ${transaction.description || transaction.category} due on ${nextExpectedDate.toISOString()}`);
                
                missedCount++;
            }
        }
        
        console.log(`Found ${missedCount} missed recurring transactions`);
        return { success: true, missedCount };
    } catch (error) {
        console.error('Error checking for missed recurring transactions:', error);
        return { success: false, error: error.message };
    }
};

// Main scheduling function that can be called to process all recurring transaction tasks
exports.scheduleRecurringTransactionTasks = async () => {
    try {
        await exports.processRecurringTransactions();
        await exports.sendRecurringTransactionNotifications();
        await exports.checkMissedRecurringTransactions();
        return { success: true, message: 'All recurring transaction tasks completed successfully' };
    } catch (error) {
        console.error('Error in recurring transaction tasks:', error);
        return { success: false, error: error.message };
    }
};
