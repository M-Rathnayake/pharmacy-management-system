const express = require("express");
const router = express.Router();
const Alert = require("../models/InventoryAlert");
const Medicine = require("../models/Medicine");

// getting all unresolved alerts 
router.get("/", async (req, res) => {
    try{
        const alerts = await Alert.find({ resolved: false })
        .populate({ path: "medicineId", select: "name stock threshold expiryDate"});
        
        res.status(200).json({
            success: true,
            count: alerts.length,
            data: alerts
        });
    }catch(error){
        res.status(500).json({
            success: false,
            error: "Failed to fetch alerts"
        });
    }
});

// resolving an alert
router.patch("/:id/resolve", async (req, res) => {
    try{
        const alert = await Alert.findByIdAndUpdate(
            req.params.id, 
            {resolved: true}, // marking as resolved
            {new: true}
        ); // updated alert

        if(!alert){
            return res.status(404).json({
                success: false,
                error: "Alert not found"
            });
        }

        res.status(200).json({
            success: true,
            data: alert
        });

    }catch(error){
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;