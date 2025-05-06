const express = require("express");
const router = express.Router();
const SalaryController = require("../controllers/salaryControl");

// Define Routes
router.get("/", SalaryController.getSalaries);  // Get all salary records
router.post("/", SalaryController.addSalary);  // Add a salary record
router.put("/:id", SalaryController.updateSalary);  // Update a salary record
router.delete("/:id", SalaryController.deleteSalary);  // Delete a salary record

// Error handling middleware
router.use((err, req, res, next) => {
    console.error('Salary route error:', err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: err.message 
    });
});

module.exports = router;
