const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;
const URL = process.env.MONGODB_URL;

// Middleware to log raw request body for debugging
app.use((req, res, next) => {
    let rawData = '';
    req.on('data', chunk => { rawData += chunk; });
    req.on('end', () => {
        console.log('Raw request body:', rawData);
        const buffer = Buffer.from(rawData);
        req.removeAllListeners('data');
        req.removeAllListeners('end');
        req.push(buffer);
        req.push(null);
        next();
    });
});

// Body parser middleware
app.use(bodyParser.json({
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf.toString());
        } catch (e) {
            console.error('JSON parse error:', e.message, 'Raw body:', buf.toString());
            throw e;
        }
    }
}));
app.use(bodyParser.urlencoded({ extended: true }));

// CORS Configuration
app.use(cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true
}));

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(URL);
        console.log("MongoDB Connection Successful!");
    } catch (err) {
        console.error("MongoDB Connection Failed!", err);
        process.exit(1);
    }
};

// Import Routes
const bankBookRoutes = require("./routes/bankBookRoutes");
const balanceSheetRoutes = require("./routes/balanceSheetRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const ledgerRoutes = require("./routes/ledgerRoutes");
const pettyCashRoutes = require("./routes/pettyCashRoutes");
const profitLossRoutes = require("./routes/profitLossRoutes");
const salaryRoutes = require("./routes/salaryRoutes");
const pdfRoutes = require('./routes/pdfRoutes');
const financialTipsRoutes = require('./routes/financialTipsRoutes');
// Use Routes
app.use("/api/bankbook", bankBookRoutes);
app.use("/api/balancesheets", balanceSheetRoutes);
app.use("/api/Employee", employeeRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/pettycash", pettyCashRoutes);
app.use("/api/profitloss", profitLossRoutes);
app.use("/api/salaries", salaryRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/financial-tips', financialTipsRoutes);

// Catch-all for 404 errors
app.use((req, res) => {
    console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Bad JSON error:', err.message, 'Raw body:', req.body);
        return res.status(400).json({ error: 'Invalid JSON payload' });
    }
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server with port conflict handling
const startServer = async () => {
    try {
        await connectDB();
        
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port: ${PORT}`);
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use. Trying alternative port...`);
                const newPort = PORT + 1;
                app.listen(newPort, () => {
                    console.log(`Server is running on alternative port: ${newPort}`);
                });
            } else {
                console.error('Server error:', err);
            }
        });

    } catch (err) {
        console.error('Failed to start server:', err);
    }
};

startServer();