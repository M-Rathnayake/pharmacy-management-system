const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
  accountName: {
    type: String,
    required: [true, 'Account name is required'],
    trim: true,
    maxlength: [100, 'Account name cannot exceed 100 characters']
  },
  accountCode: {
    type: String,
    required: [true, 'Account code is required'],
    trim: true,
    match: [/^[A-Z0-9-]+$/, 'Account code can only contain uppercase letters, numbers and hyphens']
  },
  accountType: {
    type: String,
    required: [true, 'Account type is required'],
    enum: {
      values: ['asset', 'liability', 'equity', 'revenue', 'expense'],
      message: 'Account type must be asset, liability, equity, revenue, or expense'
    }
  },
  subAccountType: {
    type: String,
    required: function() {
      return this.accountType === 'asset' || this.accountType === 'liability';
    },
    enum: {
      values: ['current', 'non-current', null],
      message: 'Sub-account type must be current or non-current'
    }
  },
  openingBalance: {
    type: Number,
    required: [true, 'Opening balance is required'],
    default: 0
  },
  balanceType: {
    type: String,
    required: [true, 'Balance type is required'],
    enum: {
      values: ['debit', 'credit'],
      message: 'Balance type must be debit or credit'
    }
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
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%'],
    required: function() {
      return this.taxApplicable === true;
    }
  },
  reconciliationFrequency: {
    type: String,
    enum: {
      values: ['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'never'],
      message: 'Invalid reconciliation frequency'
    },
    default: 'monthly'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for current balance (would need to be calculated based on transactions)
ledgerSchema.virtual('currentBalance').get(function() {
  // In a real implementation, this would calculate based on transactions
  return this.openingBalance;
});

// Indexes for frequently queried fields
ledgerSchema.index({ accountName: 1 });
ledgerSchema.index({ accountCode: 1 }, { unique: true });
ledgerSchema.index({ accountType: 1 });
ledgerSchema.index({ isActive: 1 });

module.exports = mongoose.model('Ledger', ledgerSchema);