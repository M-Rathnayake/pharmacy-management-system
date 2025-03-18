// models/Medicine.js
const mongoose = require("mongoose");

// Define the schema
const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Item name is required"], 
    trim: true, 
    maxlength: [100, "Name cannot exceed 100 characters"]
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"]
  },
  sku: {
    type: String,
    required: true,
    unique: true, 
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ["Painkillers", "Antibiotics", "Vitamins", "Other"]
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price cannot be negative"] 
  },
  quantity: {
    type: Number,
    required: true,
    default: 0, // If not provided, defaults to 0
    min: [0, "Quantity cannot be negative"]
  },
  supplier: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ["active", "discontinued", "out_of_stock"],
    default: "active"
  },
  expiryDate: {
    type: Date 
  },
  createdAt: {
    type: Date,
    default: Date.now 
  }
});

// Create the model
const Medicine = mongoose.model("Medicine", medicineSchema);

// Export the model
module.exports = Medicine;