const { validationResult } = require('express-validator');
const BankBook = require('../models/BankBook');

const validateBankBookEntry = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation errors:', errors.array());
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

const addBankBook = async (req, res) => {
  try {
    let { date, description, voucher_no, deposits = 0, withdrawal = 0 } = req.body;

    // Convert date to proper Date object if it's a string
    if (typeof date === 'string') {
      date = new Date(date);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
    }

    // Convert amounts to numbers
    deposits = Number(deposits);
    withdrawal = Number(withdrawal);

    const newEntry = await BankBook.create({
      date,
      description,
      voucher_no: voucher_no || null,
      deposits,
      withdrawal
      // balance will be auto-calculated in pre-save hook
    });

    res.status(201).json({
      message: 'Entry created successfully',
      data: newEntry
    });

  } catch (error) {
    console.error('Create error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors
      });
    }
    
    res.status(500).json({ 
      error: 'Server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const getBankBooks = async (req, res) => {
  try {
    const entries = await BankBook.find().sort({ date: -1, createdAt: -1 });
    res.json(entries);
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
};

const updateBankBook = async (req, res) => {
  try {
    const { bankbook_id } = req.params;
    let { date, description, voucher_no, deposits = 0, withdrawal = 0 } = req.body;

    // Convert date if needed
    if (typeof date === 'string') {
      date = new Date(date);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
    }

    // Convert amounts
    deposits = Number(deposits);
    withdrawal = Number(withdrawal);

    const updatedEntry = await BankBook.findByIdAndUpdate(
      bankbook_id,
      {
        date,
        description,
        voucher_no: voucher_no || null,
        deposits,
        withdrawal
        // balance will be recalculated on save
      },
      { new: true, runValidators: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({
      message: 'Entry updated successfully',
      data: updatedEntry
    });

  } catch (error) {
    console.error('Update error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors
      });
    }

    res.status(500).json({ 
      error: 'Server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const deleteBankBook = async (req, res) => {
  try {
    const { bankbook_id } = req.params;
    const deletedEntry = await BankBook.findByIdAndDelete(bankbook_id);

    if (!deletedEntry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ 
      message: 'Entry deleted successfully',
      deletedId: bankbook_id
    });

  } catch (error) {
    console.error('Delete error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
};

module.exports = {
  validateBankBookEntry,
  addBankBook,
  getBankBooks,
  updateBankBook,
  deleteBankBook
};