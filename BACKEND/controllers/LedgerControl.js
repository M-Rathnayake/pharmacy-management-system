const mongoose = require('mongoose');
const Ledger = require("../models/ledger"); // Ensure the model is correctly imported

// Add a new ledger entry
const addLedger = async (req, res) => {
    try {
        const { account_name, transaction_type, description, date, amount,created_At } = req.body;

        if (!account_name || !transaction_type || !description || !date || !amount || !created_At) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newEntry = new Ledger({
            transaction_id: new mongoose.Types.ObjectId(), // Generate a new ObjectId
            account_name,
            transaction_type,
            description,
            date,
            amount,
            created_At : new Date()
        });

        // Save to MongoDB
        const savedLedger = await newEntry.save();
        res.status(201).json({ message: "Ledger entry added successfully", data: savedLedger });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};

// Get all ledger records
const getLedger = async (req, res) => {
    try {
        const data = await Ledger.find();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching ledger data", error });
    }
};

// Update a ledger entry by transaction_id
const updateLedger = async (req, res) => {
    try {
        const { transaction_id } = req.params;
        const { account_name, transaction_type, description, date, amount, reference_id, created_At } = req.body;

        if (!account_name || !transaction_type || !description || !date || !amount || !reference_id || !created_At) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Find and update the record
        const updatedEntry = await Ledger.findOneAndUpdate(
            { transaction_id },
            { account_name, transaction_type, description, date, amount, reference_id, created_At },
            { new: true, runValidators: true }
        );

        if (!updatedEntry) {
            return res.status(404).json({ error: "Record not found" });
        }

        res.status(200).json({ message: "Ledger entry updated successfully", data: updatedEntry });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};

// Delete a ledger entry by transaction_id
const deleteLedger = async (req, res) => {
    try {
        const { transaction_id } = req.params;

        if (!transaction_id) {
            return res.status(400).json({ error: "transaction_id is required" });
        }

        const deletedEntry = await Ledger.findOneAndDelete({ transaction_id });

        if (!deletedEntry) {
            return res.status(404).json({ error: "Record not found" });
        }

        res.status(200).json({ message: "Ledger entry deleted successfully", data: deletedEntry });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};

module.exports = { getLedger, addLedger, updateLedger, deleteLedger };
