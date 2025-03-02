const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const goalSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, required: true },
    deadline: { type: Date, required: true },
    status: { type: String, required: true }
});

module.exports = mongoose.model('Goal', goalSchema);