import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper,
  Button, IconButton, Tooltip, CircularProgress, Alert,
  Chip, TextField, InputAdornment,
  Card, CardContent, Grid,
  MenuItem, Select, FormControl, InputLabel,
  Stack, Container
} from '@mui/material';
import { 
  Search, Refresh, PictureAsPdf, TrendingUp, TrendingDown,
  FilterList, DateRange, ArrowBack
} from '@mui/icons-material';
import { getTransactions } from "../../services/transactionService";
import dayjs from 'dayjs';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import { useNavigate } from 'react-router-dom';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

// Color constants
const primaryBlue = '#1a5cb3';
const lightBlue = '#e6f2ff';
const successGreen = '#2e7d32';
const warningOrange = '#e65100';
const errorRed = '#c62828';

const TransactionLogs = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [transactionType, setTransactionType] = useState('all');
  const [summary, setSummary] = useState({
    totalTransactions: 0,
    totalRestocks: 0,
    totalAdjustments: 0,
    totalSales: 0,
    totalValue: 0,
    averageTransactionValue: 0
  });
  const navigate = useNavigate();

  // Chart data state
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    let filtered = transactions;

    // Apply search filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(txn => {
        const medicineName = txn.medicineId?.name || '';
        const type = txn.type || '';
        return (
          medicineName.toLowerCase().includes(searchTermLower) ||
          type.toLowerCase().includes(searchTermLower)
        );
      });
    }

    // Apply date range filter
    if (dateRange !== 'all') {
      const now = dayjs();
      filtered = filtered.filter(txn => {
        const txnDate = dayjs(txn.timestamp);
        switch (dateRange) {
          case 'today':
            return txnDate.isSame(now, 'day');
          case 'week':
            return txnDate.isAfter(now.subtract(7, 'day'));
          case 'month':
            return txnDate.isAfter(now.subtract(30, 'day'));
          default:
            return true;
        }
      });
    }

    // Apply transaction type filter
    if (transactionType !== 'all') {
      filtered = filtered.filter(txn => txn.type === transactionType);
    }

    setFilteredTransactions(filtered);

    // Calculate summary
    const summary = {
      totalTransactions: filtered.length,
      totalRestocks: filtered.filter(t => t.type === 'restock').length,
      totalAdjustments: filtered.filter(t => t.type === 'adjustment').length,
      totalSales: filtered.filter(t => t.type === 'sale').length,
      totalValue: filtered.reduce((sum, t) => sum + (t.quantity * (t.medicineId?.price || 0)), 0),
      averageTransactionValue: filtered.length > 0 
        ? filtered.reduce((sum, t) => sum + (t.quantity * (t.medicineId?.price || 0)), 0) / filtered.length 
        : 0
    };
    setSummary(summary);

    // Prepare chart data
    const last7Days = Array.from({ length: 7 }, (_, i) => 
      dayjs().subtract(i, 'day').format('MMM D')
    ).reverse();

    const dailyData = last7Days.map(day => {
      const dayTransactions = filtered.filter(txn => 
        dayjs(txn.timestamp).format('MMM D') === day
      );
      return {
        date: day,
        count: dayTransactions.length,
        value: dayTransactions.reduce((sum, t) => 
          sum + (t.quantity * (t.medicineId?.price || 0)), 0
        )
      };
    });

    setChartData({
      labels: dailyData.map(d => d.date),
      datasets: [
        {
          label: 'Transaction Count',
          data: dailyData.map(d => d.count),
          borderColor: primaryBlue,
          backgroundColor: lightBlue,
          tension: 0.4
        },
        {
          label: 'Transaction Value',
          data: dailyData.map(d => d.value),
          borderColor: successGreen,
          backgroundColor: '#e8f5e9',
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    });
  }, [searchTerm, transactions, dateRange, transactionType]);

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

  const downloadPDF = () => {
    import('jspdf').then(({ default: jsPDF }) => {
      import('jspdf-autotable').then(() => {
        const doc = new jsPDF();
        
        // Add EsyPharma logo/text to the top right
        doc.setFontSize(16);
        doc.setTextColor(57, 152, 255);
        doc.text('EsyPharma', doc.internal.pageSize.width - 30, 20, { align: 'right' });
        
        // Main report title
        doc.setFontSize(18);
        doc.setTextColor(57, 152, 255); 
        doc.text('Transaction Report', 14, 20);
        
        // Generation timestamp
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
        
        // Table data with fixed stock level arrows
        const tableData = filteredTransactions.map(txn => [
          dayjs(txn.timestamp).format('MMM D, YYYY'),
          txn.medicineId?.name || 'N/A',
          txn.type.toUpperCase(),
          txn.quantity,
          `${txn.previousStock} → ${txn.newStock}`, // Using text arrow instead of special character
          txn.notes || 'N/A'
        ]);
  
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
          },
          columnStyles: {
            4: { // Stock Change column
              cellWidth: 40,
              halign: 'center'
            }
          }
        });
        
        doc.save(`transactions_${new Date().toISOString().slice(0,10)}.pdf`);
      });
    });
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Transaction Count'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Transaction Value'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
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
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            onClick={() => navigate('/inventory')}
            sx={{ 
              color: primaryBlue,
              '&:hover': {
                backgroundColor: lightBlue
              }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h2" sx={{ color: primaryBlue, fontWeight: 'bold' }}>
            Transaction History
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<PictureAsPdf />}
            onClick={downloadPDF}
            sx={{ 
              bgcolor: primaryBlue,
              '&:hover': { bgcolor: '#154c8c' }
            }}
          >
            Export PDF
          </Button>
          <IconButton 
            onClick={loadTransactions}
            sx={{ 
              color: primaryBlue,
              '&:hover': {
                backgroundColor: lightBlue
              }
            }}
          >
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: lightBlue }}>
            <CardContent>
              <Typography variant="h6" color={primaryBlue}>Total Transactions</Typography>
              <Typography variant="h4">{summary.totalTransactions}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Typography variant="h6" color={successGreen}>Total Value</Typography>
              <Typography variant="h4">${summary.totalValue.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography variant="h6" color={warningOrange}>Avg. Value</Typography>
              <Typography variant="h4">${summary.averageTransactionValue.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#ffebee' }}>
            <CardContent>
              <Typography variant="h6" color={errorRed}>Sales</Typography>
              <Typography variant="h4">{summary.totalSales}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters Section */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 2, minWidth: 300 }}
        />
        
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Date Range</InputLabel>
          <Select
            value={dateRange}
            label="Date Range"
            onChange={(e) => setDateRange(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <DateRange />
              </InputAdornment>
            }
          >
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="today">Today</MenuItem>
            <MenuItem value="week">Last 7 Days</MenuItem>
            <MenuItem value="month">Last 30 Days</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={transactionType}
            label="Type"
            onChange={(e) => setTransactionType(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <FilterList />
              </InputAdornment>
            }
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="restock">Restock</MenuItem>
            <MenuItem value="sale">Sale</MenuItem>
            <MenuItem value="adjustment">Adjustment</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Transaction Trends Chart */}
      <Card sx={{ mb: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: primaryBlue }}>Transaction Trends</Typography>
          <Box sx={{ height: 300 }}>
            <Line data={chartData} options={chartOptions} />
          </Box>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: lightBlue }}>
              <TableCell sx={{ color: primaryBlue, fontWeight: 600 }}>Date & Time</TableCell>
              <TableCell sx={{ color: primaryBlue, fontWeight: 600 }}>Medicine</TableCell>
              <TableCell sx={{ color: primaryBlue, fontWeight: 600 }}>Type</TableCell>
              <TableCell align="right" sx={{ color: primaryBlue, fontWeight: 600 }}>Quantity</TableCell>
              <TableCell align="right" sx={{ color: primaryBlue, fontWeight: 600 }}>Stock Change</TableCell>
              <TableCell sx={{ color: primaryBlue, fontWeight: 600 }}>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((txn) => (
                <TableRow 
                  key={txn._id} 
                  hover
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: txn.type === 'restock' ? '#e8f5e9' : 
                                     txn.type === 'sale' ? '#ffebee' : '#fff3e0',
                      opacity: 0.8
                    }
                  }}
                >
                  <TableCell>
                    <Typography variant="body2">
                      {dayjs(txn.timestamp).format('MMM D, YYYY')}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {dayjs(txn.timestamp).format('h:mm A')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {txn.medicineId?.name || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {txn.medicineId?.barcode || 'No barcode'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={txn.type.toUpperCase()} 
                      size="small"
                      icon={txn.type === 'restock' ? <TrendingUp /> : <TrendingDown />}
                      sx={{
                        backgroundColor: 
                          txn.type === 'restock' ? '#e8f5e9' : 
                          txn.type === 'sale' ? '#ffebee' : '#fff3e0',
                        color: 
                          txn.type === 'restock' ? successGreen : 
                          txn.type === 'sale' ? errorRed : warningOrange,
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {txn.quantity}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'flex-end',
                      gap: 1
                    }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: txn.newStock > txn.previousStock ? successGreen : errorRed,
                          fontWeight: 500
                        }}
                      >
                        {txn.previousStock} → {txn.newStock}
                      </Typography>
                      {txn.newStock > txn.previousStock ? 
                        <TrendingUp sx={{ color: successGreen, fontSize: 16 }} /> : 
                        <TrendingDown sx={{ color: errorRed, fontSize: 16 }} />
                      }
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {txn.notes || 'No notes provided'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
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