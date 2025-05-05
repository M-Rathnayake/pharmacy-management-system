import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  TextField, Button, Grid, Box, Typography, Table, Container,
  TableBody, TableCell, TableHead, TableRow, TableContainer,
  Paper, IconButton, Alert, Snackbar, Avatar, Chip, MenuItem,
  CircularProgress
} from "@mui/material";
import { Assessment, Edit, Delete } from "@mui/icons-material";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DownloadPettyCashPDFButton = ({ documentType, data, fileName, sx }) => {
  const handleDownload = (openInViewer = false) => {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No data available for PDF generation');
      }

      const doc = new jsPDF();
      doc.setFont('helvetica', 'normal');

      // Add header
      doc.setFontSize(18);
      doc.setTextColor(57, 152, 255);
      doc.text('EsyPharma', 14, 20);

      // Add title
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`${documentType} Report`, 14, 30);

      // Add line separator
      doc.setDrawColor(57, 152, 255);
      doc.setLineWidth(0.5);
      doc.line(14, 35, 200, 35);

      // Prepare table data
      const columns = [
        { header: 'Date', dataKey: 'date' },
        { header: 'Description', dataKey: 'description' },
        { header: 'Receipt No', dataKey: 'receipt_no' },
        { header: 'Type', dataKey: 'transaction_type' },
        { header: 'Amount (Rs.)', dataKey: 'amount' },
        { header: 'Category', dataKey: 'category' },
        { header: 'Balance (Rs.)', dataKey: 'balance' },
      ];

      const rows = data.map((item) => ({
        date: item.date ? new Date(item.date).toLocaleDateString('en-IN') : 'N/A',
        description: item.description || 'N/A',
        receipt_no: item.receipt_no || '-',
        transaction_type: item.transaction_type || 'N/A',
        amount: (item.amount || 0).toLocaleString('en-IN'),
        category: item.category || 'other',
        balance: (item.balance || 0).toLocaleString('en-IN'),
      }));

      // Add table
      autoTable(doc, {
        startY: 40,
        head: [columns.map((col) => col.header)],
        body: rows.map((row) => columns.map((col) => row[col.dataKey])),
        headStyles: {
          fillColor: [57, 152, 255],
          textColor: 255,
          fontSize: 10,
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak',
        },
        columnStyles: {
          3: { cellWidth: 'auto', halign: 'center' }, // Type
          4: { cellWidth: 'auto', halign: 'right' },  // Amount
          6: { cellWidth: 'auto', halign: 'right' },  // Balance
        },
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width - 30,
          doc.internal.pageSize.height - 10
        );
      }

      const sanitizedFileName = (fileName || `${documentType}_report.pdf`).replace(/[^a-zA-Z0-9._-]/g, '_');

      if (openInViewer) {
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 30000);
      } else {
        doc.save(sanitizedFileName);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error.message}`);
    }
  };

  return (
    <div>
      <Button
        variant="contained"
        onClick={() => handleDownload(false)}
        sx={{
          backgroundColor: '#3998ff',
          color: 'white',
          '&:hover': { backgroundColor: '#2979ff' },
          mr: 1,
          ...sx,
        }}
      >
        Download PDF
      </Button>
      <Button
        variant="outlined"
        onClick={() => handleDownload(true)}
        sx={{
          borderColor: '#3998ff',
          color: '#3998ff',
          '&:hover': { borderColor: '#2979ff', color: '#2979ff' },
        }}
      >
        View PDF
      </Button>
    </div>
  );
};

const PettyCashForm = () => {
  const [formData, setFormData] = useState({
    date: "",
    description: "",
    receipt_no: "",
    transaction_type: "expense",
    amount: "",
    category: "other",
    notes: "",
    balance: ""
  });
  
  const [pettyCashData, setPettyCashData] = useState([]);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ open: false, message: "", severity: "error" });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    'office supplies',
    'travel',
    'entertainment',
    'utilities',
    'other'
  ];

  const showAlert = useCallback((message, severity) => {
    setAlert({ open: true, message, severity });
  }, []);

  const fetchPettyCashData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8080/api/pettycash");
      setPettyCashData(response.data || []);
    } catch (error) {
      showAlert(error.response?.data?.message || "Error fetching data", "error");
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => { fetchPettyCashData(); }, [fetchPettyCashData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === "amount" || name === "transaction_type") {
      const amount = Number(formData.amount) || 0;
      const transactionType = name === "transaction_type" ? value : formData.transaction_type;
      const calculatedBalance = transactionType === "income" ? amount : -amount;
      setFormData(prev => ({ ...prev, balance: calculatedBalance.toString() }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const date = new Date(formData.date);
    
    if (!formData.date) newErrors.date = "Date is required";
    else if (isNaN(date.getTime())) newErrors.date = "Invalid date";
    
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.receipt_no.trim()) newErrors.receipt_no = "Receipt number is required";
    
    if (!formData.amount) newErrors.amount = "Amount is required";
    else if (Number(formData.amount) <= 0) newErrors.amount = "Amount must be positive";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      date: formData.date,
      description: formData.description,
      receipt_no: formData.receipt_no,
      transaction_type: formData.transaction_type,
      amount: Number(formData.amount),
      balance: Number(formData.balance),
      category: formData.category,
      notes: formData.notes
    };

    try {
      if (isEditing) {
        await axios.put(`http://localhost:8080/api/pettycash/${editingId}`, payload);
        showAlert("Entry updated successfully", "success");
      } else {
        await axios.post("http://localhost:8080/api/pettycash", payload);
        showAlert("Entry added successfully", "success");
      }
      resetForm();
      fetchPettyCashData();
    } catch (error) {
      showAlert(error.response?.data?.error || "Operation failed", "error");
    }
  };

  const handleEdit = (id) => {
    const entry = pettyCashData.find(item => item.petty_id === id);
    if (!entry) return showAlert("Entry not found", "error");
    
    setFormData({
      date: entry.date.split('T')[0],
      description: entry.description,
      receipt_no: entry.receipt_no,
      transaction_type: entry.transaction_type,
      amount: entry.amount.toString(),
      category: entry.category || "other",
      notes: entry.notes || "",
      balance: entry.balance.toString()
    });
    setEditingId(id);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/pettycash/${id}`);
      showAlert("Entry deleted successfully", "success");
      fetchPettyCashData();
    } catch (error) {
      showAlert(error.response?.data?.error || "Delete failed", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      date: "",
      description: "",
      receipt_no: "",
      transaction_type: "expense",
      amount: "",
      category: "other",
      notes: "",
      balance: ""
    });
    setErrors({});
    setIsEditing(false);
    setEditingId(null);
  };

  // Calculate totals
  const totalIncome = pettyCashData
    .filter(item => item.transaction_type === "income")
    .reduce((sum, entry) => sum + (entry.amount || 0), 0);

  const totalExpenses = pettyCashData
    .filter(item => item.transaction_type === "expense")
    .reduce((sum, entry) => sum + (entry.amount || 0), 0);

  const currentBalance = totalIncome - totalExpenses;

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
          Petty Cash Management
        </Typography>
        <Typography variant="subtitle1">
          Track all small cash transactions and balances
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
        mb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: '#3998ff' }}>
            <Assessment />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Petty Cash Summary
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Chip 
            label={`Income: Rs.${totalIncome.toFixed(2)}`} 
            color="success" 
            variant="outlined"
          />
          <Chip 
            label={`Expenses: Rs.${totalExpenses.toFixed(2)}`} 
            color="error" 
            variant="outlined"
          />
          <Chip 
            label={`Balance: Rs.${currentBalance.toFixed(2)}`} 
            color={currentBalance >= 0 ? 'primary' : 'error'}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>
      </Box>

      {/* Alert Snackbar */}
      <Snackbar 
        open={alert.open} 
        autoHideDuration={6000} 
        onClose={() => setAlert(p => ({ ...p, open: false }))}
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
          {isEditing ? "✏️ Edit Entry" : "➕ Add New Entry"}
        </Typography>
        
        <Grid container spacing={3} component="form" onSubmit={handleSubmit}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth 
              label="Date *" 
              type="date"
              name="date"
              value={formData.date} 
              onChange={handleChange}
              error={!!errors.date} 
              helperText={errors.date}
              InputLabelProps={{ shrink: true }} 
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth 
              label="Receipt Number *"
              name="receipt_no"
              value={formData.receipt_no} 
              onChange={handleChange}
              error={!!errors.receipt_no} 
              helperText={errors.receipt_no}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth 
              label="Description *"
              name="description"
              value={formData.description} 
              onChange={handleChange}
              error={!!errors.description} 
              helperText={errors.description}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth 
              label="Transaction Type *"
              name="transaction_type"
              value={formData.transaction_type} 
              onChange={handleChange}
            >
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth 
              label="Amount (Rs.) *"
              type="number"
              name="amount"
              value={formData.amount} 
              onChange={handleChange}
              error={!!errors.amount} 
              helperText={errors.amount}
              inputProps={{ min: 0.01, step: 0.01 }}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth 
              label="Category"
              name="category"
              value={formData.category} 
              onChange={handleChange}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth 
              label="Balance (Rs.)"
              type="number"
              name="balance"
              value={formData.balance} 
              onChange={handleChange}
              InputProps={{ readOnly: true }}
              sx={{
                "& .MuiInputBase-input": {
                  color: formData.balance >= 0 ? '#2e7d32' : '#d32f2f',
                  fontWeight: 'bold'
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth 
              label="Notes"
              name="notes"
              value={formData.notes} 
              onChange={handleChange}
              multiline
              rows={2}
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

      {/* Entries Table */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ 
          mb: 3,
          color: '#3998ff',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          📊 Transaction History
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Receipt No</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Amount (Rs.)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pettyCashData.map((row) => (
                  <TableRow 
                    key={row.petty_id}
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
                    <TableCell>{row.receipt_no}</TableCell>
                    <TableCell>
                      <Chip 
                        label={row.transaction_type} 
                        color={row.transaction_type === 'income' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      color: row.transaction_type === 'income' ? '#2e7d32' : '#d32f2f',
                      fontWeight: 'bold'
                    }}>
                      {row.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {row.category.charAt(0).toUpperCase() + row.category.slice(1)}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={() => handleEdit(row.petty_id)}
                        color="primary"
                        sx={{ '&:hover': { backgroundColor: '#e3f2fd' } }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDelete(row.petty_id)}
                        color="error"
                        sx={{ '&:hover': { backgroundColor: '#ffebee' } }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Download/View PDF Buttons */}
      {pettyCashData.length > 0 && (
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <DownloadPettyCashPDFButton
              documentType="Petty Cash"
              data={pettyCashData}
              fileName="petty_cash_report"
            />
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default PettyCashForm;