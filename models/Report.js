const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportType: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    filters: { type: Schema.Types.Mixed },
    status: { type: String, required: true }
});

module.exports = mongoose.model('Report', reportSchema);
