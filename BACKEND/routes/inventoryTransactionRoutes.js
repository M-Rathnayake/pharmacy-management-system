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
        const transactions = await Transaction.find().populate("medicineId", "name barcode");
        res.status(200).json({
            success: true,
            data: transactions
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
        const transactions = await Transaction.find({ medicineId: req.params.medicineId })
            .populate("medicineId", "name barcode");
            
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