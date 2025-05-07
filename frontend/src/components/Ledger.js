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
  Select,
  MenuItem,
  InputLabel,
  CircularProgress,
  Switch,
  FormGroup
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import DownloadPDFButton from "./DownloadPDFButton";

const LedgerForm = () => {
  const [formData, setFormData] = useState({
    accountName: "",
    accountCode: "",
    accountType: "",
    openingBalance: 0,
    balanceType: "debit",
    isActive: true,
    taxApplicable: false,
    taxRate: 0,
    reconciliationFrequency: "monthly",
    notes: ""
  });

  const [ledgerData, setLedgerData] = useState([]);
  const [errors, setErrors] = useState({});
  const [alertMsg, setAlertMsg] = useState({ open: false, message: "", severity: "error" });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedAccounts, setExpandedAccounts] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Account types
  const accountTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'];
  const reconciliationFrequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'annually', 'never'];

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
        initialExpanded[item._id] = false;
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for account code
    if (name === 'accountCode') {
      // Convert to uppercase and remove any invalid characters
      const formattedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const validateForm = () => {
    let formErrors = {};
    
    if (!formData.accountName) formErrors.accountName = "Account name is required";
    if (!formData.accountCode) formErrors.accountCode = "Account code is required";
    if (formData.accountCode && !/^[A-Z]{3,4}\d{3}$/.test(formData.accountCode)) {
      formErrors.accountCode = "Account code must be in format: 3-4 uppercase letters followed by 3 numbers (e.g., CASH001)";
    }
    if (!formData.accountType) formErrors.accountType = "Account type is required";
    if (!formData.openingBalance && formData.openingBalance !== 0) formErrors.openingBalance = "Opening balance is required";
    
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

    try {
      let response;
      if (!isEditing) {
        response = await axios.post("http://localhost:8080/api/ledger", formData);
        showAlert("Ledger account created successfully", "success");
      } else {
        response = await axios.put(`http://localhost:8080/api/ledger/${editingId}`, formData);
        showAlert("Ledger account updated successfully", "success");
        setIsEditing(false);
        setEditingId(null);
      }

      resetForm();
      await fetchLedgerData();
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Error submitting data. Please try again.";
      const errorDetails = error.response?.data?.details;
      
      if (errorDetails) {
        if (Array.isArray(errorDetails)) {
          showAlert(errorDetails.join(", "), "error");
        } else {
          showAlert(`${errorMessage}: ${errorDetails}`, "error");
        }
      } else {
        showAlert(errorMessage, "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id) => {
    const data = ledgerData.find((item) => item._id === id);
    if (data) {
      setFormData({
        accountName: data.accountName,
        accountCode: data.accountCode,
        accountType: data.accountType,
        openingBalance: data.openingBalance,
        balanceType: data.balanceType,
        isActive: data.isActive,
        taxApplicable: data.taxApplicable,
        taxRate: data.taxRate || 0,
        reconciliationFrequency: data.reconciliationFrequency,
        notes: data.notes || ""
      });
      setEditingId(id);
      setIsEditing(true);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsLoading(true);
      await axios.delete(`http://localhost:8080/api/ledger/${id}`);
      showAlert("Ledger account deleted successfully", "success");
      await fetchLedgerData();
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Error deleting ledger account";
      showAlert(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      setIsLoading(true);
      await axios.patch(`http://localhost:8080/api/ledger/${id}/toggle-status`);
      showAlert("Ledger account status updated successfully", "success");
      await fetchLedgerData();
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Error updating ledger status";
      showAlert(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      accountName: "",
      accountCode: "",
      accountType: "",
      openingBalance: 0,
      balanceType: "debit",
      isActive: true,
      taxApplicable: false,
      taxRate: 0,
      reconciliationFrequency: "monthly",
      notes: ""
    });
    setErrors({});
  };

  const toggleAccountExpand = (id) => {
    setExpandedAccounts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
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
          Ledger Accounts Management
        </Typography>
        <Typography variant="subtitle1">
          Manage your chart of accounts
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
          {isEditing ? "✏️ Edit Account" : "➕ Add New Account"}
        </Typography>
        
        <Grid container spacing={3} component="form" onSubmit={handleSubmit}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Account Name"
              name="accountName"
              value={formData.accountName}
              onChange={handleInputChange}
              error={Boolean(errors.accountName)}
              helperText={errors.accountName}
              required
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Account Code"
              name="accountCode"
              value={formData.accountCode}
              onChange={handleInputChange}
              error={Boolean(errors.accountCode)}
              helperText={errors.accountCode || "Format: 3-4 uppercase letters followed by 3 numbers (e.g., CASH001)"}
              required
              disabled={isLoading || isEditing}
              inputProps={{
                maxLength: 7,
                pattern: "^[A-Z]{3,4}\\d{3}$",
                title: "3-4 uppercase letters followed by 3 numbers (e.g., CASH001)"
              }}
              placeholder="e.g., CASH001"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={Boolean(errors.accountType)}>
              <InputLabel>Account Type *</InputLabel>
              <Select
                name="accountType"
                value={formData.accountType}
                onChange={handleInputChange}
                label="Account Type *"
                required
                disabled={isLoading}
              >
                {accountTypes.map(type => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
              {errors.accountType && (
                <Typography color="error" variant="caption">{errors.accountType}</Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Opening Balance"
              name="openingBalance"
              type="number"
              value={formData.openingBalance}
              onChange={handleInputChange}
              inputProps={{ min: 0, step: 0.01 }}
              error={Boolean(errors.openingBalance)}
              helperText={errors.openingBalance}
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Balance Type *</FormLabel>
              <RadioGroup
                row
                name="balanceType"
                value={formData.balanceType}
                onChange={handleInputChange}
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
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Reconciliation Frequency</InputLabel>
              <Select
                name="reconciliationFrequency"
                value={formData.reconciliationFrequency}
                onChange={handleInputChange}
                label="Reconciliation Frequency"
                disabled={isLoading}
              >
                {reconciliationFrequencies.map(freq => (
                  <MenuItem key={freq} value={freq}>
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    name="taxApplicable"
                    checked={formData.taxApplicable}
                    onChange={handleSwitchChange}
                    color="primary"
                  />
                }
                label="Tax Applicable"
              />
            </FormGroup>
          </Grid>

          {formData.taxApplicable && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tax Rate (%)"
                name="taxRate"
                type="number"
                value={formData.taxRate}
                onChange={handleInputChange}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                disabled={isLoading || !formData.taxApplicable}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              multiline
              rows={3}
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
                {isLoading ? "Processing..." : (isEditing ? "Update Account" : "Add Account")}
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
            📊 Ledger Accounts
          </Typography>
          
          {ledgerData.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Account Code</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Account Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Balance Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Balance</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ledgerData.map((account) => (
                    <React.Fragment key={account._id}>
                      <TableRow 
                        hover
                        sx={{ '&:hover': { cursor: 'pointer' } }}
                        onClick={() => toggleAccountExpand(account._id)}
                      >
                        <TableCell>{account.accountCode}</TableCell>
                        <TableCell sx={{ fontWeight: 'medium' }}>{account.accountName}</TableCell>
                        <TableCell>
                          <Chip 
                            label={account.accountType.toUpperCase()}
                            color={
                              account.accountType === 'asset' ? 'primary' : 
                              account.accountType === 'liability' ? 'secondary' : 
                              account.accountType === 'equity' ? 'success' : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={account.balanceType.toUpperCase()}
                            color={account.balanceType === 'debit' ? 'error' : 'success'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          {account.openingBalance.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={account.isActive ? 'Active' : 'Inactive'}
                            color={account.isActive ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(account._id);
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
                              handleDelete(account._id);
                            }}
                            color="error"
                            sx={{ '&:hover': { backgroundColor: '#ffebee' } }}
                            disabled={isLoading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ padding: 0 }} colSpan={7}>
                          <Collapse in={expandedAccounts[account._id]}>
                            <Box sx={{ p: 3, backgroundColor: '#fafafa' }}>
                              <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="subtitle1" gutterBottom>
                                    <strong>Account Details</strong>
                                  </Typography>
                                  {account.taxApplicable && (
                                    <Typography>
                                      <strong>Tax Rate:</strong> {account.taxRate}%
                                    </Typography>
                                  )}
                                  <Typography>
                                    <strong>Reconciliation:</strong> {account.reconciliationFrequency}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="subtitle1" gutterBottom>
                                    <strong>Additional Information</strong>
                                  </Typography>
                                  <Typography>
                                    <strong>Created:</strong> {new Date(account.createdAt).toLocaleString()}
                                  </Typography>
                                  <Typography>
                                    <strong>Last Updated:</strong> {new Date(account.updatedAt).toLocaleString()}
                                  </Typography>
                                  {account.notes && (
                                    <Typography>
                                      <strong>Notes:</strong> {account.notes}
                                    </Typography>
                                  )}
                                </Grid>
                              </Grid>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              No ledger accounts found. Add your first account above.
            </Typography>
          )}
        </Paper>
      )}

      {ledgerData.length > 0 && (
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
            🖨️ Export Ledger Accounts
          </Typography>
          <DownloadPDFButton
            documentType="ledger"
            data={ledgerData}
            fileName="ledger_accounts.pdf"
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

export default LedgerForm;