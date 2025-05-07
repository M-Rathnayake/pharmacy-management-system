const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  address: { type: String, required: true },
  legalDocuments: [{ type: String }], // URLs or file paths
  isVerified: { type: Boolean, default: false },
  performance: {
    deliveryTime: { type: Number, default: 0 }, // Average days
    qualityRating: { type: Number, default: 0 }, // 1-5
    compliance: { type: Boolean, default: true },
  },
  flagged: { type: Boolean, default: false },
});

module.exports = mongoose.model('Supplier', supplierSchema);