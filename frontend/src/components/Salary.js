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
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Chip,
  CircularProgress,
  Container
} from "@mui/material";
import { AccountBalance, Edit, Delete, AttachMoney } from "@mui/icons-material";
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
  const [alertMsg, setAlertMsg] = useState({ open: false, text: "", severity: "error" });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSalaryData();
    fetchEmployees();
  }, []);

  const fetchSalaryData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:8080/api/salaries");
      setSalaryData(response.data);
    } catch (error) {
      console.error("Error fetching salary data:", error);
      showAlert("Error fetching salary data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:8080/api/employees");
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      showAlert("Error fetching employees", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (text, severity) => {
    setAlertMsg({ open: true, text, severity });
  };

  const validateForm = () => {
    let formErrors = {};
    if (!employeeId) formErrors.employeeId = "Employee is required";
    if (!month.trim()) formErrors.month = "Month is required";
    if (!basicSalary) formErrors.basicSalary = "Basic Salary is required";
    if (isNaN(basicSalary)) formErrors.basicSalary = "Must be a valid number";
    if (!netSalary) formErrors.netSalary = "Net Salary is required";
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const calculateNetSalary = () => {
    if (basicSalary && !isNaN(basicSalary)) {
      const basic = Number(basicSalary);
      const ot = Number(overtime) || 0;
      const deduction = Number(epfEtf) || 0;
      setNetSalary((basic + ot - deduction).toFixed(2));
    }
  };

  useEffect(() => {
    calculateNetSalary();
  }, [basicSalary, overtime, epfEtf]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showAlert("Please fix the errors before submitting", "error");
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
      setIsLoading(true);
      if (!isEditing) {
        await axios.post("http://localhost:8080/api/salaries", newData);
        showAlert("Salary entry added successfully", "success");
      } else {
        await axios.put(`http://localhost:8080/api/salaries/${editingId}`, newData);
        showAlert("Salary entry updated successfully", "success");
        setIsEditing(false);
        setEditingId(null);
      }

      resetForm();
      fetchSalaryData();
    } catch (error) {
      console.error("Error submitting data:", error);
      showAlert(error.response?.data?.message || "Error submitting data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmployeeId("");
    setMonth("");
    setBasicSalary("");
    setOvertime(0);
    setEpfEtf(0);
    setNetSalary("");
    setPaymentStatus("Pending");
    setErrors({});
  };

  const handleEdit = (id) => {
    const data = salaryData.find((item) => item._id === id);
    if (data) {
      setEmployeeId(data.employee_id);
      setMonth(data.month);
      setBasicSalary(data.basicSalary.toString());
      setOvertime(data.overtime.toString());
      setEpfEtf(data.epf_etf.toString());
      setNetSalary(data.net_salary.toString());
      setPaymentStatus(data.paymentStatus);
      setEditingId(id);
      setIsEditing(true);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsLoading(true);
      await axios.delete(`http://localhost:8080/api/salaries/${id}`);
      showAlert("Salary entry deleted successfully", "success");
      fetchSalaryData();
    } catch (error) {
      console.error("Error deleting data:", error);
      showAlert("Error deleting salary entry", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals
  const totalBasic = salaryData.reduce((sum, entry) => sum + entry.basicSalary, 0);
  const totalOvertime = salaryData.reduce((sum, entry) => sum + entry.overtime, 0);
  const totalDeductions = salaryData.reduce((sum, entry) => sum + entry.epf_etf, 0);
  const totalNet = salaryData.reduce((sum, entry) => sum + entry.net_salary, 0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ 
        mb: 4,
        p: 3,
        backgroundColor: '#3998ff',
        color: 'white',
        borderRadius: 2,
        boxShadow: 3
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Salary Management
        </Typography>
        <Typography variant="subtitle1">
          Manage employee payroll and salary records
        </Typography>
      </Box>

      {/* Summary Section */}
      <Box sx={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        p: 2,
        borderRadius: 1,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        mb: 4
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: '#3998ff' }}>
            <AttachMoney />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Salary Summary
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Chip 
            label={`Basic: ₹${totalBasic.toLocaleString('en-IN')}`} 
            color="primary" 
            variant="outlined"
          />
          <Chip 
            label={`Overtime: ₹${totalOvertime.toLocaleString('en-IN')}`} 
            color="success" 
            variant="outlined"
          />
          <Chip 
            label={`Deductions: ₹${totalDeductions.toLocaleString('en-IN')}`} 
            color="error" 
            variant="outlined"
          />
          <Chip 
            label={`Net Paid: ₹${totalNet.toLocaleString('en-IN')}`} 
            color={totalNet >= 0 ? 'primary' : 'error'}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
      </Box>

      {/* Alert Snackbar */}
      <Snackbar 
        open={alertMsg.open} 
        autoHideDuration={6000} 
        onClose={() => setAlertMsg({ ...alertMsg, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          severity={alertMsg.severity}
          sx={{ width: '100%' }}
          elevation={6}
          variant="filled"
        >
          {alertMsg.text}
        </Alert>
      </Snackbar>

      {/* Add/Edit Form */}
      <Paper elevation={3} sx={{ 
        p: 3, 
        mb: 4,
        borderLeft: '4px solid #3998ff',
        borderRadius: 2
      }}>
        <Typography variant="h6" gutterBottom sx={{ 
          color: '#3998ff',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          {isEditing ? "✏️ Edit Salary Entry" : "➕ Add New Salary Entry"}
        </Typography>
        
        <Grid container spacing={3} component="form" onSubmit={handleSubmit}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={Boolean(errors.employeeId)}>
              <InputLabel>Employee *</InputLabel>
              <Select 
                value={employeeId} 
                onChange={(e) => setEmployeeId(e.target.value)}
                label="Employee *"
                disabled={isLoading}
              >
                {employees.map((emp) => (
                  <MenuItem key={emp._id} value={emp._id}>
                    {emp.name} ({emp.employeeId})
                  </MenuItem>
                ))}
              </Select>
              {errors.employeeId && (
                <Typography variant="caption" color="error">
                  {errors.employeeId}
                </Typography>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Month *"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              error={Boolean(errors.month)}
              helperText={errors.month || "Format: YYYY-MM"}
              required
              disabled={isLoading}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Basic Salary (₹) *"
              type="number"
              value={basicSalary}
              onChange={(e) => {
                setBasicSalary(e.target.value);
                if (errors.basicSalary) setErrors({...errors, basicSalary: ""});
              }}
              error={Boolean(errors.basicSalary)}
              helperText={errors.basicSalary}
              required
              inputProps={{ min: 0, step: 0.01 }}
              disabled={isLoading}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Overtime (₹)"
              type="number"
              value={overtime}
              onChange={(e) => setOvertime(e.target.value)}
              inputProps={{ min: 0, step: 0.01 }}
              disabled={isLoading}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="EPF/ETF (₹)"
              type="number"
              value={epfEtf}
              onChange={(e) => setEpfEtf(e.target.value)}
              inputProps={{ min: 0, step: 0.01 }}
              disabled={isLoading}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Net Salary (₹) *"
              type="number"
              value={netSalary}
              onChange={(e) => setNetSalary(e.target.value)}
              error={Boolean(errors.netSalary)}
              helperText={errors.netSalary}
              required
              inputProps={{ readOnly: true }}
              sx={{
                "& .MuiInputBase-input": {
                  fontWeight: 'bold',
                  color: netSalary >= 0 ? '#2e7d32' : '#d32f2f'
                }
              }}
              disabled={isLoading}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Payment Status</InputLabel>
              <Select 
                value={paymentStatus} 
                onChange={(e) => setPaymentStatus(e.target.value)}
                label="Payment Status"
                disabled={isLoading}
              >
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                sx={{ px: 4 }}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isLoading ? "Processing..." : (isEditing ? "Update" : "Add")}
              </Button>
              {isEditing && (
                <Button 
                  variant="outlined" 
                  onClick={resetForm}
                  sx={{ px: 4 }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Salary Records Table */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ 
          mb: 3,
          color: '#3998ff',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          📊 Salary Records
        </Typography>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Month</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Basic (₹)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Overtime (₹)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Deductions (₹)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Net (₹)</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salaryData.length > 0 ? (
                  salaryData.map((row) => {
                    const employee = employees.find(emp => emp._id === row.employee_id);
                    return (
                      <TableRow 
                        key={row._id}
                        sx={{ 
                          '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                          '&:hover': { backgroundColor: '#f1f1f1' }
                        }}
                      >
                        <TableCell>
                          {employee ? `${employee.name} (${employee.employeeId})` : row.employee_id}
                        </TableCell>
                        <TableCell>{row.month}</TableCell>
                        <TableCell align="right">{row.basicSalary.toLocaleString('en-IN')}</TableCell>
                        <TableCell align="right" sx={{ color: '#2e7d32' }}>
                          {row.overtime.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#d32f2f' }}>
                          {row.epf_etf.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell 
                          align="right" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: row.net_salary >= 0 ? '#2e7d32' : '#d32f2f'
                          }}
                        >
                          {row.net_salary.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={row.paymentStatus} 
                            color={row.paymentStatus === 'Paid' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            onClick={() => handleEdit(row._id)}
                            color="primary"
                            sx={{ '&:hover': { backgroundColor: '#e3f2fd' } }}
                            disabled={isLoading}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton 
                            onClick={() => handleDelete(row._id)}
                            color="error"
                            sx={{ '&:hover': { backgroundColor: '#ffebee' } }}
                            disabled={isLoading}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No salary records found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* PDF Export Section */}
      {salaryData.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ 
            color: '#3998ff',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2
          }}>
            🖨️ Export Salary Report
          </Typography>
          <DownloadPDFButton
            documentType="salary-report"
            data={salaryData}
            fileName="salary_report.pdf"
            sx={{
              backgroundColor: '#3998ff',
              color: 'white',
              '&:hover': {
                backgroundColor: '#2979ff'
              }
            }}
            disabled={isLoading}
          />
        </Paper>
      )}
    </Container>
  );
};

export default SalaryForm;