const express = require('express');
const Invoice = require('../models/Invoice');
const router = express.Router();

// Create Invoice
router.post('/', async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('supplierId orderId');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve Payment
router.put('/approve/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status: 'paid' },
      { new: true }
    );
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;