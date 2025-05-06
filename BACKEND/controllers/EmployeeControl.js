const Employee = require("../models/Employee");

// Get all employees with optional filters
const getEmployees = async (req, res) => {
    try {
        const { department, status, position } = req.query;
        let query = {};

        // Apply filters if provided
        if (department) query.department = department;
        if (status) query.status = status;
        if (position) query.position = position;

        const employees = await Employee.find(query)
            .select('employee_id firstName lastName email phone position department status')
            .sort({ firstName: 1 });
            
        res.status(200).json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Error fetching employees' });
    }
};

// Get employee by ID
const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id)
            .select('employee_id firstName lastName email phone position department status');
            
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.status(200).json(employee);
    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).json({ error: 'Error fetching employee' });
    }
};

// Get employees by department
const getEmployeesByDepartment = async (req, res) => {
    try {
        const { department } = req.params;
        const employees = await Employee.find({ department })
            .select('employee_id firstName lastName email phone position status')
            .sort({ firstName: 1 });
            
        res.status(200).json(employees);
    } catch (error) {
        console.error('Error fetching employees by department:', error);
        res.status(500).json({ error: 'Error fetching employees by department' });
    }
};

// Search employees
const searchEmployees = async (req, res) => {
    try {
        const { query } = req.query;
        const searchRegex = new RegExp(query, 'i');

        const employees = await Employee.find({
            $or: [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { email: searchRegex },
                { position: searchRegex },
                { department: searchRegex }
            ]
        })
        .select('employee_id firstName lastName email phone position department status')
        .sort({ firstName: 1 });

        res.status(200).json(employees);
    } catch (error) {
        console.error('Error searching employees:', error);
        res.status(500).json({ error: 'Error searching employees' });
    }
};

module.exports = {
    getEmployees,
    getEmployeeById,
    getEmployeesByDepartment,
    searchEmployees
};
