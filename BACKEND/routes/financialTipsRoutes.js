const express = require('express');
const router = express.Router();
const { getFinancialTips } = require('../controllers/financialTipsController');

router.post('/', getFinancialTips);

module.exports = router;