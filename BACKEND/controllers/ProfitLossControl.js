const { body, validationResult } = require('express-validator');
const ProfitLoss = require("../models/ProfitLoss");

const validateProfitLossEntry = [
  body('period')
    .notEmpty().withMessage('Period is required')
    .trim(),
  
  body('revenue')
    .isFloat({ min: 0 }).withMessage('Revenue must be a positive number'),
  
  body('expenses')
    .isFloat({ min: 0 }).withMessage('Expenses must be a positive number'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const getProfitLoss = async (req, res) => {
  try {
    const data = await ProfitLoss.find().sort({ period: -1 });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profit/loss data" });
  }
};

const addProfitLoss = async (req, res) => {
  try {
    const { period, revenue, expenses } = req.body;
    const profit = revenue - expenses;
    
    const newEntry = new ProfitLoss({
      period,
      revenue,
      expenses,
      profit
    });

    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Entry for this period already exists" });
    }
    res.status(500).json({ error: "Failed to create new entry" });
  }
};

const updateProfitLoss = async (req, res) => {
  try {
    const { id } = req.params;
    const { revenue, expenses } = req.body;
    const profit = revenue - expenses;

    const updatedEntry = await ProfitLoss.findByIdAndUpdate(
      id,
      { ...req.body, profit },
      { new: true, runValidators: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.status(200).json(updatedEntry);
  } catch (error) {
    res.status(500).json({ error: "Failed to update entry" });
  }
};

const deleteProfitLoss = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEntry = await ProfitLoss.findByIdAndDelete(id);

    if (!deletedEntry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.status(200).json({ message: "Entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete entry" });
  }
};

module.exports = {
  validateProfitLossEntry,
  getProfitLoss,
  addProfitLoss,
  updateProfitLoss,
  deleteProfitLoss
};