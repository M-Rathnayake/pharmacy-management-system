const { body, validationResult } = require('express-validator');
const Ledger = require("../models/ledger");

const validateLedgerEntry = [
  body('accountName')
    .notEmpty().withMessage('Account name is required')
    .trim()
    .isLength({ max: 50 }).withMessage('Account name cannot exceed 50 characters'),
  
  body('accountCode')
    .notEmpty().withMessage('Account code is required')
    .trim()
    .matches(/^[A-Z0-9-]+$/).withMessage('Account code can only contain uppercase letters, numbers and hyphens'),
  
  body('accountType')
    .notEmpty().withMessage('Account type is required')
    .isIn(['asset', 'liability', 'equity', 'revenue', 'expense']).withMessage('Invalid account type'),
  
  body('subAccountType')
    .optional()
    .isIn(['current', 'non-current', null]).withMessage('Invalid sub-account type'),
  
  body('openingBalance')
    .isFloat().withMessage('Opening balance must be a number'),
  
  body('balanceType')
    .notEmpty().withMessage('Balance type is required')
    .isIn(['debit', 'credit']).withMessage('Balance type must be debit or credit'),
  
  body('taxApplicable')
    .optional()
    .isBoolean().withMessage('Tax applicable must be true or false'),
  
  body('taxRate')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Tax rate must be between 0 and 100'),
  
  body('reconciliationFrequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'never']).withMessage('Invalid reconciliation frequency'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Additional validation for conditional fields
    if (req.body.taxApplicable === true && (req.body.taxRate === undefined || req.body.taxRate === null)) {
      return res.status(400).json({ errors: [{ msg: 'Tax rate is required when tax is applicable' }] });
    }
    
    if ((req.body.accountType === 'asset' || req.body.accountType === 'liability') && !req.body.subAccountType) {
      return res.status(400).json({ errors: [{ msg: 'Sub-account type is required for assets and liabilities' }] });
    }
    
    next();
  }
];

const getLedgers = async (req, res) => {
  try {
    const { type, active } = req.query;
    const query = {};
    
    if (type) query.accountType = type;
    if (active) query.isActive = active === 'true';
    
    const data = await Ledger.find(query)
      .sort({ accountName: 1 })
      .populate('createdBy', 'name email');
      
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ledger accounts" });
  }
};

const getLedgerById = async (req, res) => {
  try {
    const { id } = req.params;
    const ledger = await Ledger.findById(id).populate('createdBy', 'name email');
    
    if (!ledger) {
      return res.status(404).json({ error: "Ledger account not found" });
    }
    
    res.status(200).json(ledger);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ledger account" });
  }
};

const addLedger = async (req, res) => {
  try {
    const { accountName, accountCode, accountType, subAccountType, openingBalance, balanceType } = req.body;
    
    // Check for duplicate account code
    const existingLedger = await Ledger.findOne({ accountCode });
    if (existingLedger) {
      return res.status(400).json({ error: "Account with this code already exists" });
    }
    
    const newLedger = new Ledger({
      ...req.body,
      createdBy: req.user.id // Assuming you have user authentication
    });
    
    const savedLedger = await newLedger.save();
    res.status(201).json(savedLedger);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Account with this name or code already exists" });
    }
    res.status(500).json({ error: "Failed to create new ledger account" });
  }
};

const updateLedger = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent changing account code
    if (req.body.accountCode) {
      return res.status(400).json({ error: "Account code cannot be changed" });
    }
    
    const updatedLedger = await Ledger.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedLedger) {
      return res.status(404).json({ error: "Ledger account not found" });
    }
    
    res.status(200).json(updatedLedger);
  } catch (error) {
    res.status(500).json({ error: "Failed to update ledger account" });
  }
};

const toggleLedgerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const ledger = await Ledger.findById(id);
    
    if (!ledger) {
      return res.status(404).json({ error: "Ledger account not found" });
    }
    
    ledger.isActive = !ledger.isActive;
    const updatedLedger = await ledger.save();
    
    res.status(200).json(updatedLedger);
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle ledger status" });
  }
};

const deleteLedger = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLedger = await Ledger.findByIdAndDelete(id);
    
    if (!deletedLedger) {
      return res.status(404).json({ error: "Ledger account not found" });
    }
    
    res.status(200).json({ message: "Ledger account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete ledger account" });
  }
};

module.exports = {
  validateLedgerEntry,
  getLedgers,
  getLedgerById,
  addLedger,
  updateLedger,
  toggleLedgerStatus,
  deleteLedger
};