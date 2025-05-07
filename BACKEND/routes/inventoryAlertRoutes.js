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

        // For low stock alerts, verify if the stock is still low before resolving
        if(alert.type === 'low-stock') {
            const medicine = await Medicine.findById(alert.medicineId);
            if (!medicine) {
                return res.status(404).json({
                    success: false,
                    error: "Medicine not found"
                });
            }

            // Only resolve if stock is now above threshold
            if (medicine.stock < medicine.threshold) {
                return res.status(400).json({
                    success: false,
                    error: "Cannot resolve alert while stock is still below threshold"
                });
            }
        }

        // Update alert status
        alert.resolved = true;
        await alert.save();

        // Update medicine alert flags based on alert type
        const updateFields = {};
        switch(alert.type) {
            case 'low-stock':
                updateFields['alerts.lowStockSent'] = false;
                break;
            case 'near-expiry':
            case 'expired':
                // For expiry alerts, we don't need to update any flags
                // as we now use the alert creation date to determine when to create new alerts
                break;
        }

        if (Object.keys(updateFields).length > 0) {
            await Medicine.findByIdAndUpdate(
                alert.medicineId,
                updateFields
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

// Add a new endpoint to sync alerts with current stock levels
router.post("/sync", async (req, res) => {
    try {
        // Get all unresolved low stock alerts
        const lowStockAlerts = await Alert.find({
            type: "low-stock",
            resolved: false
        }).populate('medicineId');

        let resolvedCount = 0;

        // Check each alert against current stock levels
        for (const alert of lowStockAlerts) {
            const medicine = alert.medicineId;
            if (medicine && medicine.stock >= medicine.threshold) {
                // Stock is now above threshold, resolve the alert
                alert.resolved = true;
                await alert.save();
                resolvedCount++;
            }
        }

        res.status(200).json({
            success: true,
            message: `Synchronized alerts. Resolved ${resolvedCount} alerts.`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Failed to synchronize alerts"
        });
    }
});

module.exports = router;