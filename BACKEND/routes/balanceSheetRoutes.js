const express = require('express');
const router = express.Router();
const {
    validateBalanceSheet,
    createBalanceSheet,
    getBalanceSheets,
    getBalanceSheetById,
    updateBalanceSheet,
    deleteBalanceSheet,
    getLatestBalanceSheet
} = require('../controllers/balanceSheetControl');

// CRUD routes
router.post('/', validateBalanceSheet, createBalanceSheet);
router.get('/', getBalanceSheets);
router.get('/latest', getLatestBalanceSheet);
router.get('/:id', getBalanceSheetById);
router.put('/:id', validateBalanceSheet, updateBalanceSheet);
router.delete('/:id', deleteBalanceSheet);

module.exports = router;