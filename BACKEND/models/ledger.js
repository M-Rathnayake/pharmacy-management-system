const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
  accountName: {
    type: String,
    required: [true, 'Account name is required'],
    trim: true
  },
  accountCode: {
    type: String,
    required: [true, 'Account code is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[A-Z]{3,4}\d{3}$/.test(v);
      },
      message: props => 'Account code must be in format: 3-4 uppercase letters followed by 3 numbers (e.g., CASH001)'
    }
  },
  accountType: {
    type: String,
    required: [true, 'Account type is required'],
    enum: ['asset', 'liability', 'equity', 'revenue', 'expense']
  },
  openingBalance: {
    type: Number,
    required: [true, 'Opening balance is required'],
    default: 0
  },
  balanceType: {
    type: String,
    required: [true, 'Balance type is required'],
    enum: ['debit', 'credit']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  taxApplicable: {
    type: Boolean,
    default: false
  },
  taxRate: {
    type: Number,
    default: 0
  },
  reconciliationFrequency: {
    type: String,
    default: 'monthly',
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'never']
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for current balance
ledgerSchema.virtual('currentBalance').get(function() {
  return this.openingBalance;
});

// Pre-save middleware to ensure account code is uppercase
ledgerSchema.pre('save', function(next) {
  if (this.accountCode) {
    this.accountCode = this.accountCode.toUpperCase();
  }
  next();
});

// Create indexes
ledgerSchema.index({ accountName: 1 });
ledgerSchema.index({ accountType: 1 });
ledgerSchema.index({ isActive: 1 });
ledgerSchema.index(
  { accountCode: 1 },
  {
    unique: true,
    partialFilterExpression: {
      accountCode: { $type: "string" }
    }
  }
);

module.exports = mongoose.model('Ledger', ledgerSchema);