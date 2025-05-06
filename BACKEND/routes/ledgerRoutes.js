const express = require('express');
const router = express.Router();
const {
  validateLedgerEntry,
  getLedgers,
  getLedgerById,
  addLedger,
  updateLedger,
  toggleLedgerStatus,
  deleteLedger
} = require('../controllers/LedgerControl');

// Create a new ledger account
router.post('/', 
  validateLedgerEntry, 
  addLedger
);

// Get all ledger accounts with optional filtering
router.get('/', 
  getLedgers
);

// Get ledger account by ID
router.get('/:id', 
  getLedgerById
);

// Get ledger accounts by account type
router.get('/type/:type', 
  async (req, res, next) => {
    try {
      const accounts = await Ledger.find({ 
        accountType: req.params.type,
        isActive: true 
      }).sort({ accountName: 1 });
      
      if (!accounts.length) {
        return res.status(404).json({ 
          error: `No active ${req.params.type} accounts found` 
        });
      }
      res.json(accounts);
    } catch (error) {
      next(error);
    }
  }
);

// Get ledger account by account code
router.get('/code/:code', 
  async (req, res, next) => {
    try {
      const account = await Ledger.findOne({ 
        accountCode: req.params.code.toUpperCase() 
      });
      
      if (!account) {
        return res.status(404).json({ 
          error: 'Account with this code not found' 
        });
      }
      res.json(account);
    } catch (error) {
      next(error);
    }
  }
);

// Update a ledger account
router.put('/:id',
  validateLedgerEntry,
  updateLedger
);

// Toggle ledger account status (active/inactive)
router.patch('/:id/toggle-status',
  toggleLedgerStatus
);

// Delete a ledger account
router.delete('/:id',
  deleteLedger
);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong with ledger operations!',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = router;