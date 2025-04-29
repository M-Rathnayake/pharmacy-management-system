const mongoose = require('mongoose');

// Counter schema to store sequences for different collections
const counterSchema = new mongoose.Schema({
  _id: { type: String }, // e.g., 'profitLoss', 'bankBook', etc.
  seq: { type: Number, default: 0 }
});

// Counter model
const Counter = mongoose.model('Counter', counterSchema);

async function getNextSequenceValue(sequenceName) {
    // Fetch and increment the counter for the given sequence name
    const sequenceDocument = await Counter.findByIdAndUpdate(
      { _id: sequenceName },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }  // Create a new counter if not found
    );
    return sequenceDocument.seq;
  }
  