const express = require('express');
const router = express.Router();
const {
  validateProfitLossEntry,
  addProfitLoss,
  getProfitLoss,
  updateProfitLoss,
  deleteProfitLoss
} = require('../controllers/ProfitLossControl');

// Create a new profit/loss entry
router.post('/', 
  validateProfitLossEntry, 
  addProfitLoss
);

// Get all profit/loss entries
router.get('/', 
  getProfitLoss
);

// Get a specific profit/loss entry by period
router.get('/period/:period', 
  async (req, res, next) => {
    try {
      const entry = await ProfitLoss.findOne({ period: req.params.period });
      if (!entry) {
        return res.status(404).json({ error: 'Entry not found' });
      }
      res.json(entry);
    } catch (error) {
      next(error);
    }
  }
);

// Update a profit/loss entry
router.put('/:id',
  validateProfitLossEntry,
  updateProfitLoss
);

// Delete a profit/loss entry
router.delete('/:id',
  deleteProfitLoss
);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = router;