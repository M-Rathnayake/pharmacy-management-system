const mongoose = require('mongoose');

const bankBookSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required'],
    validate: {
      validator: function(value) {
        return value instanceof Date && !isNaN(value.getTime()) && value.getFullYear() >= 2000;
      },
      message: 'Must be a valid date from year 2000 or later'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [3, 'Description must be at least 3 characters']
  },
  voucher_no: {
    type: String,
    default: null,
    trim: true
  },
  deposits: {
    type: Number,
    default: 0,
    min: [0, 'Deposits cannot be negative'],
    set: val => Math.round(val * 100) / 100 // Ensure 2 decimal places
  },
  withdrawal: {
    type: Number,
    default: 0,
    min: [0, 'Withdrawal cannot be negative'],
    set: val => Math.round(val * 100) / 100 // Ensure 2 decimal places
  },
  balance: {
    type: Number,
    default: 0,
    set: val => Math.round(val * 100) / 100 // Ensure 2 decimal places
  }
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.bankbook_id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Auto-calculate balance before saving
bankBookSchema.pre('save', function(next) {
  this.balance = (this.deposits || 0) - (this.withdrawal || 0);
  next();
});

// Add compound index for better query performance
bankBookSchema.index({ date: -1, createdAt: -1 });

module.exports = mongoose.model('BankBook', bankBookSchema);