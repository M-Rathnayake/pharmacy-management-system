const mongoose = require('mongoose');
const Ledger = require("../models/ledger");

// Constants for validation
const VALID_TRANSACTION_TYPES = ['debit', 'credit'];
const MIN_AMOUNT = 0.01;

// Helper function for date validation
const validateDate = (dateString) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? date : null;
};

// Add a new ledger entry
const addLedger = async (req, res) => {
    try {
        const { account_name, transaction_type, description, date, amount } = req.body;

        // Required field validation
        if (!account_name || !transaction_type || amount === undefined) {
            return res.status(400).json({ 
                success: false,
                error: "Account name, transaction type, and amount are required" 
            });
        }

        // Transaction type validation
        const normalizedType = transaction_type.toLowerCase();
        if (!VALID_TRANSACTION_TYPES.includes(normalizedType)) {
            return res.status(400).json({
                success: false,
                error: "Transaction type must be either 'debit' or 'credit'"
            });
        }

        // Amount validation
        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount) || parsedAmount < MIN_AMOUNT) {
            return res.status(400).json({
                success: false,
                error: `Amount must be a valid number greater than or equal to ${MIN_AMOUNT}`
            });
        }

        // Date handling
        const transactionDate = date ? validateDate(date) : new Date();
        if (!transactionDate) {
            return res.status(400).json({
                success: false,
                error: "Invalid date format. Use ISO format (YYYY-MM-DD)"
            });
        }

        const newEntry = new Ledger({
            account_name: account_name.trim(),
            transaction_type: normalizedType,
            description: description ? description.trim() : "",
            date: transactionDate,
            amount: parsedAmount
        });

        const savedLedger = await newEntry.save();
        
        res.status(201).json({ 
            success: true,
            message: "Ledger entry added successfully", 
            data: savedLedger 
        });

    } catch (error) {
        console.error("Error adding ledger entry:", error);
        res.status(500).json({ 
            success: false,
            error: "Internal Server Error", 
            message: error.message 
        });
    }
};

// Get all ledger records with filtering
const getLedger = async (req, res) => {
    try {
        const { account_name, transaction_type, startDate, endDate } = req.query;
        
        let query = {};
        
        if (account_name) query.account_name = account_name;
        if (transaction_type) {
            const normalizedType = transaction_type.toLowerCase();
            if (!VALID_TRANSACTION_TYPES.includes(normalizedType)) {
                return res.status(400).json({
                    success: false,
                    error: "Transaction type must be either 'debit' or 'credit'"
                });
            }
            query.transaction_type = normalizedType;
        }

        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                const start = validateDate(startDate);
                if (!start) {
                    return res.status(400).json({
                        success: false,
                        error: "Invalid start date format"
                    });
                }
                query.date.$gte = start;
            }
            if (endDate) {
                const end = validateDate(endDate);
                if (!end) {
                    return res.status(400).json({
                        success: false,
                        error: "Invalid end date format"
                    });
                }
                query.date.$lte = end;
            }
        }

        const data = await Ledger.find(query)
            .sort({ date: -1, created_at: -1 });
        
        res.json({
            success: true,
            count: data.length,
            data
        });
    } catch (error) {
        console.error("Error fetching ledger data:", error);
        res.status(500).json({ 
            success: false,
            message: "Error fetching ledger data", 
            error: error.message 
        });
    }
};

// Update a ledger entry
const updateLedger = async (req, res) => {
    try {
        const { id } = req.params;
        const { account_name, transaction_type, description, date, amount } = req.body;

        // Basic validation
        if (!account_name || !transaction_type || amount === undefined) {
            return res.status(400).json({ 
                success: false,
                error: "Account name, transaction type, and amount are required" 
            });
        }

        // Transaction type validation
        const normalizedType = transaction_type.toLowerCase();
        if (!VALID_TRANSACTION_TYPES.includes(normalizedType)) {
            return res.status(400).json({
                success: false,
                error: "Transaction type must be either 'debit' or 'credit'"
            });
        }

        // Amount validation
        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount) || parsedAmount < MIN_AMOUNT) {
            return res.status(400).json({
                success: false,
                error: `Amount must be a valid number greater than or equal to ${MIN_AMOUNT}`
            });
        }

        // Date validation
        const transactionDate = date ? validateDate(date) : new Date();
        if (!transactionDate) {
            return res.status(400).json({
                success: false,
                error: "Invalid date format"
            });
        }

        const updateData = {
            account_name: account_name.trim(),
            transaction_type: normalizedType,
            description: description ? description.trim() : "",
            date: transactionDate,
            amount: parsedAmount
        };

        const updatedEntry = await Ledger.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedEntry) {
            return res.status(404).json({ 
                success: false,
                error: "Ledger entry not found" 
            });
        }

        res.status(200).json({ 
            success: true,
            message: "Ledger entry updated successfully", 
            data: updatedEntry 
        });

    } catch (error) {
        console.error("Error updating ledger entry:", error);
        res.status(500).json({ 
            success: false,
            error: "Internal Server Error", 
            message: error.message 
        });
    }
};

// Delete a ledger entry
const deleteLedger = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ 
                success: false,
                error: "Entry ID is required" 
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: "Invalid ID format"
            });
        }

        const deletedEntry = await Ledger.findByIdAndDelete(id);

        if (!deletedEntry) {
            return res.status(404).json({ 
                success: false,
                error: "Ledger entry not found" 
            });
        }

        res.status(200).json({ 
            success: true,
            message: "Ledger entry deleted successfully", 
            data: deletedEntry 
        });

    } catch (error) {
        console.error("Error deleting ledger entry:", error);
        res.status(500).json({ 
            success: false,
            error: "Internal Server Error", 
            message: error.message 
        });
    }
};

module.exports = { getLedger, addLedger, updateLedger, deleteLedger };