const { body, validationResult } = require('express-validator');
const Ledger = require("../models/Ledger");
const mongoose = require('mongoose');

const validateLedgerEntry = [
  body('accountName')
    .notEmpty().withMessage('Account name is required')
    .trim(),
  
  body('accountCode')
    .notEmpty().withMessage('Account code is required')
    .trim()
    .custom(value => {
      if (!value) {
        throw new Error('Account code is required');
      }
      if (!/^[A-Z]{3,4}\d{3}$/.test(value)) {
        throw new Error('Account code must be in format: 3-4 uppercase letters followed by 3 numbers (e.g., CASH001)');
      }
      return true;
    })
    .custom(async (value) => {
      if (!value) return true; // Skip if empty (will be caught by previous validation)
      const existingLedger = await Ledger.findOne({ accountCode: value.toUpperCase() });
      if (existingLedger) {
        throw new Error('Account code already exists');
      }
      return true;
    }),
  
  body('accountType')
    .notEmpty().withMessage('Account type is required')
    .isIn(['asset', 'liability', 'equity', 'revenue', 'expense']),
  
  body('openingBalance')
    .isFloat().withMessage('Opening balance must be a number'),
  
  body('balanceType')
    .notEmpty().withMessage('Balance type is required')
    .isIn(['debit', 'credit']),
  
  body('taxApplicable')
    .optional()
    .isBoolean().withMessage('Tax applicable must be true or false'),
  
  body('taxRate')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Tax rate must be between 0 and 100'),
  
  body('reconciliationFrequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'never'])
    .withMessage('Invalid reconciliation frequency'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: "Validation Error",
        details: errors.array().map(err => err.msg)
      });
    }
    
    // Additional validation for conditional fields
    if (req.body.taxApplicable === true && (req.body.taxRate === undefined || req.body.taxRate === null)) {
      return res.status(400).json({ 
        error: "Validation Error",
        details: ['Tax rate is required when tax is applicable']
      });
    }
    
    next();
  }
];

const getLedgers = async (req, res) => {
  try {
    const ledgers = await Ledger.find();
    res.json(ledgers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLedger = async (req, res) => {
  try {
    const ledger = await Ledger.findById(req.params.id);
    if (!ledger) {
      return res.status(404).json({ message: 'Ledger not found' });
    }
    res.json(ledger);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addLedger = async (req, res) => {
  try {
    const { accountName, accountCode, accountType, openingBalance, balanceType } = req.body;

    // Basic validation
    if (!accountName || !accountCode || !accountType || openingBalance === undefined || !balanceType) {
      return res.status(400).json({
        error: "Validation Error",
        details: ["All required fields must be provided"]
      });
    }

    // Format account code to uppercase
    const formattedAccountCode = accountCode.toUpperCase();

    // Check for duplicate account code
    const existingLedger = await Ledger.findOne({ accountCode: formattedAccountCode });
    if (existingLedger) {
      return res.status(400).json({
        error: "Duplicate Error",
        details: ["An account with this code already exists"]
      });
    }

    // Create new ledger with default values for optional fields
    const ledger = new Ledger({
      accountName,
      accountCode: formattedAccountCode,
      accountType,
      openingBalance,
      balanceType,
      isActive: true,
      taxApplicable: false,
      taxRate: 0,
      reconciliationFrequency: 'monthly'
    });

    const newLedger = await ledger.save();
    res.status(201).json(newLedger);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: "Validation Error",
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({ message: error.message });
  }
};

const updateLedger = async (req, res) => {
  try {
    const ledger = await Ledger.findById(req.params.id);
    if (!ledger) {
      return res.status(404).json({ message: 'Ledger not found' });
    }

    // Update only provided fields
    Object.keys(req.body).forEach(key => {
      if (key === 'accountCode') {
        ledger[key] = req.body[key].toUpperCase();
      } else {
        ledger[key] = req.body[key];
      }
    });

    const updatedLedger = await ledger.save();
    res.json(updatedLedger);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteLedger = async (req, res) => {
  try {
    const ledger = await Ledger.findById(req.params.id);
    if (!ledger) {
      return res.status(404).json({ message: 'Ledger not found' });
    }
    await ledger.deleteOne();
    res.json({ message: 'Ledger deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  validateLedgerEntry,
  getLedgers,
  getLedger,
  addLedger,
  updateLedger,
  deleteLedger
};