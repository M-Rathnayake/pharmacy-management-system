const Salary = require("../models/Salary");
const Employee = require("../models/Employee");
const mongoose = require("mongoose");

// Get all salary records
const getSalaries = async (req, res) => {
    try {
        console.log('[Salary] Fetching all salary records');
        const salaries = await Salary.find()
            .sort({ month: -1 });
        
        // Get employee details for each salary record
        const salariesWithDetails = await Promise.all(
            salaries.map(async (salary) => {
                // Find employee by employee_id (string) instead of _id
                const employee = await Employee.findOne({ employee_id: salary.employee_id });
                return {
                    ...salary.toObject(),
                    employeeDetails: employee ? {
                        firstName: employee.firstName,
                        lastName: employee.lastName,
                        position: employee.position,
                        department: employee.department
                    } : null
                };
            })
        );
        
        console.log(`[Salary] Found ${salariesWithDetails.length} salary records`);
        res.status(200).json(salariesWithDetails);
    } catch (error) {
        console.error('[Salary] Error fetching salaries:', error);
        res.status(500).json({ 
            error: 'Failed to fetch salary records',
            details: error.message 
        });
    }
};

// Add a new salary record
const addSalary = async (req, res) => {
    try {
        console.log('[Salary] Adding new salary record:', req.body);
        
        const { employee_id, month, basicSalary, overtime, epf_etf, net_salary, paymentStatus } = req.body;

        // Validate required fields
        if (!employee_id || !month || !basicSalary || !net_salary) {
            console.error('[Salary] Missing required fields');
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['employee_id', 'month', 'basicSalary', 'net_salary']
            });
        }

        // Check if employee exists by employee_id (string)
        const employee = await Employee.findOne({ employee_id: employee_id });
        if (!employee) {
            console.error('[Salary] Employee not found:', employee_id);
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Check for existing salary record for the same month
        const existingSalary = await Salary.findOne({ 
            employee_id, 
            month 
        });

        if (existingSalary) {
            console.error('[Salary] Salary record already exists for this month');
            return res.status(400).json({ 
                error: 'Salary record already exists for this month' 
            });
        }

        const newSalary = new Salary({
            employee_id,
            month,
            basicSalary,
            overtime: overtime || 0,
            epf_etf: epf_etf || 0,
            net_salary,
            paymentStatus: paymentStatus || 'Pending'
        });

        const savedSalary = await newSalary.save();
        console.log('[Salary] New salary record added:', savedSalary._id);
        
        // Get employee details for the response
        const employeeDetails = {
            firstName: employee.firstName,
            lastName: employee.lastName,
            position: employee.position,
            department: employee.department
        };
        
        res.status(201).json({
            ...savedSalary.toObject(),
            employeeDetails
        });
    } catch (error) {
        console.error('[Salary] Error adding salary:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                error: 'Validation failed',
                details: error.message 
            });
        }
        res.status(500).json({ 
            error: 'Failed to add salary record',
            details: error.message 
        });
    }
};

// Update a salary record
const updateSalary = async (req, res) => {
    try {
        console.log('[Salary] Updating salary record:', req.params.id);
        console.log('[Salary] Update data:', req.body);

        const { employee_id, month, basicSalary, overtime, epf_etf, net_salary, paymentStatus } = req.body;

        // Validate required fields
        if (!employee_id || !month || !basicSalary || !net_salary) {
            console.error('[Salary] Missing required fields');
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['employee_id', 'month', 'basicSalary', 'net_salary']
            });
        }

        // Check if employee exists by employee_id (string)
        const employee = await Employee.findOne({ employee_id: employee_id });
        if (!employee) {
            console.error('[Salary] Employee not found:', employee_id);
            return res.status(404).json({ error: 'Employee not found' });
        }

        const updatedSalary = await Salary.findByIdAndUpdate(
            req.params.id,
            {
                employee_id,
                month,
                basicSalary,
                overtime: overtime || 0,
                epf_etf: epf_etf || 0,
                net_salary,
                paymentStatus: paymentStatus || 'Pending'
            },
            { new: true, runValidators: true }
        );

        if (!updatedSalary) {
            console.error('[Salary] Salary record not found:', req.params.id);
            return res.status(404).json({ error: 'Salary record not found' });
        }

        // Get employee details for the response
        const employeeDetails = {
            firstName: employee.firstName,
            lastName: employee.lastName,
            position: employee.position,
            department: employee.department
        };

        console.log('[Salary] Salary record updated:', updatedSalary._id);
        res.status(200).json({
            ...updatedSalary.toObject(),
            employeeDetails
        });
    } catch (error) {
        console.error('[Salary] Error updating salary:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                error: 'Validation failed',
                details: error.message 
            });
        }
        res.status(500).json({ 
            error: 'Failed to update salary record',
            details: error.message 
        });
    }
};

// Delete a salary record
const deleteSalary = async (req, res) => {
    try {
        console.log('[Salary] Deleting salary record:', req.params.id);
        
        const deletedSalary = await Salary.findByIdAndDelete(req.params.id);
        
        if (!deletedSalary) {
            console.error('[Salary] Salary record not found:', req.params.id);
            return res.status(404).json({ error: 'Salary record not found' });
        }

        console.log('[Salary] Salary record deleted:', req.params.id);
        res.status(200).json({ message: 'Salary record deleted successfully' });
    } catch (error) {
        console.error('[Salary] Error deleting salary:', error);
        res.status(500).json({ 
            error: 'Failed to delete salary record',
            details: error.message 
        });
    }
};

module.exports = {
    getSalaries,
    addSalary,
    updateSalary,
    deleteSalary
};
