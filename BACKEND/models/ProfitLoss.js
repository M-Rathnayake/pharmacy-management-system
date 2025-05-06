const mongoose = require('mongoose');

const profitLossSchema = new mongoose.Schema({
  period: {
    type: String,
    required: [true, 'Period is required'],
    trim: true,
    match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Period is not in the correct format']
  },
  revenue: {
    type: Number,
    required: [true, 'Revenue is required'],
    min: [0, 'Revenue cannot be negative']
  },
  expenses: {
    type: Number,
    required: [true, 'Expenses are required'],
    min: [0, 'Expenses cannot be negative']
  },
  profit: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Auto-calculate profit before saving
profitLossSchema.pre('save', function(next) {
  this.profit = this.revenue - this.expenses;
  next();
});

module.exports = mongoose.model('ProfitLoss', profitLossSchema);