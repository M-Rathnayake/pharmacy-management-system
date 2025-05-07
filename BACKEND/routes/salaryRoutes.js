const express = require("express");
const router = express.Router();
const { getSalaries, addSalary, updateSalary, deleteSalary } = require("../controllers/salaryControl");

// Debug middleware for all salary routes
router.use((req, res, next) => {
    console.log(`[Salary Routes] ${req.method} ${req.originalUrl}`);
    console.log('Request Body:', req.body);
    console.log('Request Params:', req.params);
    next();
});

// Get all salary records
router.get("/", (req, res, next) => {
    console.log('[Salary Routes] GET / - Fetching all salaries');
    getSalaries(req, res, next);
});

// Add a new salary record
router.post("/", (req, res, next) => {
    console.log('[Salary Routes] POST / - Adding new salary');
    console.log('Request Body:', req.body);
    addSalary(req, res, next);
});

// Update a salary record
router.put("/:id", (req, res, next) => {
    console.log('[Salary Routes] PUT /:id - Updating salary');
    console.log('Salary ID:', req.params.id);
    console.log('Request Body:', req.body);
    updateSalary(req, res, next);
});

// Delete a salary record
router.delete("/:id", (req, res, next) => {
    console.log('[Salary Routes] DELETE /:id - Deleting salary');
    console.log('Salary ID:', req.params.id);
    deleteSalary(req, res, next);
});

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
