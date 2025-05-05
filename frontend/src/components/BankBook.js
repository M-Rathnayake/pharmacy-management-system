import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  TextField, Button, Grid, Box, Typography, Table, Container,
  TableBody, TableCell, TableHead, TableRow, TableContainer,
  Paper, IconButton, Alert, Snackbar, Avatar, Chip
} from "@mui/material";
import { AccountBalance, Edit, Delete } from "@mui/icons-material";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DownloadBankBookPDFButton = ({ documentType, data, fileName, sx }) => {
  const handleDownload = (openInViewer = false) => {
    try {
      // Validate data
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No data available for PDF generation');
      }

      const doc = new jsPDF();

      // Set default font to avoid undefined font errors
      doc.setFont('helvetica', 'normal');

      // Add header
      doc.setFontSize(18);
      doc.setTextColor(57, 152, 255); // #3998ff
      doc.text('EsyPharma', 14, 20);

      // Add title
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0); // Black
      doc.text(`${documentType} Report`, 14, 30);

      // Add line separator
      doc.setDrawColor(57, 152, 255); // #3998ff
      doc.setLineWidth(0.5);
      doc.line(14, 35, 200, 35);

      // Prepare table data
      const columns = [
        { header: 'Date', dataKey: 'date' },
        { header: 'Description', dataKey: 'description' },
        { header: 'Voucher No', dataKey: 'voucher_no' },
        { header: 'Deposits (Rs.)', dataKey: 'deposits' },
        { header: 'Withdrawal (Rs.)', dataKey: 'withdrawal' },
        { header: 'Balance (Rs.)', dataKey: 'balance' },
      ];

      const rows = data.map((item) => {
        // Validate item
        if (
          !item.date ||
          !item.description ||
          typeof item.deposits !== 'number' ||
          typeof item.withdrawal !== 'number' ||
          typeof item.balance !== 'number'
        ) {
          console.warn('Invalid data item:', item);
          return {
            date: item.date ? new Date(item.date).toLocaleDateString('en-IN') : 'N/A',
            description: item.description || 'N/A',
            voucher_no: item.voucher_no || '-',
            deposits: (typeof item.deposits === 'number' ? item.deposits : 0).toLocaleString('en-IN'),
            withdrawal: (typeof item.withdrawal === 'number' ? item.withdrawal : 0).toLocaleString('en-IN'),
            balance: (typeof item.balance === 'number' ? item.balance : 0).toLocaleString('en-IN'),
          };
        }

        return {
          date: new Date(item.date).toLocaleDateString('en-IN'),
          description: item.description,
          voucher_no: item.voucher_no || '-',
          deposits: item.deposits.toLocaleString('en-IN'),
          withdrawal: item.withdrawal.toLocaleString('en-IN'),
          balance: item.balance.toLocaleString('en-IN'),
        };
      });

      // Add table
      autoTable(doc, {
        startY: 40,
        head: [columns.map((col) => col.header)],
        body: rows.map((row) => columns.map((col) => row[col.dataKey])),
        headStyles: {
          fillColor: [57, 152, 255], // #3998ff
          textColor: 255, // White
          fontSize: 10,
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240], // Light gray
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak',
        },
        columnStyles: {
          0: { cellWidth: 'auto' }, // Date
          1: { cellWidth: 'auto' }, // Description
          2: { cellWidth: 'auto' }, // Voucher No
          3: { cellWidth: 'auto', halign: 'right' }, // Deposits
          4: { cellWidth: 'auto', halign: 'right' }, // Withdrawal
          5: { cellWidth: 'auto', halign: 'right' }, // Balance
        },
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal'); // Reset font for footer
        doc.setFontSize(10);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width - 30,
          doc.internal.pageSize.height - 10
        );
      }

      // Sanitize fileName
      const sanitizedFileName = (fileName || `${documentType}_report.pdf`).replace(
        /[^a-zA-Z0-9._-]/g,
        '_'
      );

      if (openInViewer) {
        // Generate Blob URL for viewing
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
        // Revoke URL after 30 seconds
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 30000);
      } else {
        // Trigger download
        doc.save(sanitizedFileName);
      }
    } catch (error) {
      console.error('Error generating PDF:', error.message, error.stack);
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

const BankBookForm = () => {
  const [formData, setFormData] = useState({
    date: "", description: "", voucher_no: "", deposits: "", withdrawal: "", balance: ""
  });
  const [bankBookData, setBankBookData] = useState([]);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ open: false, message: "", severity: "error" });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const showAlert = useCallback((message, severity) => {
    setAlert({ open: true, message, severity });
  }, []);

  const fetchBankBookData = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/bankbook");
      setBankBookData(response.data);
    } catch (error) {
      showAlert(error.response?.data?.message || "Error fetching data", "error");
    }
  }, [showAlert]);

  useEffect(() => { fetchBankBookData(); }, [fetchBankBookData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === "deposits" || name === "withdrawal") {
      const depositsValue = name === "deposits" ? value : formData.deposits;
      const withdrawalValue = name === "withdrawal" ? value : formData.withdrawal;
      const calculatedBalance = (Number(depositsValue) || 0) - (Number(withdrawalValue) || 0);
      setFormData(prev => ({ ...prev, balance: calculatedBalance.toString() }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const date = new Date(formData.date);
    
    if (!formData.date) newErrors.date = "Date is required";
    else if (isNaN(date.getTime())) newErrors.date = "Invalid date";
    else if (date.getFullYear() < 2000) newErrors.date = "Year must be ≥ 2000";
    
    if (!formData.description.trim()) newErrors.description = "Description is required";
    
    if (formData.deposits === "" && formData.withdrawal === "") {
      newErrors.deposits = "Enter at least deposits or withdrawal";
    } else {
      if (formData.deposits < 0) newErrors.deposits = "Cannot be negative";
      if (formData.withdrawal < 0) newErrors.withdrawal = "Cannot be negative";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      date: formData.date,
      description: formData.description,
      voucher_no: formData.voucher_no,
      deposits: Number(formData.deposits) || 0,
      withdrawal: Number(formData.withdrawal) || 0,
      balance: Number(formData.balance)
    };

    try {
      if (isEditing) {
        await axios.put(`http://localhost:8080/api/bankbook/${editingId}`, payload);
        showAlert("Entry updated successfully", "success");
      } else {
        await axios.post("http://localhost:8080/api/bankbook", payload);
        showAlert("Entry added successfully", "success");
      }
      resetForm();
      fetchBankBookData();
    } catch (error) {
      showAlert(error.response?.data?.error || "Operation failed", "error");
    }
  };

  const handleEdit = (id) => {
    const entry = bankBookData.find(item => item.bankbook_id === id);
    if (!entry) return showAlert("Entry not found", "error");
    
    setFormData({
      date: entry.date.split('T')[0],
      description: entry.description,
      voucher_no: entry.voucher_no,
      deposits: entry.deposits.toString(),
      withdrawal: entry.withdrawal.toString(),
      balance: entry.balance.toString()
    });
    setEditingId(id);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/bankbook/${id}`);
      showAlert("Entry deleted successfully", "success");
      fetchBankBookData();
    } catch (error) {
      showAlert(error.response?.data?.error || "Delete failed", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      date: "", description: "", voucher_no: "", deposits: "", withdrawal: "", balance: ""
    });
    setErrors({});
    setIsEditing(false);
    setEditingId(null);
  };

  // Calculate totals for the account header
  const totalDeposits = bankBookData.reduce((sum, entry) => sum + entry.deposits, 0);
  const totalWithdrawals = bankBookData.reduce((sum, entry) => sum + entry.withdrawal, 0);
  const currentBalance = totalDeposits - totalWithdrawals;

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
          Bank Book
        </Typography>
        <Typography variant="subtitle1">
          Track all bank transactions and balances
        </Typography>
      </Box>
      
      {/* Account Summary Header */}
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
            <AccountBalance />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Bank Account
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Chip 
            label={`Deposits: Rs.${totalDeposits.toFixed(2)}`} 
            color="success" 
            variant="outlined"
          />
          <Chip 
            label={`Withdrawals: Rs.${totalWithdrawals.toFixed(2)}`} 
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
              label="Voucher Number"
              name="voucher_no"
              value={formData.voucher_no} 
              onChange={handleChange}
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
              fullWidth 
              label="Deposits (Rs.)"
              type="number"
              name="deposits"
              value={formData.deposits} 
              onChange={handleChange}
              error={!!errors.deposits} 
              helperText={errors.deposits}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth 
              label="Withdrawal (Rs.)"
              type="number"
              name="withdrawal"
              value={formData.withdrawal} 
              onChange={handleChange}
              error={!!errors.withdrawal} 
              helperText={errors.withdrawal}
              inputProps={{ min: 0, step: 0.01 }}
            />
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
        
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Voucher No</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Deposits (Rs.)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Withdrawal (Rs.)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Balance (Rs.)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bankBookData.map((row) => (
                <TableRow 
                  key={row.bankbook_id}
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
                  <TableCell>{row.voucher_no || '-'}</TableCell>
                  <TableCell sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
                    {row.deposits.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                    {row.withdrawal.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    {row.balance.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => handleEdit(row.bankbook_id)}
                      color="primary"
                      sx={{ '&:hover': { backgroundColor: '#e3f2fd' } }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(row.bankbook_id)}
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
      </Paper>

      {/* Download/View PDF Buttons */}
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <DownloadBankBookPDFButton
            documentType="Bank Book"
            data={bankBookData}
            fileName="bank_book_report"
          />
        </Box>
      </Paper>
    </Container>
  );
};

export default BankBookForm;