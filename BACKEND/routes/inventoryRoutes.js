const express = require("express");
const router = express.Router();
const Medicine = require("../models/Medicine");
const Transaction = require("../models/InventoryTransaction");

//create
router.post("/", async(req, res) => {
    try{
        const medicine = await Medicine.create(req.body);
        res.status(201).json(medicine);
    }catch(err){
        res.status(400).json({ error: err.message });
    }
});

//read all
router.get("/", async(req, res) => {
    try{
        const medicines = await Medicine.find();
        res.json(medicines);
    }catch(err){
        res.status(500).json({ error: "Server error" });
    }
});

//read one
router.get("/:id", async (req, res) => {
    try{
        const medicine = await Medicine.findById(req.params.id);
        if(!medicine){
            return res.status(404).json({ error: "Medicine not found" });
        }
        res.json(medicine);
    }catch(err){
        res.status(500).json({ error: "Inavalid ID" });
    }
});

//update
router.put("/:id", async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) {
            return res.status(404).json({ error: "Medicine not found" });
        }

        // Store old stock for transaction
        const oldStock = medicine.stock;
        
        // Update medicine
        const updatedMedicine = await Medicine.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );

        // If stock changed, create transaction
        if (oldStock !== req.body.stock) {
            const quantityDiff = req.body.stock - oldStock;
            const transactionType = quantityDiff > 0 ? 'restock' : 'adjustment';
            
            const transaction = new Transaction({
                medicineId: req.params.id,
                type: transactionType,
                quantity: Math.abs(quantityDiff),
                notes: `Manual stock ${transactionType} from ${oldStock} to ${req.body.stock}`,
                previousStock: oldStock,
                newStock: req.body.stock
            });
            
            await transaction.save();
            
            // Add transaction reference to medicine
            updatedMedicine.transaction.push(transaction._id);
            await updatedMedicine.save();
        }

        res.json(updatedMedicine);
    } catch (err) {
        console.error("Update error:", err);
        res.status(400).json({ error: err.message });
    }
});

//delete
router.delete("/:id", async (req, res) => {
    try{
        const medicine = await Medicine.findByIdAndDelete(req.params.id);
        if(!medicine){
            return res.status(404).json({ error: "Medicine not found" });
        }
        res.json({ message: "Medicine deleted successfully"});
    }catch(err){
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;

