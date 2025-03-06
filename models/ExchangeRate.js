const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exchangeRateSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    baseCurrency: { type: String, required: true },
    targetCurrency: { type: String, required: true },
    rate: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    source: { type: String, required: true },
    lastUpdate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ExchangeRate', exchangeRateSchema);
