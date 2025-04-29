const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
    b_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    periods: { type: String, required: true }, 
    assets: { type: Number, required: true },
    equity: { type: Number, required: true },
    liabilities: { type: Number, required: true },
    created_At: { type: Date, default: Date.now }
});

const BalanceSheet = mongoose.model('BalanceSheet', balanceSchema,'balancesheets');

module.exports = BalanceSheet;
