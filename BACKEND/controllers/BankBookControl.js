const mongoose = require('mongoose');
const BankBook = require('../models/BankBook'); // Ensure the model is imported

// Add a new bank book entry
const addBankBook = async (req, res) => {
  try {
    const { bankbook_id, date, description, voucher_no, deposits, withdrawal, balance } = req.body;

    // Validate required fields
    if (!bankbook_id || !date || !description || balance === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create a new BankBook entry
    const newEntry = new BankBook({
      bankbook_id,
      date,
      description,
      voucher_no,
      deposits,
      withdrawal,
      balance,
    });

    // Save to MongoDB
    const savedBankBook = await newEntry.save();
    res.status(201).json({ message: "BankBook entry added successfully", data: savedBankBook });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
};

// Get all bank book entries
const getBankBooks = async (req, res) => {
  try {
    const data = await BankBook.find(); // Fetch all records using the BankBook model
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bank book data", error });
  }
};

// Update a bank book entry by bankbook_id
const updateBankBook = async (req, res) => {
  try {
    const { bankbook_id } = req.params; // Extract bankbook_id from request parameters
    const { date, description, voucher_no, deposits, withdrawal, balance } = req.body;

    // Validate required fields
    if (!date || !description || balance === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find and update the record using bankbook_id
    const updatedEntry = await BankBook.findOneAndUpdate(
      { bankbook_id },
      { date, description, voucher_no, deposits, withdrawal, balance },
      { new: true, runValidators: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.status(200).json({ message: "Bank book entry updated successfully", data: updatedEntry });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
};

// Delete a bank book entry by bankbook_id
const deleteBankBook = async (req, res) => {
  try {
    const { bankbook_id } = req.params; // Extract bankbook_id from request parameters

    if (!bankbook_id) {
      return res.status(400).json({ error: "bankbook_id is required" });
    }

    // Find and delete the record by bankbook_id
    const deletedEntry = await BankBook.findOneAndDelete({ bankbook_id });

    if (!deletedEntry) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.status(200).json({ message: "Bank book entry deleted successfully", data: deletedEntry });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
};

module.exports = { addBankBook, getBankBooks, updateBankBook, deleteBankBook };
