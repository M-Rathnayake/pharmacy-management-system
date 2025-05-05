const express = require('express');
const router = express.Router();
const { 
  validateBankBookEntry,
  addBankBook,
  getBankBooks,
  updateBankBook,
  deleteBankBook
} = require('../controllers/BankBookControl');

router.post('/', validateBankBookEntry, addBankBook);
router.get('/', getBankBooks);
router.put('/:bankbook_id', validateBankBookEntry, updateBankBook);
router.delete('/:bankbook_id', deleteBankBook);

module.exports = router;