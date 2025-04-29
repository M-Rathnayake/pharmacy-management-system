const express = require("express");
const router = express.Router();
const {  getEmployee, addEmployee } = require("../controllers/EmployeeControl");

// Define routes
router.get("/", getEmployee); // Fetch all bank transactions
router.post("/", addEmployee);    // Add a new bank transaction

module.exports = router;