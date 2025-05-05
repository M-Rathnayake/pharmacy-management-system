const mongoose = require('mongoose');

const bankBookSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required'],
    validate: {
      validator: function(value) {
        return value.getFullYear() >= 2000;
      },
      message: 'Year must be 2000 or later'
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  voucher_no: {
    type: String,
    default: null,
    trim: true
  },
  deposits: {
    type: Number,
    default: 0,
    min: [0, 'Deposits cannot be negative']
  },
  withdrawal: {
    type: Number,
    default: 0,
    min: [0, 'Withdrawal cannot be negative']
  },
  balance: {
    type: Number,
    required: [true, 'Balance is required'],
    validate: {
      validator: function(value) {
        const deposits = this.deposits || 0;
        const withdrawal = this.withdrawal || 0;
        return Math.abs(value - (deposits - withdrawal)) < 0.01;
      },
      message: function(props) {
        const deposits = this.deposits || 0;
        const withdrawal = this.withdrawal || 0;
        return `Balance should be ${(deposits - withdrawal).toFixed(2)} but got ${props.value}`;
      }
    }
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

module.exports = mongoose.model('BankBook', bankBookSchema);