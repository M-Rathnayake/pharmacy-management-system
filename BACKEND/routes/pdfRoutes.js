const express = require('express');
const router = express.Router();
const { generateProfitLossPDF, generateBalanceSheetPDF } = require('../controllers/pdfController');

// Route to generate Profit & Loss PDF
router.get('/profit-loss/pdf/:id', generateProfitLossPDF);

// Route to generate Balance Sheet PDF
router.get('/balance-sheet/pdf/:id', generateBalanceSheetPDF);

module.exports = router;
