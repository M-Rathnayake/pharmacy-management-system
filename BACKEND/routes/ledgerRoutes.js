const express = require('express');
const router = express.Router();
const LedgerController = require("../controllers/LedgerControl");

// Define Routes with consistent naming and versioning
router.route('/ledger')
  .post(LedgerController.addLedger)    // Create new ledger entry
  .get(LedgerController.getLedger);    // Get all ledger entries (with optional filtering)

router.route('/ledger/:transaction_id')
  .put(LedgerController.updateLedger)     // Update specific ledger entry
  .delete(LedgerController.deleteLedger); // Delete specific ledger entry

module.exports = router;