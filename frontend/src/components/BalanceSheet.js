import React, { useState, useEffect, useCallback } from "react";
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
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Collapse,
  Card,
  CardContent,
  Stack
} from "@mui/material";
import { 
  AccountBalance, 
  Edit, 
  Delete, 
  ShowChart, 
  ExpandMore, 
  ExpandLess,
  DateRange,
  AttachMoney,
  AccountTree,
  Balance,
} from "@mui/icons-material";
import { format } from 'date-fns';
import DownloadPDFButton from "./DownloadPDFButton";

const BalanceSheetForm = () => {
  const [formData, setFormData] = useState({
    period: "Annual",
    period_date: format(new Date(), 'yyyy-MM-dd'),
    assets: {
      current_assets: {
        cash: 0,
        bank_balance: 0,
        accounts_receivable: 0,
        inventory: 0,
        prepaid_expenses: 0,
        other_current_assets: 0
      },
      fixed_assets: {
        property: 0,
        equipment: 0,
        vehicles: 0,
        accumulated_depreciation: 0
      },
      other_assets: {
        investments: 0,
        intangible_assets: 0,
        other_long_term_assets: 0
      }
    },
    liabilities: {
      current_liabilities: {
        accounts_payable: 0,
        short_term_loans: 0,
        accrued_expenses: 0,
        other_current_liabilities: 0
      },
      long_term_liabilities: {
        long_term_debt: 0,
        deferred_tax_liabilities: 0,
        other_long_term_liabilities: 0
      }
    },
    equity: {
      capital: 0,
      retained_earnings: 0,
      current_year_profit: 0,
      other_equity: 0
    },
    notes: ""
  });

  const [balanceData, setBalanceData] = useState([]);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ open: false, message: "", severity: "error" });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    assets: true,
    liabilities: true,
    equity: true
  });

  const showAlert = useCallback((message, severity) => {
    setAlert({ open: true, message, severity });
  }, []);

  const fetchBalanceData = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/balancesheets");
      setBalanceData(response.data);
    } catch (error) {
      showAlert(error.response?.data?.message || "Error fetching data", "error");
    }
  }, [showAlert]);

  useEffect(() => {
    fetchBalanceData();
  }, [fetchBalanceData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child, subChild] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: subChild ? {
            ...prev[parent][child],
            [subChild]: value
          } : value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.period) newErrors.period = "Period is required";
    if (!formData.period_date) newErrors.period_date = "Date is required";
    
    // Calculate totals first
    const totalAssets = calculateTotalAssets();
    const totalLiabilities = calculateTotalLiabilities();
    const totalEquity = calculateTotalEquity();
    
    // Update formData with calculated totals
    const updatedFormData = {
      ...formData,
      assets: {
        ...formData.assets,
        total_assets: totalAssets
      },
      liabilities: {
        ...formData.liabilities,
        total_liabilities: totalLiabilities
      },
      equity: {
        ...formData.equity,
        total_equity: totalEquity
      }
    };
    
    // Validate accounting equation
    if (Math.abs(totalAssets - (totalLiabilities + totalEquity)) > 0.01) {
      newErrors.balance = "Assets must equal Liabilities + Equity";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotalAssets = () => {
    const currentAssets = Object.values(formData.assets.current_assets).reduce((sum, val) => sum + Number(val), 0);
    const fixedAssets = Object.values(formData.assets.fixed_assets).reduce((sum, val, idx) => 
      idx === 3 ? sum - Number(val) : sum + Number(val), 0);
    const otherAssets = Object.values(formData.assets.other_assets).reduce((sum, val) => sum + Number(val), 0);
    return currentAssets + fixedAssets + otherAssets;
  };

  const calculateTotalLiabilities = () => {
    const currentLiabilities = Object.values(formData.liabilities.current_liabilities).reduce((sum, val) => sum + Number(val), 0);
    const longTermLiabilities = Object.values(formData.liabilities.long_term_liabilities).reduce((sum, val) => sum + Number(val), 0);
    return currentLiabilities + longTermLiabilities;
  };

  const calculateTotalEquity = () => {
    return Object.values(formData.equity).reduce((sum, val) => sum + Number(val), 0);
  };

  const handleEdit = (id) => {
    const entry = balanceData.find(item => item._id === id);
    if (!entry) {
      showAlert("Entry not found", "error");
      return;
    }

    // Format the date to YYYY-MM-DD
    const formattedEntry = {
      ...entry,
      period_date: format(new Date(entry.period_date), 'yyyy-MM-dd')
    };

    setFormData(formattedEntry);
    setEditingId(id);
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Calculate totals first
    const totalAssets = calculateTotalAssets();
    const totalLiabilities = calculateTotalLiabilities();
    const totalEquity = calculateTotalEquity();

    // Prepare the payload with all required fields
    const payload = {
      period: formData.period,
      period_date: formData.period_date,
      assets: {
        current_assets: {
          cash: Number(formData.assets.current_assets.cash) || 0,
          bank_balance: Number(formData.assets.current_assets.bank_balance) || 0,
          accounts_receivable: Number(formData.assets.current_assets.accounts_receivable) || 0,
          inventory: Number(formData.assets.current_assets.inventory) || 0,
          prepaid_expenses: Number(formData.assets.current_assets.prepaid_expenses) || 0,
          other_current_assets: Number(formData.assets.current_assets.other_current_assets) || 0
        },
        fixed_assets: {
          property: Number(formData.assets.fixed_assets.property) || 0,
          equipment: Number(formData.assets.fixed_assets.equipment) || 0,
          vehicles: Number(formData.assets.fixed_assets.vehicles) || 0,
          accumulated_depreciation: Number(formData.assets.fixed_assets.accumulated_depreciation) || 0
        },
        other_assets: {
          investments: Number(formData.assets.other_assets.investments) || 0,
          intangible_assets: Number(formData.assets.other_assets.intangible_assets) || 0,
          other_long_term_assets: Number(formData.assets.other_assets.other_long_term_assets) || 0
        },
        total_assets: totalAssets
      },
      liabilities: {
        current_liabilities: {
          accounts_payable: Number(formData.liabilities.current_liabilities.accounts_payable) || 0,
          short_term_loans: Number(formData.liabilities.current_liabilities.short_term_loans) || 0,
          accrued_expenses: Number(formData.liabilities.current_liabilities.accrued_expenses) || 0,
          other_current_liabilities: Number(formData.liabilities.current_liabilities.other_current_liabilities) || 0
        },
        long_term_liabilities: {
          long_term_debt: Number(formData.liabilities.long_term_liabilities.long_term_debt) || 0,
          deferred_tax_liabilities: Number(formData.liabilities.long_term_liabilities.deferred_tax_liabilities) || 0,
          other_long_term_liabilities: Number(formData.liabilities.long_term_liabilities.other_long_term_liabilities) || 0
        },
        total_liabilities: totalLiabilities
      },
      equity: {
        capital: Number(formData.equity.capital) || 0,
        retained_earnings: Number(formData.equity.retained_earnings) || 0,
        current_year_profit: Number(formData.equity.current_year_profit) || 0,
        other_equity: Number(formData.equity.other_equity) || 0,
        total_equity: totalEquity
      },
      notes: formData.notes || ""
    };

    // Validate the accounting equation
    if (Math.abs(totalAssets - (totalLiabilities + totalEquity)) > 0.01) {
      showAlert("Assets must equal Liabilities plus Equity", "error");
      return;
    }

    try {
      if (isEditing) {
        console.log('Updating balance sheet:', editingId, payload);
        const response = await axios.put(`http://localhost:8080/api/balancesheets/${editingId}`, payload);
        console.log('Update response:', response.data);
        showAlert("Balance sheet updated successfully", "success");
      } else {
        console.log('Creating new balance sheet:', payload);
        const response = await axios.post("http://localhost:8080/api/balancesheets", payload);
        console.log('Create response:', response.data);
        showAlert("Balance sheet added successfully", "success");
      }
      resetForm();
      fetchBalanceData();
    } catch (error) {
      console.error("Error submitting balance sheet:", error.response?.data || error);
      showAlert(
        error.response?.data?.error || 
        error.response?.data?.message || 
        "Operation failed", 
        "error"
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/balancesheets/${id}`);
      showAlert("Balance sheet deleted successfully", "success");
      fetchBalanceData();
    } catch (error) {
      showAlert(error.response?.data?.error || "Delete failed", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      period: "Annual",
      period_date: format(new Date(), 'yyyy-MM-dd'),
      assets: {
        current_assets: {
          cash: 0,
          bank_balance: 0,
          accounts_receivable: 0,
          inventory: 0,
          prepaid_expenses: 0,
          other_current_assets: 0
        },
        fixed_assets: {
          property: 0,
          equipment: 0,
          vehicles: 0,
          accumulated_depreciation: 0
        },
        other_assets: {
          investments: 0,
          intangible_assets: 0,
          other_long_term_assets: 0
        }
      },
      liabilities: {
        current_liabilities: {
          accounts_payable: 0,
          short_term_loans: 0,
          accrued_expenses: 0,
          other_current_liabilities: 0
        },
        long_term_liabilities: {
          long_term_debt: 0,
          deferred_tax_liabilities: 0,
          other_long_term_liabilities: 0
        }
      },
      equity: {
        capital: 0,
        retained_earnings: 0,
        current_year_profit: 0,
        other_equity: 0
      },
      notes: ""
    });
    setErrors({});
    setIsEditing(false);
    setEditingId(null);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Calculate totals for display
  const totalAssets = balanceData.reduce((sum, entry) => sum + entry.assets.total_assets, 0);
  const totalLiabilities = balanceData.reduce((sum, entry) => sum + entry.liabilities.total_liabilities, 0);
  const totalEquity = balanceData.reduce((sum, entry) => sum + entry.equity.total_equity, 0);
  const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      currencyDisplay: 'narrowSymbol'
    }).format(value).replace('LKR', 'Rs.');
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        {/* <Typography variant="h4" gutterBottom>
          Balance Sheet
        </Typography>
         */}
        {/* Header Section */}
        <Box sx={{ 
          mb: 4,
          p: 3,
          backgroundColor: '#3998ff',
          color: 'white',
          borderRadius: 2,
          boxShadow: 3,
          textAlign: 'center'
        }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Balance Sheet Management
          </Typography>
          <Typography variant="subtitle1">
            Comprehensive financial position tracking
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
          mb: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: '#3998ff' }}>
              <ShowChart />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Financial Position Summary
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Chip 
              label={`Total Assets: Rs. ${formatCurrency(totalAssets)}`} 
              color="primary" 
              variant="outlined"
            />
            <Chip 
              label={`Total Liabilities: Rs. ${formatCurrency(totalLiabilities)}`} 
              color="secondary" 
              variant="outlined"
            />
            <Chip 
              label={`Total Equity: Rs. ${formatCurrency(totalEquity)}`} 
              color="success" 
              variant="outlined"
            />
            <Chip 
              label={isBalanced ? "Balanced" : "Imbalanced"} 
              color={isBalanced ? "success" : "error"}
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
        </Box>

        {/* Alert Snackbar */}
        <Snackbar 
          open={alert.open} 
          autoHideDuration={6000} 
          onClose={() => setAlert({ ...alert, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            severity={alert.severity}
            sx={{ width: '100%' }}
            elevation={6}
            variant="filled"
          >
            {alert.message}
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
            {isEditing ? "✏️ Edit Balance Sheet" : "➕ Add New Balance Sheet"}
          </Typography>
          
          <Grid container spacing={3} component="form" onSubmit={handleSubmit}>
            {/* Period and Date */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Period *</InputLabel>
                <Select
                  name="period"
                  value={formData.period}
                  onChange={handleChange}
                  label="Period *"
                  required
                >
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Quarterly">Quarterly</MenuItem>
                  <MenuItem value="Annual">Annual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Period Date *"
                type="date"
                name="period_date"
                value={formData.period_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={1}
              />
            </Grid>
            
            {/* Assets Section */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleSection('assets')}
                  >
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccountTree color="primary" /> Assets
                    </Typography>
                    {expandedSections.assets ? <ExpandLess /> : <ExpandMore />}
                  </Box>
                  
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2 }}>
                    Total Assets: {formatCurrency(calculateTotalAssets())}
                  </Typography>
                  
                  <Collapse in={expandedSections.assets}>
                    <Grid container spacing={2}>
                      {/* Current Assets */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Current Assets
                        </Typography>
                        <Grid container spacing={2}>
                          {Object.entries(formData.assets.current_assets).map(([key, value]) => (
                            <Grid item xs={12} md={4} key={`current_assets_${key}`}>
                              <TextField
                                fullWidth
                                label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                type="number"
                                name={`assets.current_assets.${key}`}
                                value={value}
                                onChange={handleChange}
                                inputProps={{ min: 0, step: 0.01 }}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>
                      
                      {/* Fixed Assets */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Fixed Assets (Net)
                        </Typography>
                        <Grid container spacing={2}>
                          {Object.entries(formData.assets.fixed_assets).map(([key, value]) => (
                            <Grid item xs={12} md={3} key={`fixed_assets_${key}`}>
                              <TextField
                                fullWidth
                                label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                type="number"
                                name={`assets.fixed_assets.${key}`}
                                value={value}
                                onChange={handleChange}
                                inputProps={{ min: 0, step: 0.01 }}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>
                      
                      {/* Other Assets */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Other Assets
                        </Typography>
                        <Grid container spacing={2}>
                          {Object.entries(formData.assets.other_assets).map(([key, value]) => (
                            <Grid item xs={12} md={4} key={`other_assets_${key}`}>
                              <TextField
                                fullWidth
                                label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                type="number"
                                name={`assets.other_assets.${key}`}
                                value={value}
                                onChange={handleChange}
                                inputProps={{ min: 0, step: 0.01 }}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Liabilities Section */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleSection('liabilities')}
                  >
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Balance color="error" /> Liabilities
                    </Typography>
                    {expandedSections.liabilities ? <ExpandLess /> : <ExpandMore />}
                  </Box>
                  
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2 }}>
                    Total Liabilities: {formatCurrency(calculateTotalLiabilities())}
                  </Typography>
                  
                  <Collapse in={expandedSections.liabilities}>
                    <Grid container spacing={2}>
                      {/* Current Liabilities */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Current Liabilities
                        </Typography>
                        <Grid container spacing={2}>
                          {Object.entries(formData.liabilities.current_liabilities).map(([key, value]) => (
                            <Grid item xs={12} md={3} key={`current_liabilities_${key}`}>
                              <TextField
                                fullWidth
                                label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                type="number"
                                name={`liabilities.current_liabilities.${key}`}
                                value={value}
                                onChange={handleChange}
                                inputProps={{ min: 0, step: 0.01 }}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>
                      
                      {/* Long-term Liabilities */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Long-term Liabilities
                        </Typography>
                        <Grid container spacing={2}>
                          {Object.entries(formData.liabilities.long_term_liabilities).map(([key, value]) => (
                            <Grid item xs={12} md={4} key={`long_term_liabilities_${key}`}>
                              <TextField
                                fullWidth
                                label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                type="number"
                                name={`liabilities.long_term_liabilities.${key}`}
                                value={value}
                                onChange={handleChange}
                                inputProps={{ min: 0, step: 0.01 }}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Equity Section */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleSection('equity')}
                  >
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachMoney color="success" /> Equity
                    </Typography>
                    {expandedSections.equity ? <ExpandLess /> : <ExpandMore />}
                  </Box>
                  
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2 }}>
                    Total Equity: {formatCurrency(calculateTotalEquity())}
                  </Typography>
                  
                  <Collapse in={expandedSections.equity}>
                    <Grid container spacing={2}>
                      {Object.entries(formData.equity).map(([key, value]) => (
                        <Grid item xs={12} md={3} key={`equity_${key}`}>
                          <TextField
                            fullWidth
                            label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            type="number"
                            name={`equity.${key}`}
                            value={value}
                            onChange={handleChange}
                            inputProps={{ step: 0.01 }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
            
            {/* Balance Validation */}
            {errors.balance && (
              <Grid item xs={12}>
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errors.balance}
                </Alert>
              </Grid>
            )}
            
            {/* Form Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  size="large"
                  sx={{ px: 4 }}
                >
                  {isEditing ? "Update Balance Sheet" : "Create Balance Sheet"}
                </Button>
                {isEditing && (
                  <Button 
                    variant="outlined" 
                    onClick={resetForm}
                    size="large"
                    sx={{ px: 4 }}
                  >
                    Cancel
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Balance Sheet Table */}
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ 
            mb: 3,
            color: '#3998ff',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            📊 Balance Sheet History
          </Typography>
          
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Period</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Assets</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Liabilities</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Equity</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {balanceData.map((row) => {
                  const isRowBalanced = Math.abs(
                    row.assets.total_assets - 
                    (row.liabilities.total_liabilities + row.equity.total_equity)
                  ) < 0.01;
                  
                  return (
                    <TableRow 
                      key={row._id}
                      sx={{ 
                        '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                        '&:hover': { backgroundColor: '#f1f1f1' }
                      }}
                    >
                      <TableCell>{row.period}</TableCell>
                      <TableCell>{format(new Date(row.period_date), 'MMM d, yyyy')}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(row.assets.total_assets)}
                      </TableCell>
                      <TableCell sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                        {formatCurrency(row.liabilities.total_liabilities)}
                      </TableCell>
                      <TableCell sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                        {formatCurrency(row.equity.total_equity)}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="small"
                          label={isRowBalanced ? "Balanced" : "Imbalanced"} 
                          color={isRowBalanced ? "success" : "error"}
                        />
                      </TableCell>
                      <TableCell>
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
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* PDF Export Section */}
        {balanceData.length > 0 && (
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
              🖨️ Export Balance Sheet
            </Typography>
            <DownloadPDFButton
              documentType="balance-sheet"
              data={balanceData}
              fileName="balance_sheet.pdf"
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
      </Box>
    </Container>
  );
};

export default BalanceSheetForm;