import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  Table,
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadPDFButton from "./DownloadPDFButton";

const SalaryForm = () => {
  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState("");
  const [basicSalary, setBasicSalary] = useState("");
  const [overtime, setOvertime] = useState(0);
  const [epfEtf, setEpfEtf] = useState(0);
  const [netSalary, setNetSalary] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [salaryData, setSalaryData] = useState([]);
  const [errors, setErrors] = useState({});
  const [alertMsg, setAlertMsg] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchSalaryData();
    fetchEmployees();
  }, []);

  const fetchSalaryData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/salaries");
      setSalaryData(response.data);
    } catch (error) {
      console.error("Error fetching salary data:", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/employees");
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const validateForm = () => {
    let formErrors = {};
    if (!employeeId) formErrors.employeeId = "Employee ID is required";
    if (!month.trim()) formErrors.month = "Month is required";
    if (!basicSalary) formErrors.basicSalary = "Basic Salary is required";
    if (!netSalary) formErrors.netSalary = "Net Salary is required";
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMsg("");

    if (!validateForm()) {
      setAlertMsg("Please fix the errors before submitting.");
      return;
    }

    const newData = {
      employee_id: employeeId,
      month,
      basicSalary: Number(basicSalary),
      overtime: Number(overtime),
      epf_etf: Number(epfEtf),
      net_salary: Number(netSalary),
      paymentStatus,
    };

    try {
      if (!isEditing) {
        await axios.post("http://localhost:8080/api/salaries", newData);
      } else {
        await axios.put(`http://localhost:8080/api/salaries/${editingId}`, newData);
        setIsEditing(false);
        setEditingId(null);
      }

      setEmployeeId("");
      setMonth("");
      setBasicSalary("");
      setOvertime(0);
      setEpfEtf(0);
      setNetSalary("");
      setPaymentStatus("Pending");
      setErrors({});
      fetchSalaryData();
    } catch (error) {
      console.error("Error submitting data:", error);
      setAlertMsg("Error submitting data. Please try again.");
    }
  };

  const handleEdit = (id) => {
    const data = salaryData.find((item) => item._id === id);
    setEmployeeId(data.employee_id);
    setMonth(data.month);
    setBasicSalary(data.basicSalary.toString());
    setOvertime(data.overtime.toString());
    setEpfEtf(data.epf_etf.toString());
    setNetSalary(data.net_salary.toString());
    setPaymentStatus(data.paymentStatus);
    setEditingId(id);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/salaries/${id}`);
      fetchSalaryData();
    } catch (error) {
      console.error("Error deleting data:", error);
      setAlertMsg("Error deleting data. Please try again.");
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>Salary Management</Typography>
      {alertMsg && <Alert severity="error">{alertMsg}</Alert>}

      {/* Form */}
      <Grid container spacing={2} component="form" onSubmit={handleSubmit}>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Employee</InputLabel>
            <Select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} error={Boolean(errors.employeeId)}>
              {employees.map((emp) => (
                <MenuItem key={emp._id} value={emp._id}>
                  {emp.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <TextField label="Month" fullWidth value={month} onChange={(e) => setMonth(e.target.value)} error={Boolean(errors.month)} helperText={errors.month} required />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Basic Salary" type="number" fullWidth value={basicSalary} onChange={(e) => setBasicSalary(e.target.value)} error={Boolean(errors.basicSalary)} helperText={errors.basicSalary} required />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Overtime" type="number" fullWidth value={overtime} onChange={(e) => setOvertime(e.target.value)} />
        </Grid>
        <Grid item xs={6}>
          <TextField label="EPF/ETF" type="number" fullWidth value={epfEtf} onChange={(e) => setEpfEtf(e.target.value)} />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Net Salary" type="number" fullWidth value={netSalary} onChange={(e) => setNetSalary(e.target.value)} error={Boolean(errors.netSalary)} helperText={errors.netSalary} required />
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Payment Status</InputLabel>
            <Select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary">{isEditing ? "Update" : "Add"}</Button>
        </Grid>
      </Grid>

      {/* Salary Table */}
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Month</TableCell>
              <TableCell>Basic Salary</TableCell>
              <TableCell>Overtime</TableCell>
              <TableCell>Net Salary</TableCell>
              <TableCell>Payment Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {salaryData.map((row) => (
              <TableRow key={row._id}>
                <TableCell>{row.employee_id}</TableCell>
                <TableCell>{row.month}</TableCell>
                <TableCell>{row.basicSalary}</TableCell>
                <TableCell>{row.overtime}</TableCell>
                <TableCell>{row.net_salary}</TableCell>
                <TableCell>{row.paymentStatus}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(row._id)}><EditIcon color="primary" /></IconButton>
                  <IconButton onClick={() => handleDelete(row._id)}><DeleteIcon color="error" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SalaryForm;
