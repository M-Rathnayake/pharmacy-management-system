const { body, validationResult } = require('express-validator');
const PettyCash = require('../models/PettyCash');

const validatePettyCashEntry = [
  body('date')
    .isISO8601().withMessage('Invalid date format (use YYYY-MM-DD)')
    .custom(value => {
      const date = new Date(value);
      if (isNaN(date.getTime())) throw new Error('Invalid date');
      if (date.getFullYear() < 2000) throw new Error('Year must be 2000 or later');
      return true;
    }),
  
  body('description').notEmpty().withMessage('Description is required'),
  
  body('receipt_no')
    .notEmpty().withMessage('Receipt number is required')
    .isString().withMessage('Receipt number must be a string'),
    
  body('transaction_type')
    .isIn(['income', 'expense']).withMessage('Transaction type must be either income or expense'),
    
  body('amount')
    .isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    
  body('balance')
    .isFloat().withMessage('Balance must be a number')
    .custom((value, { req }) => {
      const amount = parseFloat(req.body.amount);
      const transactionType = req.body.transaction_type;
      const expectedBalance = transactionType === 'income' ? amount : -amount;
      
      if (Math.abs(parseFloat(value) - expectedBalance) > 0.01) {
        throw new Error(`Balance should reflect the transaction amount`);
      }
      return true;
    }),
    
  body('category')
    .optional()
    .isIn(['office supplies', 'travel', 'entertainment', 'utilities', 'other'])
    .withMessage('Invalid category'),
    
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const addPettyCash = async (req, res) => {
  try {
    const { date, description, receipt_no, transaction_type, amount, balance, category, notes } = req.body;
    const petty_id = Date.now().toString(); // Generate timestamp ID

    const newEntry = new PettyCash({
      petty_id,
      date: new Date(date),
      description,
      receipt_no,
      transaction_type,
      amount: Number(amount),
      balance: Number(balance),
      category: category || 'other',
      notes
    });

    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Petty cash entry already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

const getPettyCashEntries = async (req, res) => {
  try {
    const { type, category, startDate, endDate } = req.query;
    let query = {};
    
    if (type) query.transaction_type = type;
    if (category) query.category = category;
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const data = await PettyCash.find(query).sort({ date: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePettyCash = async (req, res) => {
  try {
    const { petty_id } = req.params;
    const updatedEntry = await PettyCash.findOneAndUpdate(
      { petty_id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.json(updatedEntry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletePettyCash = async (req, res) => {
  try {
    const { petty_id } = req.params;
    const deletedEntry = await PettyCash.findOneAndDelete({ petty_id });

    if (!deletedEntry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.json({ message: "Entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCurrentBalance = async (req, res) => {
  try {
    const balance = await PettyCash.getCurrentBalance();
    res.json({ current_balance: balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  validatePettyCashEntry,
  addPettyCash,
  getPettyCashEntries,
  updatePettyCash,
  deletePettyCash,
  getCurrentBalance
};