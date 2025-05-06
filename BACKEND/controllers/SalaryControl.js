const Salary = require("../models/Salary");
const Employee = require("../models/Employee");

// Get all salary records
const getSalaries = async (req, res) => {
    try {
        console.log('Fetching all salary records...');
        const salaries = await Salary.find()
            .sort({ month: -1 }); // Sort by month in descending order

        // Get employee details for each salary record
        const salariesWithEmployeeDetails = await Promise.all(
            salaries.map(async (salary) => {
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

        console.log(`Found ${salariesWithEmployeeDetails.length} salary records`);
        res.status(200).json(salariesWithEmployeeDetails);
    } catch (error) {
        console.error("Error fetching salaries:", error);
        res.status(500).json({ error: "Error fetching salary records", message: error.message });
    }
};

// Add a new salary record
const addSalary = async (req, res) => {
    try {
        console.log('Adding new salary record:', req.body);
        const { employee_id, month, basicSalary, overtime, epf_etf, net_salary, paymentStatus } = req.body;

        // Validate required fields
        if (!employee_id || !month || !basicSalary || !net_salary) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Check if employee exists
        const employee = await Employee.findOne({ employee_id });
        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        // Check if salary record already exists for this employee and month
        const existingSalary = await Salary.findOne({ employee_id, month });
        if (existingSalary) {
            return res.status(400).json({ error: "Salary record already exists for this employee and month" });
        }

        const newSalary = new Salary({
            employee_id,
            month,
            basicSalary,
            overtime: overtime || 0,
            epf_etf: epf_etf || 0,
            net_salary,
            paymentStatus: paymentStatus || "Pending"
        });

        const savedSalary = await newSalary.save();
        console.log('Salary record added successfully:', savedSalary);
        res.status(201).json(savedSalary);

    } catch (error) {
        console.error("Error adding salary:", error);
        res.status(500).json({ error: "Error adding salary record", message: error.message });
    }
};

// Update a salary record
const updateSalary = async (req, res) => {
    try {
        console.log('Updating salary record:', req.params.id, req.body);
        const { id } = req.params;
        const { basicSalary, overtime, epf_etf, net_salary, paymentStatus } = req.body;

        if (!basicSalary || !net_salary) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const updatedSalary = await Salary.findByIdAndUpdate(
            id,
            { 
                basicSalary, 
                overtime: overtime || 0, 
                epf_etf: epf_etf || 0, 
                net_salary, 
                paymentStatus: paymentStatus || "Pending" 
            },
            { new: true, runValidators: true }
        );

        if (!updatedSalary) {
            return res.status(404).json({ error: "Salary record not found" });
        }

        console.log('Salary record updated successfully:', updatedSalary);
        res.status(200).json(updatedSalary);

    } catch (error) {
        console.error("Error updating salary:", error);
        res.status(500).json({ error: "Error updating salary record", message: error.message });
    }
};

// Delete a salary record
const deleteSalary = async (req, res) => {
    try {
        console.log('Deleting salary record:', req.params.id);
        const { id } = req.params;

        const deletedSalary = await Salary.findByIdAndDelete(id);

        if (!deletedSalary) {
            return res.status(404).json({ error: "Salary record not found" });
        }

        console.log('Salary record deleted successfully:', deletedSalary);
        res.status(200).json({ message: "Salary record deleted successfully" });

    } catch (error) {
        console.error("Error deleting salary:", error);
        res.status(500).json({ error: "Error deleting salary record", message: error.message });
    }
};

module.exports = { addSalary, getSalaries, updateSalary, deleteSalary };
