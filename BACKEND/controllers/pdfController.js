const fs = require('fs');
const PDFDocument = require('pdfkit');
const ProfitLoss = require('../models/ProfitLoss'); // Update path as necessary
const BalanceSheet = require('../models/BalanceSheet'); // Example for another document type

// Function to generate ProfitLoss PDF
const generateProfitLossPDF = async (req, res) => {
  try {
    const profitLoss = await ProfitLoss.findById(req.params.id); // Fetch the Profit Loss data

    if (!profitLoss) {
      return res.status(404).json({ error: 'Profit Loss record not found' });
    }

    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="profit_loss.pdf"');
    
    doc.pipe(res);

    // Adding content to the PDF
    doc.fontSize(20).text('Profit & Loss Statement', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Net Profit: ${profitLoss.net_Profit}`);
    // Add more fields as per your document structure
    doc.end();
  } catch (error) {
    console.error('Error generating Profit Loss PDF:', error);
    res.status(500).json({ error: 'Error generating Profit Loss PDF' });
  }
};

// Function to generate Balance Sheet PDF (Example)
const generateBalanceSheetPDF = async (req, res) => {
  try {
    const balanceSheet = await BalanceSheet.findById(req.params.id); // Fetch Balance Sheet data

    if (!balanceSheet) {
      return res.status(404).json({ error: 'Balance Sheet record not found' });
    }

    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="balance_sheet.pdf"');
    
    doc.pipe(res);

    // Adding content to the PDF
    doc.fontSize(20).text('Balance Sheet', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Assets: ${balanceSheet.assets}`);
    doc.fontSize(12).text(`Liabilities: ${balanceSheet.liabilities}`);
    // Add more fields as per your document structure
    doc.end();
  } catch (error) {
    console.error('Error generating Balance Sheet PDF:', error);
    res.status(500).json({ error: 'Error generating Balance Sheet PDF' });
  }
};

module.exports = { generateProfitLossPDF, generateBalanceSheetPDF };
