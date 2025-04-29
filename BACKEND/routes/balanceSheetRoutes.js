const express = require('express');
const router = express.Router();
const BalanceSheetController = require("../controllers/BalanceSheetControl");

// Define Routes
router.post('/balancesheet', BalanceSheetController.addBalance);  // POST request to add a balance sheet entry
router.get('/balancesheet', BalanceSheetController.getBalance);   // GET request to fetch all balance sheets
router.put('/balancesheet/:b_id', BalanceSheetController.updateBalance);  // PUT request to update a balance sheet entry
router.delete('/balancesheet/:b_id', BalanceSheetController.deleteBalance);  // DELETE request to remove a balance sheet entry

module.exports = router;
