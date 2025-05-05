const mongoose = require('mongoose');

const pettyCashSchema = new mongoose.Schema({
  petty_id: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  receipt_no: {
    type: String,
    required: true,
    unique: true
  },
  transaction_type: {
    type: String,
    required: true,
    enum: ['income', 'expense'] // Restrict to these values
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  balance: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['office supplies', 'travel', 'entertainment', 'utilities', 'other'],
    default: 'other'
  },
  approved_by: {
    type: String,
    required: false
  },
  notes: String
}, { 
  timestamps: true 
});

// Add pre-save hook to validate data
pettyCashSchema.pre('save', function(next) {
  if (this.transaction_type === 'expense' && this.amount <= 0) {
    throw new Error('Expense amount must be positive');
  }
  next();
});

// Add static methods
pettyCashSchema.statics.findByReceiptNo = function(receiptNo) {
  return this.findOne({ receipt_no: receiptNo });
};

pettyCashSchema.statics.getCurrentBalance = async function() {
  const result = await this.aggregate([
    {
      $group: {
        _id: null,
        totalIncome: { $sum: { $cond: [{ $eq: ["$transaction_type", "income"] }, "$amount", 0] } },
        totalExpenses: { $sum: { $cond: [{ $eq: ["$transaction_type", "expense"] }, "$amount", 0] } }
      }
    }
  ]);
  
  return result.length > 0 
    ? result[0].totalIncome - result[0].totalExpenses
    : 0;
};

const PettyCash = mongoose.model('PettyCash', pettyCashSchema);

module.exports = PettyCash;