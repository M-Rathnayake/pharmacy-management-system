const express = require('express');
const router = express.Router();
const { 
  validatePettyCashEntry,
  addPettyCash,
  getPettyCashEntries,
  updatePettyCash,
  deletePettyCash,
  getCurrentBalance
} = require('../controllers/PettyCashControl');

// Create a new petty cash entry
router.post('/', validatePettyCashEntry, addPettyCash);

// Get all petty cash entries (with optional filtering)
router.get('/', getPettyCashEntries);

// Get current petty cash balance
router.get('/balance', getCurrentBalance);

// Update a petty cash entry
router.put('/:petty_id', validatePettyCashEntry, updatePettyCash);

// Delete a petty cash entry
router.delete('/:petty_id', deletePettyCash);

module.exports = router;