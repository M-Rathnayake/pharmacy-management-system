const express = require("express");
const router = express.Router();
const SalaryController = require("../controllers/salaryControl");

// Define Routes
router.post("/salaries", SalaryController.addSalary);  // Add a salary record
router.get("/salaries", SalaryController.getSalaries);  // Get all salary records
router.put("/salaries/:salary_id", SalaryController.updateSalary);  // Update a salary record
router.delete("/salaries/:salary_id", SalaryController.deleteSalary);  // Delete a salary record

module.exports = router;
