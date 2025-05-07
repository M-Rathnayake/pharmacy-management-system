const express = require("express");
const router = express.Router();
const Transaction = require("../models/InventoryTransaction");
const Medicine = require("../models/Medicine");

router.post("/", async (req, res) => {
    try{
        const transaction = await Transaction.create(req.body);
        res.status(201).json({
            success: true,
            message: "Transaction processed automatically",
            previousStock: transaction.previousStock,
            newStock: transaction.newStock,
            transaction
        });
    }catch(error){
        res.status(400).json({ 
            success: false,
            error: error.message
        });
    }
});

// getting all the transactions
router.get("/", async (req, res) => {
    try{
        const transactions = await Transaction.find()
            .populate({
                path: "medicineId",
                select: "name barcode",
                options: { lean: true }
            })
            .sort({ timestamp: -1 }); // Sort by most recent first

        // Handle cases where medicine might have been deleted
        const enhancedTransactions = transactions.map(transaction => {
            const transactionObj = transaction.toObject();
            if (!transactionObj.medicineId) {
                transactionObj.medicineId = {
                    name: "Deleted Medicine",
                    barcode: "N/A"
                };
            }
            return transactionObj;
        });

        res.status(200).json({
            success: true,
            data: enhancedTransactions
        });
    }catch(error){
        res.status(500).json({ 
            success: false,
            error: "Failed to fetch transactions" 
        });
    }
});

// getting transaction for a specific medicine
router.get("/medicine/:medicineId", async (req, res) => {
    try{
        // First check if medicine exists
        const medicine = await Medicine.findById(req.params.medicineId);
        if (!medicine) {
            return res.status(404).json({
                success: false,
                error: "Medicine not found"
            });
        }

        const transactions = await Transaction.find({ medicineId: req.params.medicineId })
            .populate({
                path: "medicineId",
                select: "name barcode",
                options: { lean: true }
            })
            .sort({ timestamp: -1 }); // Sort by most recent first
            
        if(!transactions || transactions.length === 0){
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        res.status(200).json({
            success: true,
            data: transactions
        });
    }catch(err){
        res.status(500).json({ 
            success: false,
            error: "Server error" 
        });
    }
});

module.exports = router;