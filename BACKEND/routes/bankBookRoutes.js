const express = require('express');
const router = express.Router();
const BankBookController = require("../controllers/BankBookControl"); // Import the BankBookController

// Define Routes
router.post('/bankbook', BankBookController.addBankBook);  // POST request to add bank book entry
router.get('/bankbook', BankBookController.getBankBooks);   // GET request to fetch all records
router.put('/bankbook/:id', BankBookController.updateBankBook);  // PUT request to update a record
router.delete('/bankbook/:id', BankBookController.deleteBankBook);  // DELETE request to remove a record

module.exports = router;
