const express = require('express');
const router = express.Router();
const LedgerController = require("../controllers/ledgerControl");

// Define Routes
router.post('/ledger', LedgerController.addLedger);  // Add a new ledger entry
router.get('/ledger', LedgerController.getLedger);   // Get all ledger records
router.put('/ledger/:transaction_id', LedgerController.updateLedger);  // Update a ledger entry
router.delete('/ledger/:transaction_id', LedgerController.deleteLedger);  // Delete a ledger entry

module.exports = router;
