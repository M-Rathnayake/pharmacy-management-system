const express = require('express');
const router = express.Router();
const { 
  validateBankBookEntry,
  addBankBook,
  getBankBooks,
  updateBankBook,
  deleteBankBook
} = require('../controllers/BankBookControl');
const { body } = require('express-validator');

// Add express-validator rules for create and update
router.post(
  '/',
  [
    body('date').notEmpty().withMessage('Date is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('deposits').optional().isFloat({ min: 0 }).withMessage('Deposits cannot be negative'),
    body('withdrawal').optional().isFloat({ min: 0 }).withMessage('Withdrawal cannot be negative'),
  ],
  validateBankBookEntry,
  addBankBook
);

router.get('/', getBankBooks);

router.put(
  '/:bankbook_id',
  [
    body('date').notEmpty().withMessage('Date is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('deposits').optional().isFloat({ min: 0 }).withMessage('Deposits cannot be negative'),
    body('withdrawal').optional().isFloat({ min: 0 }).withMessage('Withdrawal cannot be negative'),
  ],
  validateBankBookEntry,
  updateBankBook
);

router.delete('/:bankbook_id', deleteBankBook);

module.exports = router;