const Employee = require("../models/Employee");

const getEmployee = async (req, res) => {
  try {
    const transactions = await Employee.find();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addEmployee = async (req, res) => {
  try {
    const {  employee_id,firstName,lastName,email,phone,position,hireDate,basicSalary } = req.body;
    const newTransaction = new Employee({employee_id,firstName,lastName,email,phone,position,hireDate,basicSalary});
    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getEmployee, addEmployee };
