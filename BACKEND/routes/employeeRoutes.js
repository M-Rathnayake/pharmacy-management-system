const express = require('express');
const router = express.Router();
const {
    getEmployees,
    getEmployeeById,
    getEmployeesByDepartment,
    searchEmployees
} = require('../controllers/EmployeeControl');

// Get all employees with optional filters
router.get('/', getEmployees);

// Get employee by ID
router.get('/:id', getEmployeeById);

// Get employees by department
router.get('/department/:department', getEmployeesByDepartment);

// Search employees
router.get('/search', searchEmployees);

// Error handling middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = router;