const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
    period: { 
        type: String, 
        required: true,
        enum: ['Monthly', 'Quarterly', 'Annual'],
        default: 'Annual'
    },
    period_date: { 
        type: Date, 
        required: true 
    },
    assets: {
        current_assets: {
            cash: { type: Number, default: 0, min: 0 },
            bank_balance: { type: Number, default: 0, min: 0 },
            accounts_receivable: { type: Number, default: 0, min: 0 },
            inventory: { type: Number, default: 0, min: 0 },
            prepaid_expenses: { type: Number, default: 0, min: 0 },
            other_current_assets: { type: Number, default: 0, min: 0 }
        },
        fixed_assets: {
            property: { type: Number, default: 0, min: 0 },
            equipment: { type: Number, default: 0, min: 0 },
            vehicles: { type: Number, default: 0, min: 0 },
            accumulated_depreciation: { type: Number, default: 0, max: 0 }
        },
        other_assets: {
            investments: { type: Number, default: 0, min: 0 },
            intangible_assets: { type: Number, default: 0, min: 0 },
            other_long_term_assets: { type: Number, default: 0, min: 0 }
        },
        total_assets: { type: Number, required: true, min: 0, default: 0 }
    },
    liabilities: {
        current_liabilities: {
            accounts_payable: { type: Number, default: 0, min: 0 },
            short_term_loans: { type: Number, default: 0, min: 0 },
            accrued_expenses: { type: Number, default: 0, min: 0 },
            other_current_liabilities: { type: Number, default: 0, min: 0 }
        },
        long_term_liabilities: {
            long_term_debt: { type: Number, default: 0, min: 0 },
            deferred_tax_liabilities: { type: Number, default: 0, min: 0 },
            other_long_term_liabilities: { type: Number, default: 0, min: 0 }
        },
        total_liabilities: { type: Number, required: true, min: 0, default: 0 }
    },
    equity: {
        capital: { type: Number, default: 0 },
        retained_earnings: { type: Number, default: 0 },
        current_year_profit: { type: Number, default: 0 },
        other_equity: { type: Number, default: 0 },
        total_equity: { type: Number, required: true, default: 0 }
    },
    verification: {
        verified: { type: Boolean, default: false },
        verified_by: { type: String },
        verified_at: { type: Date }
    },
    notes: { type: String, default: "" }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Improved pre-save hook with error handling
balanceSchema.pre('save', function(next) {
    try {
        // Initialize objects if they don't exist
        if (!this.assets) this.assets = {};
        if (!this.liabilities) this.liabilities = {};
        if (!this.equity) this.equity = {};

        // Initialize nested objects if they don't exist
        if (!this.assets.current_assets) this.assets.current_assets = {};
        if (!this.assets.fixed_assets) this.assets.fixed_assets = {};
        if (!this.assets.other_assets) this.assets.other_assets = {};
        if (!this.liabilities.current_liabilities) this.liabilities.current_liabilities = {};
        if (!this.liabilities.long_term_liabilities) this.liabilities.long_term_liabilities = {};

        // Calculate total current assets
        const currentAssets = 
            (this.assets.current_assets.cash || 0) +
            (this.assets.current_assets.bank_balance || 0) +
            (this.assets.current_assets.accounts_receivable || 0) +
            (this.assets.current_assets.inventory || 0) +
            (this.assets.current_assets.prepaid_expenses || 0) +
            (this.assets.current_assets.other_current_assets || 0);
        
        // Calculate total fixed assets (net of depreciation)
        const fixedAssets = 
            (this.assets.fixed_assets.property || 0) +
            (this.assets.fixed_assets.equipment || 0) +
            (this.assets.fixed_assets.vehicles || 0) +
            (this.assets.fixed_assets.accumulated_depreciation || 0);
        
        // Calculate other assets
        const otherAssets = 
            (this.assets.other_assets.investments || 0) +
            (this.assets.other_assets.intangible_assets || 0) +
            (this.assets.other_assets.other_long_term_assets || 0);
        
        // Set total assets
        this.assets.total_assets = currentAssets + fixedAssets + otherAssets;
        
        // Calculate total liabilities
        const currentLiabilities = 
            (this.liabilities.current_liabilities.accounts_payable || 0) +
            (this.liabilities.current_liabilities.short_term_loans || 0) +
            (this.liabilities.current_liabilities.accrued_expenses || 0) +
            (this.liabilities.current_liabilities.other_current_liabilities || 0);
        
        const longTermLiabilities = 
            (this.liabilities.long_term_liabilities.long_term_debt || 0) +
            (this.liabilities.long_term_liabilities.deferred_tax_liabilities || 0) +
            (this.liabilities.long_term_liabilities.other_long_term_liabilities || 0);
        
        // Set total liabilities
        this.liabilities.total_liabilities = currentLiabilities + longTermLiabilities;
        
        // Calculate total equity
        const equityTotal = 
            (this.equity.capital || 0) +
            (this.equity.retained_earnings || 0) +
            (this.equity.current_year_profit || 0) +
            (this.equity.other_equity || 0);
        
        // Set total equity
        this.equity.total_equity = equityTotal;

        // Validate accounting equation
        if (Math.abs(this.assets.total_assets - (this.liabilities.total_liabilities + this.equity.total_equity)) > 0.01) {
            throw new Error('Assets must equal Liabilities plus Equity');
        }

        next();
    } catch (error) {
        next(error);
    }
});

// Remove the path validation as it's handled in pre-save
balanceSchema.path('assets.total_assets').validate(function(value) {
    if (!this.liabilities?.total_liabilities || !this.equity?.total_equity) {
        return true; // Skip validation if totals are not yet calculated
    }
    return Math.abs(value - (this.liabilities.total_liabilities + this.equity.total_equity)) <= 0.01;
}, 'Assets must equal Liabilities plus Equity');

const BalanceSheet = mongoose.model('BalanceSheet', balanceSchema, 'balancesheets');

module.exports = BalanceSheet;