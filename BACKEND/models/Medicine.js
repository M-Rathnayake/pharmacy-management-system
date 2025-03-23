// models/Medicine.js
const mongoose = require("mongoose");

// Define the schema
const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Medicine name is required"],
    trim: true,
    maxlength: [100, "Name cannot exceed 100 characters"],
    index: true
  },
  barcode: {
    type: String,
    required: [true, "Barcode is required"],
    unique: true,
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"]
  },
  stock: {
    type: Number,
    required: true,
    min: [0, "Stock cannot be negative"],
    default: 0
  },
  threshold: {
    type: Number,
    required: true,
    default: 10
  },
  expiryDate: {
    type: Date,
    required: [true, "Expiry date is required"]
  },
  category: {
    type: String,
    required: true,
    enum: ["Tablet", "Syrup", "Capsule", "Injection", "OTC", "Prescription", "Other"]
  },
  supplierId: {
    type: String,
    required: true
  },
  /*supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: [true, "Supplier ID is required"]
  },*/
  status: {
    type: String,
    enum: ["active", "discontinued", "recalled"],
    default: "active"
  },
  alerts: {
    lowStockSent: {
      type: Boolean,
      default: false
    },
    expirySent: {
      type: Boolean,
      default: false
    }
  },
  transaction: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "IMS_Transaction" 
  }]
}, {timestamps: true});

// Create the model
const Medicine = mongoose.model("Medicine", medicineSchema);

// Export the model
module.exports = Medicine;