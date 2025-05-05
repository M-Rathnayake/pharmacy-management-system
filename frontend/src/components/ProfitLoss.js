import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  Table,
  Container,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  IconButton,
  Alert,
  Snackbar,
  Avatar,
  Chip,
  CircularProgress
} from "@mui/material";
import { Assessment, Edit, Delete } from "@mui/icons-material";
import DownloadPDFButton from "./DownloadPDFButton";
import SearchBar from "./SearchBar";

const ProfitLossForm = () => {
  const [period, setPeriod] = useState("");
  const [revenue, setRevenue] = useState("");
  const [expenses, setExpenses] = useState("");
  const [profitLossData, setProfitLossData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [errors, setErrors] = useState({});
  const [alertMsg, setAlertMsg] = useState({ open: false, text: "", severity: "error" });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfitLossData();
  }, []);

  useEffect(() => {
    setFilteredData(profitLossData);
  }, [profitLossData]);

  const fetchProfitLossData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8080/api/profitloss");
      console.log('Fetched data from API:', JSON.stringify(response.data, null, 2));
      const data = response.data || [];
      data.forEach(item => {
        console.log(`Record ID ${item._id}: profit = ${item.profit}, revenue = ${item.revenue}, expenses = ${item.expenses}`);
      });
      setProfitLossData(data);
    } catch (error) {
      console.error("Error fetching data:", error.response?.data || error.message);
      showAlert("Error fetching data: " + (error.response?.data?.error || error.message), "error");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (text, severity) => {
    setAlertMsg({ open: true, text, severity });
  };

  const validateForm = () => {
    let formErrors = {};
    let isValid = true;

    if (!period.trim()) {
      formErrors.period = "Period is required";
      isValid = false;
    }

    if (revenue === "") {
      formErrors.revenue = "Revenue is required";
      isValid = false;
    } else if (isNaN(revenue)) {
      formErrors.revenue = "Please enter a valid number";
      isValid = false;
    } else if (Number(revenue) < 0) {
      formErrors.revenue = "Revenue cannot be negative";
      isValid = false;
    }

    if (expenses === "") {
      formErrors.expenses = "Expenses is required";
      isValid = false;
    } else if (isNaN(expenses)) {
      formErrors.expenses = "Please enter a valid number";
      isValid = false;
    } else if (Number(expenses) < 0) {
      formErrors.expenses = "Expenses cannot be negative";
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showAlert("Please fix the errors below before submitting.", "error");
      return;
    }

    const calculatedProfit = Number(revenue) - Number(expenses);
    const newData = {
      period,
      revenue: Number(revenue),
      expenses: Number(expenses),
      profit: calculatedProfit
    };

    try {
      if (isEditing) {
        await axios.put(`http://localhost:8080/api/profitloss/${editingId}`, newData);
        showAlert("Entry updated successfully", "success");
      } else {
        await axios.post("http://localhost:8080/api/profitloss", newData);
        showAlert("Entry added successfully", "success");
      }
      resetForm();
      await fetchProfitLossData();
    } catch (error) {
      console.error("Error saving data:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.errors?.map(e => e.msg).join("; ") ||
                       error.response?.data?.error ||
                       "Error saving data. Please try again.";
      showAlert(errorMsg, "error");
    }
  };

  const resetForm = () => {
    setPeriod("");
    setRevenue("");
    setExpenses("");
    setErrors({});
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (id) => {
    const data = profitLossData.find((item) => item._id === id);
    if (data) {
      console.log('Editing data:', JSON.stringify(data, null, 2));
      setPeriod(data.period || "");
      setRevenue(data.revenue?.toString() || "");
      setExpenses(data.expenses?.toString() || "");
      setEditingId(id);
      setIsEditing(true);
    } else {
      showAlert("Entry not found", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/profitloss/${id}`);
      showAlert("Entry deleted successfully", "success");
      await fetchProfitLossData();
    } catch (error) {
      console.error("Error deleting data:", error.response?.data || error.message);
      showAlert(error.response?.data?.error || "Error deleting data. Please try again.", "error");
    }
  };

  const displayNetProfit =
    revenue && expenses && !isNaN(revenue) && !isNaN(expenses)
      ? Number(revenue) - Number(expenses)
      : "";

  // Calculate totals with proper null checks
  const totalRevenue = profitLossData.reduce((sum, entry) => sum + (entry.revenue || 0), 0);
  const totalExpenses = profitLossData.reduce((sum, entry) => sum + (entry.expenses || 0), 0);
  const totalProfit = totalRevenue - totalExpenses;

  // Safe data access function
  const safeToLocaleString = (value) => {
    const num = Number(value ?? 0);
    return isNaN(num) ? '0' : num.toLocaleString('en-IN');
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
          Profit & Loss Statement
        </Typography>
        <Typography variant="subtitle1">
          Track your business financial performance
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
            <Assessment />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Financial Summary
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Chip 
            label={`Total Revenue: Rs.${safeToLocaleString(totalRevenue)}`} 
            color="success" 
            variant="outlined"
          />
          <Chip 
            label={`Total Expenses: Rs.${safeToLocaleString(totalExpenses)}`} 
            color="error" 
            variant="outlined"
          />
          <Chip 
            label={`Net Profit: Rs.${safeToLocaleString(totalProfit)}`} 
            color={totalProfit >= 0 ? 'primary' : 'error'}
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
          {isEditing ? "✏️ Edit Entry" : "➕ Add New Entry"}
        </Typography>
        
        <Grid container spacing={3} component="form" onSubmit={handleSubmit}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Period *"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              error={Boolean(errors.period)}
              helperText={errors.period || "E.g., 2023_01 or Jan-2023"}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Revenue (Rs.) *"
              type="number"
              value={revenue}
              onChange={(e) => {
                setRevenue(e.target.value);
                if (errors.revenue) setErrors({...errors, revenue: ""});
              }}
              error={Boolean(errors.revenue)}
              helperText={errors.revenue}
              required
              inputProps={{ min: 0 }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Expenses (Rs.) *"
              type="number"
              value={expenses}
              onChange={(e) => {
                setExpenses(e.target.value);
                if (errors.expenses) setErrors({...errors, expenses: ""});
              }}
              error={Boolean(errors.expenses)}
              helperText={errors.expenses}
              required
              inputProps={{ min: 0 }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Net Profit (Rs.)"
              type="number"
              value={displayNetProfit}
              InputProps={{ readOnly: true }}
              sx={{
                "& .MuiInputBase-input": {
                  color: displayNetProfit >= 0 ? '#2e7d32' : '#d32f2f',
                  fontWeight: 'bold'
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                sx={{ px: 4 }}
              >
                {isEditing ? "Update" : "Add"}
              </Button>
              {isEditing && (
                <Button 
                  variant="outlined" 
                  onClick={resetForm}
                  sx={{ px: 4 }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Data Table Section */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}>
          <Typography variant="h6" sx={{ 
            color: '#3998ff',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            📊 Profit/Loss Records
          </Typography>
          <SearchBar 
            data={profitLossData} 
            searchKey="period" 
            onResults={setFilteredData} 
            placeholder="Search by period..."
          />
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Period</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Revenue (Rs.)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Expenses (Rs.)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Net Profit (Rs.)</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((row) => {
                    const profitValue = row.profit ?? (row.revenue - row.expenses)
                    console.log(`Rendering row ID ${row._id}: profit = ${profitValue}`);
                    return (
                      <TableRow 
                        key={row._id}
                        sx={{ 
                          '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                          '&:hover': { backgroundColor: '#f1f1f1' }
                        }}
                      >
                        <TableCell>{row.period ?? 'N/A'}</TableCell>
                        <TableCell align="right" sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                          {safeToLocaleString(row.revenue)}
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                          {safeToLocaleString(row.expenses)}
                        </TableCell>
                        <TableCell 
                          align="right" 
                          sx={{ 
                            color: (profitValue >= 0 ? '#2e7d32' : '#d32f2f'),
                            fontWeight: 'bold'
                          }}
                        >
                          {safeToLocaleString(profitValue)}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            onClick={() => handleEdit(row._id)}
                            color="primary"
                            sx={{ '&:hover': { backgroundColor: '#e3f2fd' } }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton 
                            onClick={() => handleDelete(row._id)}
                            color="error"
                            sx={{ '&:hover': { backgroundColor: '#ffebee' } }}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">
                        No profit/loss records found
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
      {profitLossData.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
          <Typography
            variant="h6"
            sx={{
              color: '#3998ff',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2,
            }}
          >
            🖨️ Export Statement
          </Typography>
          <DownloadPDFButton
            documentType="profit-loss"
            data={profitLossData}
            fileName="profit_loss_statement.pdf"
            sx={{
              backgroundColor: '#3998ff',
              color: 'white',
              '&:hover': {
                backgroundColor: '#2979ff',
              },
            }}
          />
        </Paper>
      )}
    </Container>
  );
};

export default ProfitLossForm;