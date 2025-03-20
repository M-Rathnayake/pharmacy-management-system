const express = require("express");
const mongoose =require("mongoose");
const bodyParser =require("body-parser");
const cors =require("cors");
const dotenv =require("dotenv");
const app = express();
require("dotenv").config();

const PORT= process.env.PORT || 8080;

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
})

connection.on("error", (err) => {
    console.error( "MongoDB connection Error:", err );
});

// handling inventory routes
const inventoryRoutes = require("./routes/inventoryRoutes");
app.use("/api/inventory", inventoryRoutes);

// handling inventory transaction routes
const inventoryTransactionRoutes = require("./routes/inventoryTransactionRoutes");
app.use("/api/inventoryTransactions", inventoryTransactionRoutes);

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

