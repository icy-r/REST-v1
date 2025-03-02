const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recurrenceSchema = new Schema({
    pattern: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    nextDue: { type: Date },
    occurrences: { type: Number }
});

const transactionSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    type: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    currencyCode: { type: String, required: true },
    description: { type: String },
    tags: [{ type: String }],
    recurrence: recurrenceSchema
});

module.exports = mongoose.model('Transaction', transactionSchema);
