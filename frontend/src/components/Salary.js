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
      console.log('Fetching salary data...');
      const response = await axios.get("http://localhost:8080/api/salaries");
      console.log('Raw salary data received:', response.data);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Ensure we have an array of salary records
      const salaryRecords = Array.isArray(response.data) ? response.data : [response.data];
      console.log('Processed salary records:', salaryRecords);

      // Validate each record has required fields
      const validRecords = salaryRecords.filter(record => {
        const isValid = record && 
          record.employee_id && 
          record.month && 
          typeof record.basicSalary === 'number' &&
          typeof record.net_salary === 'number';
        
        if (!isValid) {
          console.warn('Invalid salary record:', record);
        }
        return isValid;
      });

      // Map the records to include employee details
      const recordsWithEmployeeDetails = validRecords.map(record => {
        const employee = employees.find(emp => emp.employee_id === record.employee_id);
        return {
          ...record,
          employeeDetails: employee || null
        };
      });

      console.log('Valid salary records with employee details:', recordsWithEmployeeDetails);
      setSalaryData(recordsWithEmployeeDetails);
    } catch (error) {
      console.error("Error fetching salary data:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Handle specific error cases
      if (error.response?.data?.details?.includes('Cast to ObjectId failed')) {
        showAlert("Error: Invalid employee ID format. Please check the data.", "error");
      } else {
        const errorMessage = error.response?.data?.error || 
                            error.response?.data?.message || 
                            error.message || 
                            "Error fetching salary data";
        showAlert(errorMessage, "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching employees...');
      const response = await axios.get("http://localhost:8080/api/Employee");
      console.log('Raw employee data received:', response.data);
      
      if (!Array.isArray(response.data)) {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response format from server');
      }

      // Ensure each employee has the required fields
      const validEmployees = response.data.filter(emp => {
        const isValid = emp && emp.employee_id && emp.firstName && emp.lastName;
        if (!isValid) {
          console.warn('Invalid employee record:', emp);
        }
        return isValid;
      });

      // Sort employees by name for better usability
      const sortedEmployees = validEmployees.sort((a, b) => 
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      );
      
      console.log('Processed and sorted employees:', sortedEmployees);
      setEmployees(sortedEmployees);
      setErrors(prev => ({ ...prev, employeeFetch: "" }));
    } catch (error) {
      console.error("Error fetching employees:", error);
      setErrors(prev => ({ ...prev, employeeFetch: error.message || "Error fetching employee data" }));
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

    // Validate employee ID format
    if (!employeeId || !employeeId.startsWith('EMP')) {
      showAlert("Error: Invalid employee ID format", "error");
      return;
    }

    // Verify employee exists
    const employeeExists = employees.some(emp => emp.employee_id === employeeId);
    if (!employeeExists) {
      showAlert("Error: Selected employee not found", "error");
      return;
    }

    const newData = {
      employee_id: employeeId,
      month,
      basicSalary: Number(basicSalary),
      overtime: Number(overtime) || 0,
      epf_etf: Number(epfEtf) || 0,
      net_salary: Number(netSalary),
      paymentStatus,
    };

    console.log('Submitting salary data:', newData);

    try {
      setIsLoading(true);
      
      // Check if a record already exists for this employee and month
      const existingRecord = salaryData.find(
        record => record.employee_id === employeeId && record.month === month
      );

      if (existingRecord && !isEditing) {
        // If record exists and we're not in edit mode, ask for confirmation
        if (window.confirm(
          `A salary record for this employee in ${month} already exists. Do you want to update it?`
        )) {
          const response = await axios.put(
            `http://localhost:8080/api/salaries/${existingRecord._id}`,
            newData
          );
          console.log('Salary updated successfully:', response.data);
          showAlert("Salary entry updated successfully", "success");
        } else {
          showAlert("Operation cancelled", "info");
          return;
        }
      } else if (isEditing) {
        // Normal update flow
        const response = await axios.put(
          `http://localhost:8080/api/salaries/${editingId}`,
          newData
        );
        console.log('Salary updated successfully:', response.data);
        showAlert("Salary entry updated successfully", "success");
        setIsEditing(false);
        setEditingId(null);
      } else {
        // Create new record
        const response = await axios.post(
          "http://localhost:8080/api/salaries",
          newData
        );
        console.log('Salary added successfully:', response.data);
        showAlert("Salary entry added successfully", "success");
      }

      resetForm();
      fetchSalaryData();
    } catch (error) {
      console.error("Error submitting data:", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          "Error submitting data";
      showAlert(errorMessage, "error");
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
      console.log('Deleting salary record:', id);
      await axios.delete(`http://localhost:8080/api/salaries/${id}`);
      console.log('Salary deleted successfully');
      showAlert("Salary entry deleted successfully", "success");
      fetchSalaryData();
    } catch (error) {
      console.error("Error deleting data:", error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Error deleting salary entry";
      showAlert(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals
  const totalBasic = salaryData.reduce((sum, entry) => sum + entry.basicSalary, 0);
  const totalOvertime = salaryData.reduce((sum, entry) => sum + entry.overtime, 0);
  const totalDeductions = salaryData.reduce((sum, entry) => sum + entry.epf_etf, 0);
  const totalNet = salaryData.reduce((sum, entry) => sum + entry.net_salary, 0);

  // Add this new function to handle employee selection
  const handleEmployeeSelect = (event) => {
    const selectedEmployeeId = event.target.value;
    console.log('Selected employee ID:', selectedEmployeeId);
    
    // Find the selected employee
    const selectedEmployee = employees.find(emp => emp.employee_id === selectedEmployeeId);
    console.log('Selected employee details:', selectedEmployee);
    
    if (selectedEmployee) {
      setEmployeeId(selectedEmployee.employee_id);
      setBasicSalary(selectedEmployee.basicSalary?.toString() || "0");
      calculateNetSalary();
    } else {
      console.error('Employee not found:', selectedEmployeeId);
      showAlert("Error: Selected employee not found", "error");
    }
  };

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
            label={`Basic: Rs. ${totalBasic.toLocaleString('en-LK')}`} 
            color="primary" 
            variant="outlined"
          />
          <Chip 
            label={`Overtime: Rs. ${totalOvertime.toLocaleString('en-LK')}`} 
            color="success" 
            variant="outlined"
          />
          <Chip 
            label={`Deductions: Rs. ${totalDeductions.toLocaleString('en-LK')}`} 
            color="error" 
            variant="outlined"
          />
          <Chip 
            label={`Net Paid: Rs. ${totalNet.toLocaleString('en-LK')}`} 
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
            <FormControl fullWidth error={Boolean(errors.employeeId || errors.employeeFetch)}>
              <InputLabel>Select Employee *</InputLabel>
              <Select
                value={employeeId}
                onChange={handleEmployeeSelect}
                label="Select Employee *"
                disabled={isLoading || isEditing}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  <em>Select an employee</em>
                </MenuItem>
                {employees && employees.length > 0 ? (
                  employees.map((employee) => (
                    <MenuItem 
                      key={employee.employee_id} 
                      value={employee.employee_id}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        py: 1
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            bgcolor: '#3998ff',
                            fontSize: '0.875rem'
                          }}
                        >
                          {employee.firstName?.[0]}{employee.lastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1">
                            {employee.firstName} {employee.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {employee.position} - {employee.department}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>
                    <Typography color="text.secondary">
                      No employees available
                    </Typography>
                  </MenuItem>
                )}
              </Select>
              {errors.employeeId && (
                <Typography color="error" variant="caption">
                  {errors.employeeId}
                </Typography>
              )}
              {errors.employeeFetch && (
                <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                  {errors.employeeFetch}
                </Typography>
              )}
              {isLoading && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Loading employees...
                  </Typography>
                </Box>
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
              label="Basic Salary (Rs.) *"
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
              label="Overtime (Rs.)"
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
              label="EPF/ETF (Rs.)"
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
              label="Net Salary (Rs.) *"
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
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Basic (Rs.)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Overtime (Rs.)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Deductions (Rs.)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Net (Rs.)</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salaryData.length > 0 ? (
                  salaryData.map((row) => {
                    const employeeDetails = row.employeeDetails;
                    return (
                      <TableRow 
                        key={row._id}
                        sx={{ 
                          '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                          '&:hover': { backgroundColor: '#f1f1f1' }
                        }}
                      >
                        <TableCell>
                          {employeeDetails ? 
                            `${employeeDetails.firstName} ${employeeDetails.lastName} (${row.employee_id})` : 
                            row.employee_id}
                        </TableCell>
                        <TableCell>{row.month}</TableCell>
                        <TableCell align="right">Rs. {row.basicSalary.toLocaleString('en-LK')}</TableCell>
                        <TableCell align="right" sx={{ color: '#2e7d32' }}>
                          Rs. {row.overtime.toLocaleString('en-LK')}
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#d32f2f' }}>
                          Rs. {row.epf_etf.toLocaleString('en-LK')}
                        </TableCell>
                        <TableCell 
                          align="right" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: row.net_salary >= 0 ? '#2e7d32' : '#d32f2f'
                          }}
                        >
                          Rs. {row.net_salary.toLocaleString('en-LK')}
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