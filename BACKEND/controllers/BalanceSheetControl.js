const mongoose = require('mongoose');
const BalanceSheet = require("../models/BalanceSheet"); // Ensure the model is imported

const addBalance = async (req, res) => {
  try {
      const { periods, assets, equity, liabilities } = req.body;

      if (!periods || assets === undefined || equity === undefined || liabilities === undefined) {
          return res.status(400).json({ error: "Missing required fields" });
      }

      // Make sure b_id is included in the new BalanceSheet entry
      const newEntry = new BalanceSheet({
          b_id: defaultStateId, // Ensure b_id is always included
          periods,
          assets,
          equity,
          liabilities,
          created_time: new Date()
      });

      // Save to MongoDB
      const savedBalanceSheet = await newEntry.save();
      res.status(201).json({ message: "Data inserted successfully", data: savedBalanceSheet });

  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
};


// Get all BalanceSheet records
const getBalance = async (req, res) => {
    try {
        const data = await BalanceSheet.find(); // Fetch all records using the BalanceSheet Mongoose model
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching BalanceSheet data", error });
    }
};

// Update BalanceSheet entry by ID
const updateBalance = async (req, res) => {
    try {
        const { id } = req.params;  // Extract id from request parameters
        const { periods, assets, equity, liabilities } = req.body;

        if (!periods || assets === undefined || equity === undefined || liabilities === undefined) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Find and update the record using id
        const updatedEntry = await BalanceSheet.findByIdAndUpdate(
            id,
            { periods, assets, equity, liabilities },
            { new: true, runValidators: true }
        );

        if (!updatedEntry) {
            return res.status(404).json({ error: "Record not found" });
        }

        res.status(200).json({ message: "Record updated successfully", data: updatedEntry });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};

// Delete a BalanceSheet record by ID
const deleteBalance = async (req, res) => {
    try {
        const { id } = req.params; // Extract id from request parameters

        if (!id) {
            return res.status(400).json({ error: "ID is required" });
        }

        // Find and delete the record by id
        const deletedEntry = await BalanceSheet.findByIdAndDelete(id);

        if (!deletedEntry) {
            return res.status(404).json({ error: "Record not found" });
        }

        res.status(200).json({ message: "BalanceSheet record deleted successfully", data: deletedEntry });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};

module.exports = { getBalance, addBalance, updateBalance, deleteBalance };
