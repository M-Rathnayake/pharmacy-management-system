const express = require('express');
const router = express.Router();
const ProfitLossController = require("../controllers/ProfitLossControl");

// Define Routes
router.post('/profitloss',ProfitLossController.addProfitLoss);  // POST request to add profit/loss
router.get('/profitloss', ProfitLossController.getProfitLoss);   // GET request to fetch all records
router.put('/profitloss/:_id', ProfitLossController.updateProfitLoss);  // PUT request to update a record
router.delete('/profitloss/:_id', ProfitLossController.deleteProfitLoss);  // DELETE request to remove a record

module.exports = router;