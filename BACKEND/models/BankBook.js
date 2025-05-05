const mongoose = require('mongoose');

const bankBookSchema = new mongoose.Schema({
  bankbook_id: {
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
  voucher_no: String,
  deposits: {
    type: Number,
    default: 0,
    min: 0
  },
  withdrawal: {
    type: Number,
    default: 0,
    min: 0
  },
  balance: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('BankBook', bankBookSchema);