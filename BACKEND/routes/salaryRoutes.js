const express = require("express");
const router = express.Router();
const salaryController = require("../controllers/SalaryControl");

// Debug middleware for all salary routes
router.use((req, res, next) => {
    console.log(`[Salary Routes] ${req.method} ${req.originalUrl}`);
    console.log('Request Body:', req.body);
    console.log('Request Params:', req.params);
    next();
});

// Get all salary records
router.get("/", salaryController.getSalaries);

// Create a new salary record
router.post("/", salaryController.addSalary);

// Update a salary record
router.put("/:id", salaryController.updateSalary);

// Delete a salary record
router.delete("/:id", salaryController.deleteSalary);

// Error handling middleware
router.use((err, req, res, next) => {
    console.error('[Salary Routes] Error:', err);
    console.error('Error Details:', {
        message: err.message,
        stack: err.stack,
        path: req.originalUrl,
        method: req.method,
        body: req.body,
        params: req.params
    });
    res.status(500).json({
        error: 'Internal server error in salary routes',
        details: err.message
    });
});

module.exports = router;
