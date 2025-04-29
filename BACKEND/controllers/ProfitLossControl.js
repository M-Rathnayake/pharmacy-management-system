const ProfitLoss = require("../models/ProfitLoss"); 

// Controller functions
const getProfitLoss = async (req, res) => {
    try {
        const data = await ProfitLoss.find(); // Fetch all profit/loss records
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving profit/loss data", error });
    }
};

const addProfitLoss = async (req, res) => {
    const { date, revenue, expenses, profit } = req.body;

    try {
        const newEntry = new ProfitLoss({ date, revenue, expenses, profit });
        await newEntry.save();
        res.status(201).json({ message: "Profit/Loss entry added successfully", newEntry });
    } catch (error) {
        res.status(500).json({ message: "Error adding profit/loss entry", error });
    }
};

const updateProfitLoss = async (req, res) => {
    const { id } = req.params;
    const { revenue, expenses, profit } = req.body;

    try {
        const updatedEntry = await ProfitLoss.findByIdAndUpdate(
            id,
            { revenue, expenses, profit },
            { new: true }
        );
        if (!updatedEntry) return res.status(404).json({ message: "Entry not found" });

        res.status(200).json({ message: "Profit/Loss entry updated", updatedEntry });
    } catch (error) {
        res.status(500).json({ message: "Error updating profit/loss entry", error });
    }
};

const deleteProfitLoss = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedEntry = await ProfitLoss.findByIdAndDelete(id);
        if (!deletedEntry) return res.status(404).json({ message: "Entry not found" });

        res.status(200).json({ message: "Profit/Loss entry deleted", deletedEntry });
    } catch (error) {
        res.status(500).json({ message: "Error deleting profit/loss entry", error });
    }
};

module.exports = { getProfitLoss, addProfitLoss, updateProfitLoss, deleteProfitLoss };
