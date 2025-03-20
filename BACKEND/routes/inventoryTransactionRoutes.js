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
        const medicine = await Transaction.find({medicineId: req.params.medicineId});
        if(!medicine){
            return res.status(404).json({
                success: false,
                error: "Medicine not found"
            });
        }
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
        const medicine = await Transaction.find({medicineId: req.params.medicineId});
        if(!medicine){
            return res.status(404).json({
                success: false,
                error: "Medicine not found"
            });
        }
        const transaction = await Transaction.find().populate("medicineId", "name");
        res.status(200).json({
            success: true,
            medicine: medicine.name,
            data: transaction
        });
    }catch(err){
        res.status(500).json({ 
            success: false,
            error: "Server error" 
        });
    }
});

module.exports = router;