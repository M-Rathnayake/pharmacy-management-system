const mongoose = require('mongoose');
const PettyCash = require("../models/PettyCash"); // Ensure the model is correctly imported

// Add a new petty cash entry
const addPettyCash = async (req, res) => {
    try {
        const { petty_id, description, receipt_no, transaction_type, date, amount } = req.body;

        if (!petty_id || !description || !receipt_no || !transaction_type || !date || amount === undefined) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newEntry = new PettyCash({
            petty_id,
            description,
            receipt_no,
            transaction_type,
            date,
            amount
        });

        // Save to MongoDB
        const savedPettyCash = await newEntry.save();
        res.status(201).json({ message: "Petty cash entry added successfully", data: savedPettyCash });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};

// Get all petty cash records
const getPettyCash = async (req, res) => {
    try {
        const data = await PettyCash.find();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching petty cash data", error });
    }
};

// Update a petty cash entry by petty_id
const updatePettyCash = async (req, res) => {
    try {
        const { petty_id } = req.params;
        const { description, receipt_no, transaction_type, date, amount } = req.body;

        if (!description || !receipt_no || !transaction_type || !date || amount === undefined) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Find and update the record
        const updatedEntry = await PettyCash.findOneAndUpdate(
            { petty_id },
            { description, receipt_no, transaction_type, date, amount },
            { new: true, runValidators: true }
        );

        if (!updatedEntry) {
            return res.status(404).json({ error: "Record not found" });
        }

        res.status(200).json({ message: "Petty cash entry updated successfully", data: updatedEntry });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};

// Delete a petty cash entry by petty_id
const deletePettyCash = async (req, res) => {
    try {
        const { petty_id } = req.params;

        if (!petty_id) {
            return res.status(400).json({ error: "petty_id is required" });
        }

        const deletedEntry = await PettyCash.findOneAndDelete({ petty_id });

        if (!deletedEntry) {
            return res.status(404).json({ error: "Record not found" });
        }

        res.status(200).json({ message: "Petty cash entry deleted successfully", data: deletedEntry });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};

module.exports = { getPettyCash, addPettyCash, updatePettyCash, deletePettyCash };
