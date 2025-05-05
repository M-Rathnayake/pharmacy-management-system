const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const URL = process.env.MONGODB_URL;

// Remove problematic raw body logging middleware
// This was interfering with normal request processing

// Body parser middleware - simplified version
app.use(bodyParser.json({
    limit: '10mb',
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// CORS Configuration
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

// Database connection with improved options
const connectDB = async () => {
    try {
        await mongoose.connect(URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });
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

// Use Routes with proper error handling
const useRoute = (path, router) => {
    app.use(path, (req, res, next) => {
        try {
            router(req, res, next);
        } catch (err) {
            console.error(`Route ${path} error:`, err);
            res.status(500).json({ error: 'Internal route error' });
        }
    });
};

useRoute("/api/bankbook", bankBookRoutes);
useRoute("/api/balancesheets", balanceSheetRoutes);
useRoute("/api/Employee", employeeRoutes);
useRoute("/api/ledger", ledgerRoutes);
useRoute("/api/pettycash", pettyCashRoutes);
useRoute("/api/profitloss", profitLossRoutes);
useRoute("/api/salaries", salaryRoutes);
useRoute('/api/pdf', pdfRoutes);
useRoute('/api/financial-tips', financialTipsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        timestamp: new Date()
    });
});

// Catch-all for 404 errors
app.use((req, res) => {
    console.log(`404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Improved error handling middleware
app.use((err, req, res, next) => {
    console.error('Error stack:', err.stack);
    
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ 
            error: 'Invalid JSON payload',
            details: err.message
        });
    }
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation failed',
            details: err.errors
        });
    }
    
    if (err.name === 'MongoServerError') {
        return res.status(500).json({
            error: 'Database operation failed',
            details: err.message
        });
    }
    
    res.status(500).json({ 
        error: 'Internal server error',
        requestId: req.id,
        timestamp: new Date().toISOString()
    });
});

// Start server with proper cleanup handling
const startServer = async () => {
    try {
        await connectDB();
        
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port: ${PORT}`);
            console.log(`MongoDB connected: ${mongoose.connection.readyState === 1}`);
        });

        // Handle server shutdown gracefully
        process.on('SIGTERM', () => {
            console.log('SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                mongoose.connection.close(false, () => {
                    console.log('Server and MongoDB connection closed');
                    process.exit(0);
                });
            });
        });

        process.on('SIGINT', () => {
            console.log('SIGINT received. Shutting down gracefully...');
            server.close(() => {
                mongoose.connection.close(false, () => {
                    console.log('Server and MongoDB connection closed');
                    process.exit(0);
                });
            });
        });

    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();