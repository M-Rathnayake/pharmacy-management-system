const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
  account_name: {
    type: String, 
    required: true,
    trim: true
  },
  transaction_type: {
    type: String,
    required: true,
    enum: ['debit', 'credit'], // Ensures only these two values are accepted
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    //default: Date.now
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01 // Ensures amount is positive
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Remove the _id field from JSON output
ledgerSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) { delete ret._id }
});

module.exports = mongoose.model('Ledger', ledgerSchema);