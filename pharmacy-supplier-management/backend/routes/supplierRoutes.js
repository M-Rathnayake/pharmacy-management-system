const express = require('express');
const Supplier = require('../models/Supplier');
const router = express.Router();

// Add Supplier
router.post('/', async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Supplier
router.put('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Supplier
router.delete('/:id', async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Supplier deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify Legal Documents
router.put('/verify/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    );
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Record Supplier Performance
router.put('/performance/:id', async (req, res) => {
  try {
    const { deliveryTime, qualityRating, compliance } = req.body;
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { performance: { deliveryTime, qualityRating, compliance } },
      { new: true }
    );
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Flag Supplier
router.put('/flag/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { flagged: true },
      { new: true }
    );
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Generate Supplier Report
router.get('/report', async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    const report = suppliers.map(s => ({
      name: s.name,
      deliveryTime: s.performance.deliveryTime,
      qualityRating: s.performance.qualityRating,
      compliance: s.performance.compliance,
      flagged: s.flagged,
    }));
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;