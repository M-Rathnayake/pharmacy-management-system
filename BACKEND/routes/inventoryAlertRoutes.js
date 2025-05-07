const express = require("express");
const router = express.Router();
const Alert = require("../models/InventoryAlert");
const Medicine = require("../models/Medicine");

// getting all alerts (both resolved and unresolved)
router.get("/", async (req, res) => {
    try{
        const { status } = req.query; // status can be 'all', 'resolved', or 'unresolved'
        
        let query = {};
        if (status === 'resolved') {
            query.resolved = true;
        } else if (status === 'unresolved') {
            query.resolved = false;
        }
        
        const alerts = await Alert.find(query)
            .populate({ 
                path: "medicineId", 
                select: "name stock threshold expiryDate"
            })
            .sort({ createdAt: -1 }); // newest first
        
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
        const alert = await Alert.findById(req.params.id);
        
        if(!alert){
            return res.status(404).json({
                success: false,
                error: "Alert not found"
            });
        }

        // Check if alert is already resolved
        if(alert.resolved) {
            return res.status(400).json({
                success: false,
                error: "Alert is already resolved"
            });
        }

        // Update alert status
        alert.resolved = true;
        await alert.save();

        // If it's a low stock alert, update the medicine's lowStockSent flag
        if(alert.type === 'low-stock') {
            await Medicine.findByIdAndUpdate(
                alert.medicineId,
                { 'alerts.lowStockSent': false }
            );
        }

        res.status(200).json({
            success: true,
            message: "Alert resolved successfully",
            data: alert
        });

    }catch(error){
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

// getting alert history for a specific medicine
router.get("/medicine/:medicineId", async (req, res) => {
    try{
        const alerts = await Alert.find({ 
            medicineId: req.params.medicineId 
        })
        .populate({ 
            path: "medicineId", 
            select: "name stock threshold expiryDate"
        })
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: alerts.length,
            data: alerts
        });
    }catch(error){
        res.status(500).json({
            success: false,
            error: "Failed to fetch medicine alerts"
        });
    }
});

module.exports = router;