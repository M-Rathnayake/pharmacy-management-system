import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper,
  Button, IconButton, Tooltip, CircularProgress, Alert,
  Chip, TextField, InputAdornment
} from '@mui/material';
import { Delete, Search, Refresh, PictureAsPdf } from '@mui/icons-material';
import { getTransactions } from "../../services/transactionService";
import dayjs from 'dayjs';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Color constants
const primaryBlue = '#3998ff';
const lightBlue = '#e6f2ff';
const darkBlue = '#1a5cb3';

const TransactionLogs = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    const filtered = transactions.filter(txn => {
      const medicineName = txn.medicineId?.name || '';
      const type = txn.type || '';
      const searchTermLower = searchTerm.toLowerCase();
      
      return (
        medicineName.toLowerCase().includes(searchTermLower) ||
        type.toLowerCase().includes(searchTermLower)
      );
    });
    setFilteredTransactions(filtered);
  }, [searchTerm, transactions]);

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const pathParts = window.location.pathname.split('/');
      const medicineId = pathParts[pathParts.length - 1];
      const isSpecificView = pathParts.includes('medicine');
      
      const txns = await getTransactions(isSpecificView ? medicineId : null);
      
      setTransactions(txns);
      setFilteredTransactions(txns);
    } catch (err) {
      setError(err.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const clearTransactions = () => {
    localStorage.removeItem('mockTransactions');
    setTransactions([]);
    setFilteredTransactions([]);
  };

  const deleteTransaction = (id) => {
    const updated = transactions.filter(txn => txn.transactionId !== id);
    localStorage.setItem('mockTransactions', JSON.stringify(updated));
    setTransactions(updated);
    setFilteredTransactions(updated);
  };

  const downloadPDF = () => {
    
    import('jspdf').then(({ default: jsPDF }) => {
      import('jspdf-autotable').then(() => {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.setTextColor(57, 152, 255); 
        doc.text('Transaction Report', 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
        
        const tableData = filteredTransactions.map(txn => [
          dayjs(txn.timestamp).format('MMM D, YYYY'),
          txn.medicineId?.name || 'N/A',
          txn.type.toUpperCase(),
          txn.quantity,
          `${txn.previousStock} → ${txn.newStock}`,
          txn.notes || 'N/A'
        ]);
  
        // Add table
        doc.autoTable({
          startY: 35,
          head: [['Date', 'Medicine', 'Type', 'Quantity', 'Stock Change', 'Notes']],
          body: tableData,
          theme: 'grid',
          headStyles: {
            fillColor: [57, 152, 255], 
            textColor: 255
          },
          alternateRowStyles: {
            fillColor: [230, 242, 255] 
          }
        });
        
        doc.save(`transactions_${new Date().toISOString().slice(0,10)}.pdf`);
      });
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error loading transactions: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: darkBlue }}>
        Inventory Transactions
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <TextField
          variant="outlined"
          placeholder="Search transactions..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ 
            width: 300,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: primaryBlue,
              },
              '&:hover fieldset': {
                borderColor: darkBlue,
              },
            }
          }}
        />
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<PictureAsPdf />}
            onClick={downloadPDF}
            disabled={filteredTransactions.length === 0}
            sx={{
              backgroundColor: primaryBlue,
              color: 'white',
              '&:hover': { backgroundColor: darkBlue },
              '&:disabled': { backgroundColor: lightBlue }
            }}
          >
            Export PDF
          </Button>
          
          <Tooltip title="Refresh transactions">
            <IconButton 
              onClick={loadTransactions} 
              sx={{ 
                border: `1px solid ${primaryBlue}`,
                color: primaryBlue,
                '&:hover': {
                  backgroundColor: lightBlue
                }
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
          
          <Button 
            variant="outlined" 
            color="error"
            startIcon={<Delete />}
            onClick={clearTransactions}
            disabled={transactions.length === 0}
          >
            Clear All
          </Button>
        </Box>
      </Box>

      <TableContainer 
        component={Paper} 
        sx={{ 
          border: `1px solid ${primaryBlue}`,
          borderRadius: 1,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: lightBlue }}>
              <TableCell sx={{ color: darkBlue, fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ color: darkBlue, fontWeight: 600 }}>Medicine</TableCell>
              <TableCell sx={{ color: darkBlue, fontWeight: 600 }}>Type</TableCell>
              <TableCell align="right" sx={{ color: darkBlue, fontWeight: 600 }}>Qty</TableCell>
              <TableCell align="right" sx={{ color: darkBlue, fontWeight: 600 }}>Stock Change</TableCell>
              <TableCell sx={{ color: darkBlue, fontWeight: 600 }}>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((txn) => (
                <TableRow key={txn._id} hover>
                  <TableCell>{dayjs(txn.timestamp).format('MMM D, YYYY h:mm A')}</TableCell>
                  <TableCell>
                    {txn.medicineId?.name || 'N/A'}
                    {txn.medicineId && (
                      <Typography variant="caption" display="block" color="textSecondary">
                        ID: {txn.medicineId._id || txn.medicineId}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={txn.type.toUpperCase()} 
                      sx={{
                        backgroundColor: 
                          txn.type === 'restock' ? lightBlue : 
                          txn.type === 'sale' ? '#ffebee' : '#fff8e1',
                        color: 
                          txn.type === 'restock' ? darkBlue : 
                          txn.type === 'sale' ? '#c62828' : '#e65100'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">{txn.quantity}</TableCell>
                  <TableCell align="right">
                    <Box component="span" sx={{ color: txn.newStock > txn.previousStock ? darkBlue : '#c62828' }}>
                      {txn.previousStock} → {txn.newStock}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {txn.notes || 'No notes provided'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" color="textSecondary">
                    No transactions found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TransactionLogs;