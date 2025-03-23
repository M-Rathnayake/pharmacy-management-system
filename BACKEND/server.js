const express = require("express");
const mongoose =require("mongoose");
const bodyParser =require("body-parser");
const cors =require("cors");
const dotenv =require("dotenv");
const cron = require('node-cron'); 
const Medicine = require("./models/Medicine");
const Alert = require("./models/InventoryAlert");
const app = express();
require("dotenv").config();

const PORT= process.env.PORT || 8080;

// configuring alert thresholds
const LOW_STOCK_THRESHOLD = 10;
const EXPIRY_WARNING_DAYS = 7;

app.use(cors());
app.use(bodyParser.json());

const URL = process.env.MONGODB_URL;

mongoose.connect(URL,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const connection = mongoose.connection;

connection.once("open", () =>{
    console.log("MongoDB Connection Successful!");

    // sheduling alert checks
    cron.schedule('0 8 * * *', async () => {
        try{
            // low stock check
            const lowStockMeds = await Medicine.find({
                $expr: { $lt: ["$stock", "$threshold"] },
                'alerts.lowStockSent': false
            });

            for (const med of lowStockMeds){
                try{
                    await Alert.create({
                        medicineId: med._id,
                        type: "low-stock",
                        message: `${med.name} stock is low (${med.stock} remaining)`
                    });
                    med.alerts.lowStockSent = true;
                    await med.save();
                }catch(error){
                    console.error(`Failed processing ${med._id}:`, error);
                }
            }

            // near-expiry check
            const expiryDateThreshold = new Date();
            expiryDateThreshold.setDate(expiryDateThreshold.getDate() + EXPIRY_WARNING_DAYS);

            const expiringMeds = await Medicine.find({
                expiryDate: { 
                    $exists: true,
                    $ne: null,
                    $lte: expiryDateThreshold,
                    $gte: new Date() 
                },
                'alerts.expirySent': false
            });

            for(const med of expiringMeds){
                try{
                    await Alert.create({
                        medicineId: med._id,
                        type: "near-expiry",
                        message: `${med.name} expires on ${med.expiryDate.toDateString()}`
                    });

                    med.alerts.expirySent = true;
                    await med.save();
                }catch(error){
                    console.error(`Failed expiry alert for ${med._id}:`, error)
                }
            }

            console.log(`[CRON] Generated ${lowStockMeds.length + expiringMeds.length} alerts`);

        }catch(error){
            console.error('Alert generation failed:', error);
        }
    });
});


connection.on("error", (err) => {
    console.error( "MongoDB connection Error:", err );
});

// handling medicine routes
const inventoryRoutes = require("./routes/inventoryRoutes");
app.use("/api/inventory", inventoryRoutes);

// handling inventory transaction routes
const inventoryTransactionRoutes = require("./routes/inventoryTransactionRoutes");
app.use("/api/inventoryTransactions", inventoryTransactionRoutes);

// handing inventory alert routes
const inventoryAlertRoutes = require("./routes/inventoryAlertRoutes");
app.use("/api/inventoryAlerts", inventoryAlertRoutes);

app.use((req, res) => {
    res.status(404).json({ error: "Endpoint not Found" });
});

// global error handler
app.use((err, req, res, next) => {
    console.error( "Server Error:", err.stack );
    res.status(500).json({ error: "Something went wrong!", message: err.message });
});

// server initialization
app.listen(PORT ,()=>{
    console.log(`Server is running on port number : ${PORT}`)
})

// unhandled rejections
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, " reason:", reason);
});

