const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const URL = process.env.MONGODB_URL; // Should be mongodb://localhost:27017/profitloss_db

// Add detailed request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);
    next();
});

// Body parser middleware
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

// Log available routes
console.log('\n=== Available API Routes ===');
console.log('GET    /api/salaries');
console.log('POST   /api/salaries');
console.log('PUT    /api/salaries/:id');
console.log('DELETE /api/salaries/:id');
console.log('GET    /api/Employee');
console.log('GET    /api/ledger');
console.log('GET    /api/bankbook');
console.log('GET    /api/balancesheets');
console.log('GET    /api/pettycash');
console.log('GET    /api/profitloss');
console.log('GET    /api/pdf');
console.log('GET    /api/financial-tips');
console.log('========================\n');

// Mount Routes with logging
app.use("/api/salaries", (req, res, next) => {
    console.log(`[Route] Salary route accessed: ${req.method} ${req.originalUrl}`);
    next();
}, salaryRoutes);

app.use("/api/Employee", employeeRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/bankbook", bankBookRoutes);
app.use("/api/balancesheets", balanceSheetRoutes);
app.use("/api/pettycash", pettyCashRoutes);
app.use("/api/profitloss", profitLossRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/financial-tips', financialTipsRoutes);

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
    console.log(`[404] Not Found: ${req.method} ${req.originalUrl}`);
    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method,
        availableRoutes: [
            '/api/salaries',
            '/api/Employee',
            '/api/ledger',
            '/api/bankbook',
            '/api/balancesheets',
            '/api/pettycash',
            '/api/profitloss',
            '/api/pdf',
            '/api/financial-tips'
        ]
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('[Error]', err.stack);
    console.error('[Error Details]', {
        message: err.message,
        name: err.name,
        path: req.originalUrl,
        method: req.method,
        headers: req.headers,
        body: req.body
    });

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
        message: err.message,
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Start server with proper cleanup handling
const startServer = async () => {
    try {
        await connectDB();

        const server = app.listen(PORT, () => {
            console.log(`[Server] Running on port: ${PORT}`);
            console.log(`[Database] Connected: ${mongoose.connection.readyState === 1}`);
        });

        // Handle server shutdown gracefully
        process.on('SIGTERM', () => {
            console.log('[Server] SIGTERM received. Shutting down gracefully...');
            server.close(() => {
                mongoose.connection.close(false, () => {
                    console.log('[Server] Server and MongoDB connection closed');
                    process.exit(0);
                });
            });
        });

        process.on('SIGINT', () => {
            console.log('[Server] SIGINT received. Shutting down gracefully...');
            server.close(() => {
                mongoose.connection.close(false, () => {
                    console.log('[Server] Server and MongoDB connection closed');
                    process.exit(0);
                });
            });
        });

    } catch (err) {
        console.error('[Server] Failed to start:', err);
        process.exit(1);
    }
};

startServer();