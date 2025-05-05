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
  Container,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Collapse,
  Snackbar,
  Avatar,
  Chip,
  Divider,
  CircularProgress
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import DownloadPDFButton from "./DownloadPDFButton";

const LedgerForm = () => {
  const [accountName, setAccountName] = useState("");
  const [transactionType, setTransactionType] = useState("debit");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [ledgerData, setLedgerData] = useState([]);
  const [errors, setErrors] = useState({});
  const [alertMsg, setAlertMsg] = useState({ open: false, message: "", severity: "error" });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedAccounts, setExpandedAccounts] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLedgerData();
  }, []);

  const fetchLedgerData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:8080/api/ledger");
      setLedgerData(response.data);
      const initialExpanded = {};
      response.data.forEach(item => {
        if (!initialExpanded[item.account_name]) {
          initialExpanded[item.account_name] = true;
        }
      });
      setExpandedAccounts(initialExpanded);
    } catch (error) {
      console.error("Error fetching ledger data:", error);
      showAlert("Error fetching ledger data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (message, severity) => {
    setAlertMsg({ open: true, message, severity });
    setTimeout(() => setAlertMsg({ ...alertMsg, open: false }), 6000);
  };

  const validateForm = () => {
    let formErrors = {};
    if (!accountName.trim()) formErrors.accountName = "Account Name is required";
    if (!transactionType) formErrors.transactionType = "Transaction Type is required";
    if (!description.trim()) formErrors.description = "Description is required";
    if (!date) formErrors.date = "Date is required";
    if (!amount || Number(amount) <= 0) formErrors.amount = "Valid amount is required";
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm()) {
      showAlert("Please fix the errors before submitting.", "error");
      setIsLoading(false);
      return;
    }

    const newData = {
      account_name: accountName,
      transaction_type: transactionType,
      description,
      date: new Date(date).toISOString(), // Convert to ISO format
      amount: Number(amount),
    };

    try {
      let response;
      if (!isEditing) {
        response = await axios.post("http://localhost:8080/api/ledger", newData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        showAlert("Entry added successfully", "success");
      } else {
        response = await axios.put(`http://localhost:8080/api/ledger/${editingId}`, newData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        showAlert("Entry updated successfully", "success");
        setIsEditing(false);
        setEditingId(null);
      }

      resetForm();
      await fetchLedgerData();
    } catch (error) {
      console.error("Detailed error:", {
        message: error.message,
        response: error.response?.data,
        request: error.request,
        config: error.config
      });
      
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         "Error submitting data. Please try again.";
      showAlert(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id) => {
    const data = ledgerData.find((item) => item._id === id);
    if (data) {
      setAccountName(data.account_name);
      setTransactionType(data.transaction_type);
      setDescription(data.description);
      setDate(data.date.split('T')[0]);
      setAmount(data.amount.toString());
      setEditingId(id);
      setIsEditing(true);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsLoading(true);
      await axios.delete(`http://localhost:8080/api/ledger/${id}`);
      showAlert("Entry deleted successfully", "success");
      await fetchLedgerData();
    } catch (error) {
      console.error("Error deleting data:", error);
      showAlert(error.response?.data?.message || "Error deleting data. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setAccountName("");
    setTransactionType("debit");
    setDescription("");
    setDate("");
    setAmount("");
    setErrors({});
  };

  const toggleAccountExpand = (accountName) => {
    setExpandedAccounts(prev => ({
      ...prev,
      [accountName]: !prev[accountName]
    }));
  };

  const groupedData = ledgerData.reduce((acc, item) => {
    if (!acc[item.account_name]) {
      acc[item.account_name] = [];
    }
    acc[item.account_name].push(item);
    return acc;
  }, {});

  const AccountHeader = ({ accountName, expanded, onClick }) => {
    const totalDebits = groupedData[accountName]
      ?.filter(t => t.transaction_type === 'debit')
      ?.reduce((sum, t) => sum + t.amount, 0) || 0;
    
    const totalCredits = groupedData[accountName]
      ?.filter(t => t.transaction_type === 'credit')
      ?.reduce((sum, t) => sum + t.amount, 0) || 0;
    
    const balance = totalDebits - totalCredits;

    return (
      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8f9fa',
          p: 2,
          borderRadius: 1,
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: '#e9ecef',
            transform: 'translateY(-2px)'
          },
          mb: 1
        }}
        onClick={onClick}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: '#3998ff' }}>
            <AccountBalanceIcon />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {accountName}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Chip 
            label={`Debit: ₹${totalDebits.toFixed(2)}`} 
            color="error" 
            variant="outlined"
          />
          <Chip 
            label={`Credit: ₹${totalCredits.toFixed(2)}`} 
            color="success" 
            variant="outlined"
          />
          <Chip 
            label={`Balance: ₹${balance.toFixed(2)}`} 
            color={balance >= 0 ? 'primary' : 'error'}
            sx={{ fontWeight: 'bold' }}
          />
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ 
        mb: 4,
        p: 3,
        backgroundColor: '#3998ff',
        color: 'white',
        borderRadius: 2,
        boxShadow: 3
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Ledger Accounts
        </Typography>
        <Typography variant="subtitle1">
          Track all financial transactions by account
        </Typography>
      </Box>
      
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
          {alertMsg.message}
        </Alert>
      </Snackbar>

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
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Account Name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              error={Boolean(errors.accountName)}
              helperText={errors.accountName}
              required
              disabled={isLoading}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Transaction Type</FormLabel>
              <RadioGroup
                row
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
              >
                <FormControlLabel 
                  value="debit" 
                  control={<Radio />} 
                  label="Debit" 
                  disabled={isLoading}
                />
                <FormControlLabel 
                  value="credit" 
                  control={<Radio />} 
                  label="Credit" 
                  disabled={isLoading}
                />
              </RadioGroup>
              {errors.transactionType && (
                <Typography color="error" variant="caption">{errors.transactionType}</Typography>
              )}
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={Boolean(errors.description)}
              helperText={errors.description}
              required
              disabled={isLoading}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              error={Boolean(errors.date)}
              helperText={errors.date}
              required
              disabled={isLoading}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputProps={{ min: 0.01, step: 0.01 }}
              error={Boolean(errors.amount)}
              helperText={errors.amount}
              required
              disabled={isLoading}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isLoading ? "Processing..." : (isEditing ? "Update" : "Add")}
              </Button>
              {isEditing && (
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setIsEditing(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {isLoading && ledgerData.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper elevation={3} sx={{ 
          p: 3,
          borderRadius: 2
        }}>
          <Typography variant="h6" gutterBottom sx={{ 
            mb: 3,
            color: '#3998ff',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            📊 Ledger Entries
          </Typography>
          
          {Object.keys(groupedData).length > 0 ? (
            Object.keys(groupedData).map((accountName) => (
              <Box key={accountName} sx={{ mb: 4 }}>
                <AccountHeader 
                  accountName={accountName}
                  expanded={expandedAccounts[accountName]}
                  onClick={() => toggleAccountExpand(accountName)}
                />
                
                <Collapse in={expandedAccounts[accountName]}>
                  <TableContainer component={Paper} sx={{ mt: 1 }}>
                    <Table size="small" sx={{ minWidth: 650 }}>
                      <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Amount (₹)</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {groupedData[accountName].map((row) => (
                          <TableRow 
                            key={row._id}
                            sx={{ 
                              '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                              '&:hover': { backgroundColor: '#f1f1f1' }
                            }}
                          >
                            <TableCell>
                              {new Date(row.date).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </TableCell>
                            <TableCell>{row.description}</TableCell>
                            <TableCell>
                              <Chip 
                                label={row.transaction_type.toUpperCase()}
                                color={row.transaction_type === 'debit' ? 'error' : 'success'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>
                              ₹{row.amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <IconButton 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(row._id);
                                }}
                                color="primary"
                                sx={{ '&:hover': { backgroundColor: '#e3f2fd' } }}
                                disabled={isLoading}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(row._id);
                                }}
                                color="error"
                                sx={{ '&:hover': { backgroundColor: '#ffebee' } }}
                                disabled={isLoading}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Collapse>
              </Box>
            ))
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              No ledger entries found. Add your first entry above.
            </Typography>
          )}
        </Paper>
      )}

      {ledgerData.length > 0 && (
        <Box mt={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <DownloadPDFButton 
            documentType="ledger" 
            data={ledgerData} 
            fileName="ledger_report.pdf"
            sx={{
              backgroundColor: '#3998ff',
              color: 'white',
              '&:hover': {
                backgroundColor: '#2979ff'
              }
            }}
            disabled={isLoading}
          />
        </Box>
      )}
    </Container>
  );
};

export default LedgerForm;