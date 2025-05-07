const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  invoiceDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Invoice', invoiceSchema);