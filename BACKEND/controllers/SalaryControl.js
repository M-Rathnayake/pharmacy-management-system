const Salary = require("../models/Salary");

// Add a new salary record
const addSalary = async (req, res) => {
    try {
        const { employee_id, month, basicSalary, overtime, epf_etf, net_salary, paymentStatus } = req.body;

        if (!employee_id || !month || !basicSalary || !net_salary) {
            return res.status(400).json({ error: "Missing required fields" });
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
        res.status(201).json({ message: "Salary record added successfully", data: savedSalary });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};

// Get all salary records
const getSalaries = async (req, res) => {
    try {
        const salaries = await Salary.find().populate("employee_id", "name position"); // Fetch employee details
        res.status(200).json(salaries);
    } catch (error) {
        res.status(500).json({ message: "Error fetching salary records", error });
    }
};

// Update a salary record
const updateSalary = async (req, res) => {
    try {
        const { salary_id } = req.params;
        const { basicSalary, overtime, epf_etf, net_salary, paymentStatus } = req.body;

        if (!basicSalary || !net_salary) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const updatedSalary = await Salary.findByIdAndUpdate(
            salary_id,
            { basicSalary, overtime, epf_etf, net_salary, paymentStatus },
            { new: true, runValidators: true }
        );

        if (!updatedSalary) {
            return res.status(404).json({ error: "Salary record not found" });
        }

        res.status(200).json({ message: "Salary updated successfully", data: updatedSalary });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};

// Delete a salary record
const deleteSalary = async (req, res) => {
    try {
        const { salary_id } = req.params;

        const deletedSalary = await Salary.findByIdAndDelete(salary_id);

        if (!deletedSalary) {
            return res.status(404).json({ error: "Salary record not found" });
        }

        res.status(200).json({ message: "Salary record deleted successfully", data: deletedSalary });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
};

module.exports = { addSalary, getSalaries, updateSalary, deleteSalary };
