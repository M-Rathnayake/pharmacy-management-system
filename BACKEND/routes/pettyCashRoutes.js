const express = require('express');
const router = express.Router();
const PettyCashController = require("../controllers/PettyCashControl");

// Define Routes
router.post('/pettycash', PettyCashController.addPettyCash);  // Add a petty cash record
router.get('/pettycash', PettyCashController.getPettyCash);   // Get all petty cash records
router.put('/pettycash/:petty_id', PettyCashController.updatePettyCash);  // Update a petty cash record
router.delete('/pettycash/:petty_id', PettyCashController.deletePettyCash);  // Delete a petty cash record

module.exports = router;
