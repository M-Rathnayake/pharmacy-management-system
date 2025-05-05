const { body, validationResult } = require('express-validator');
const BankBook = require('../models/BankBook');

const validateBankBookEntry = [
  body('date')
    .isISO8601().withMessage('Invalid date format (use YYYY-MM-DD)')
    .custom(value => {
      const date = new Date(value);
      if (isNaN(date.getTime())) throw new Error('Invalid date');
      if (date.getFullYear() < 2000) throw new Error('Year must be 2000 or later');
      return true;
    }),
  
  body('description').notEmpty().withMessage('Description is required'),
  
  body('deposits')
    .optional()
    .isFloat({ min: 0 }).withMessage('Deposits cannot be negative'),
    
  body('withdrawal')
    .optional()
    .isFloat({ min: 0 }).withMessage('Withdrawal cannot be negative'),
    
  body('balance')
    .isFloat().withMessage('Balance must be a number')
    .custom((value, { req }) => {
      const deposits = parseFloat(req.body.deposits) || 0;
      const withdrawal = parseFloat(req.body.withdrawal) || 0;
      const expectedBalance = deposits - withdrawal;
      if (Math.abs(parseFloat(value) - expectedBalance) > 0.01) {
        throw new Error(`Balance should be ${expectedBalance.toFixed(2)}`);
      }
      return true;
    }),
    
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

const addBankBook = async (req, res) => {
  try {
    const { date, description, voucher_no, deposits, withdrawal, balance } = req.body;
    const bankbook_id = Date.now().toString(); // Generate timestamp ID

    const newEntry = new BankBook({
      bankbook_id,
      date: new Date(date),
      description,
      voucher_no,
      deposits: Number(deposits) || 0,
      withdrawal: Number(withdrawal) || 0,
      balance: Number(balance)
    });

    const savedBankBook = await newEntry.save();
    res.status(201).json(savedBankBook);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Bankbook entry already exists" });
    }
    res.status(500).json({ error: error.message });
  }
};

const getBankBooks = async (req, res) => {
  try {
    const data = await BankBook.find().sort({ date: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateBankBook = async (req, res) => {
  try {
    const { bankbook_id } = req.params;
    const updatedEntry = await BankBook.findOneAndUpdate(
      { bankbook_id },
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

const deleteBankBook = async (req, res) => {
  try {
    const { bankbook_id } = req.params;
    const deletedEntry = await BankBook.findOneAndDelete({ bankbook_id });

    if (!deletedEntry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.json({ message: "Entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  validateBankBookEntry,
  addBankBook,
  getBankBooks,
  updateBankBook,
  deleteBankBook
};