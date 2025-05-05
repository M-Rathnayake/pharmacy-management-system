const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const BalanceSheet = require('../models/BalanceSheet');

const validateBalanceSheet = [
    body('period')
        .isIn(['Monthly', 'Quarterly', 'Annual']).withMessage('Invalid period type'),
    
    body('period_date')
        .isISO8601().withMessage('Invalid date format (use YYYY-MM-DD)')
        .custom(value => {
            const date = new Date(value);
            if (isNaN(date.getTime())) throw new Error('Invalid date');
            return true;
        }),
    
    // Assets validation
    body('assets.current_assets.*').isFloat({ min: 0 }).optional().withMessage('Asset values must be positive'),
    body('assets.fixed_assets.*').isFloat({ min: 0 }).optional().withMessage('Fixed asset values must be positive'),
    body('assets.other_assets.*').isFloat({ min: 0 }).optional().withMessage('Other asset values must be positive'),
    body('assets.total_assets').isFloat({ min: 0 }).withMessage('Total assets must be positive'),
    
    // Liabilities validation
    body('liabilities.current_liabilities.*').isFloat({ min: 0 }).optional().withMessage('Liability values must be positive'),
    body('liabilities.long_term_liabilities.*').isFloat({ min: 0 }).optional().withMessage('Long-term liability values must be positive'),
    body('liabilities.total_liabilities').isFloat({ min: 0 }).withMessage('Total liabilities must be positive'),
    
    // Equity validation
    body('equity.*').isFloat().optional().withMessage('Equity values must be numbers'),
    body('equity.total_equity').isFloat().withMessage('Total equity must be a number'),
    
    // Balance validation
    body().custom((value, { req }) => {
        const assets = req.body.assets?.total_assets || 0;
        const liabilities = req.body.liabilities?.total_liabilities || 0;
        const equity = req.body.equity?.total_equity || 0;
        
        if (Math.abs(assets - (liabilities + equity)) > 0.01) {
            throw new Error('Assets must equal Liabilities plus Equity');
        }
        return true;
    }),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const createBalanceSheet = async (req, res) => {
    console.log('POST /api/balancesheets - Request body:', JSON.stringify(req.body, null, 2));
    try {
        const newBalanceSheet = new BalanceSheet(req.body);
        const savedSheet = await newBalanceSheet.save();
        console.log('Saved balance sheet:', JSON.stringify(savedSheet, null, 2));
        res.status(201).json(savedSheet);
    } catch (error) {
        console.error('Error creating balance sheet:', error.message);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

const getBalanceSheets = async (req, res) => {
    console.log('GET /api/balancesheets - Query:', JSON.stringify(req.query, null, 2));
    try {
        const { period, startDate, endDate } = req.query;
        
        let query = {};
        if (period) query.period = period;
        if (startDate && endDate) {
            query.period_date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        const sheets = await BalanceSheet.find(query).sort({ period_date: -1 });
        console.log('Fetched balance sheets:', sheets.length);
        res.json(sheets);
    } catch (error) {
        console.error('Error fetching balance sheets:', error.message);
        res.status(500).json({ error: error.message });
    }
};

const getBalanceSheetById = async (req, res) => {
    console.log(`GET /api/balancesheets/${req.params.id}`);
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        const sheet = await BalanceSheet.findById(req.params.id);
        if (!sheet) {
            return res.status(404).json({ error: 'Balance sheet not found' });
        }
        res.json(sheet);
    } catch (error) {
        console.error('Error fetching balance sheet by ID:', error.message);
        res.status(500).json({ error: error.message });
    }
};

const updateBalanceSheet = async (req, res) => {
    console.log(`PUT /api/balancesheets/${req.params.id} - Request body:`, JSON.stringify(req.body, null, 2));
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        const updatedSheet = await BalanceSheet.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedSheet) {
            return res.status(404).json({ error: 'Balance sheet not found' });
        }

        console.log('Updated balance sheet:', JSON.stringify(updatedSheet, null, 2));
        res.json(updatedSheet);
    } catch (error) {
        console.error('Error updating balance sheet:', error.message);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
};

const deleteBalanceSheet = async (req, res) => {
    console.log(`DELETE /api/balancesheets/${req.params.id}`);
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }
        const deletedSheet = await BalanceSheet.findByIdAndDelete(req.params.id);

        if (!deletedSheet) {
            return res.status(404).json({ error: 'Balance sheet not found' });
        }

        console.log('Deleted balance sheet:', JSON.stringify(deletedSheet, null, 2));
        res.json({ message: 'Balance sheet deleted successfully' });
    } catch (error) {
        console.error('Error deleting balance sheet:', error.message);
        res.status(500).json({ error: error.message });
    }
};

const getLatestBalanceSheet = async (req, res) => {
    console.log('GET /api/balancesheets/latest');
    try {
        const latestSheet = await BalanceSheet.findOne()
            .sort({ period_date: -1 })
            .limit(1);
        
        if (!latestSheet) {
            return res.status(404).json({ error: 'No balance sheets found' });
        }
        
        res.json(latestSheet);
    } catch (error) {
        console.error('Error fetching latest balance sheet:', error.message);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    validateBalanceSheet,
    createBalanceSheet,
    getBalanceSheets,
    getBalanceSheetById,
    updateBalanceSheet,
    deleteBalanceSheet,
    getLatestBalanceSheet
};