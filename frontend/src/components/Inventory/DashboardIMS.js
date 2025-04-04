import React, { useState, useEffect } from 'react';
import { 
  Box, Drawer, List, ListItem, ListItemButton, ListItemText,
  IconButton, Badge, TextField, Card, CardContent,
  Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, CircularProgress, Alert as MuiAlert, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { Notifications, Add, Edit, Delete } from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import dayjs from 'dayjs';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getMedicines, deleteMedicine, getMockTransactions } from "../../services/medicineService";
import { getAllUnresolvedAlerts } from "../../services/alertService";

const drawerWidth = 240;

// Color constants
const primaryBlue = '#3998ff';
const lightBlue = '#e6f2ff';
const darkBlue = '#1a5cb3';
const accentBlue = '#82c9ff';

// Mock data generator based on current medicines
const generateStockData = (medicines) => {
  const now = dayjs();
  return [
    {
      date: now.subtract(2, 'days').format('MMM D'),
      totalStock: medicines.reduce((sum, m) => sum + (m.stock || 0), 0),
      lowStock: medicines.filter(m => (m.stock || 0) < (m.threshold || 0)).length
    },
    {
      date: now.subtract(1, 'day').format('MMM D'),
      totalStock: medicines.reduce((sum, m) => sum + (m.stock || 0) * 0.9, 0),
      lowStock: medicines.filter(m => (m.stock || 0) < (m.threshold || 0)).length + 1
    },
    {
      date: now.format('MMM D'),
      totalStock: medicines.reduce((sum, m) => sum + (m.stock || 0), 0),
      lowStock: medicines.filter(m => (m.stock || 0) < (m.threshold || 0)).length
    }
  ];
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Card sx={{ 
        padding: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #ddd',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{label}</Typography>
        <Typography variant="body2">Total Stock: {payload[0].value}</Typography>
        <Typography variant="body2" color="#ff6b6b">
          Low Stock Items: {payload[1].value}
        </Typography>
      </Card>
    );
  }
  return null;
};

const Dashboard = () => {
  const [time, setTime] = useState(dayjs());
  const [medicines, setMedicines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState(null);
  const [unresolvedAlertsCount, setUnresolvedAlertsCount] = useState(0);
  const [mockTransactions, setMockTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  const fetchData = async () => {
    try {
      const [medicinesData, alertsData] = await Promise.all([
        getMedicines(),
        getAllUnresolvedAlerts()
      ]);
      
      setMedicines(Array.isArray(medicinesData) ? medicinesData : []);
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
      setUnresolvedAlertsCount(alertsData?.length || 0);
      setMockTransactions(getMockTransactions());
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => setTime(dayjs()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate metrics
  const totalStock = medicines.reduce((sum, med) => sum + (med.stock || 0), 0);
  const lowStock = medicines.filter(med => (med.stock || 0) < (med.threshold || 0)).length;
  const expiringSoon = medicines.filter(med => 
    dayjs(med.expiryDate).diff(dayjs(), 'day') < 30
  ).length;
  const pendingRestock = (alerts || []).filter(a => !a.resolved).length;

  // Generate chart data
  const stockData = generateStockData(medicines);
  const averageThreshold = medicines.length > 0 
    ? medicines.reduce((sum, m) => sum + (m.threshold || 0), 0) / medicines.length
    : 0;

  // Filter medicines based on search term
  const filteredMedicines = medicines.filter(med => {
    const searchLower = searchTerm.toLowerCase().trim();
    return (
      med.name.toLowerCase().includes(searchLower) ||
      (med.category && med.category.toLowerCase().includes(searchLower)) ||
      (med.barcode && med.barcode.toString().toLowerCase().includes(searchLower))
    );
  });

  // Handle edit medicine
  const handleEdit = (medicineId) => {
    navigate(`/edit/${medicineId}`);
  };

  // Handle delete confirmation dialog open
  const handleDeleteClick = (medicine) => {
    setMedicineToDelete(medicine);
    setDeleteDialogOpen(true);
  };

  // Handle actual delete
  const handleConfirmDelete = async () => {
    try {
      await deleteMedicine(medicineToDelete._id);
      await fetchData(); 
      setDeleteDialogOpen(false);
    } catch (err) {
      setError(`Failed to delete medicine: ${err.message}`);
    }
  };

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setMedicineToDelete(null);
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
        <MuiAlert severity="error">Error loading data: {error}</MuiAlert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Left Navigation Drawer */}
      <Drawer
        sx={{
          width: drawerWidth,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: lightBlue
          },
        }}
        variant="permanent"
      >
        <List>
          {[
            { text: 'Home', path: '/' },
            { text: 'Stock Management', path: '/medicines' },
            { text: 'Transaction Logs', path: '/transactions' },
            { text: 'Alerts', path: '/alerts' },
            { text: 'Settings', path: '/settings' }
          ].map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                component={Link} 
                to={item.path}
                selected={location.pathname === item.path}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: primaryBlue,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: darkBlue
                    }
                  }
                }}
              >
                <ListItemText primary={item.text} />
                {item.text === 'Alerts' && unresolvedAlertsCount > 0 && (
                  <Badge 
                    badgeContent={unresolvedAlertsCount} 
                    color="error" 
                    sx={{ ml: 1 }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        
        <Box sx={{ mt: 'auto', p: 2, bgcolor: darkBlue, color: 'white' }}>
          <Typography>Riley Carter</Typography>
          <Typography variant="body2">Hey@email.com</Typography>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'white' }}>
        {/* Top Action Bar */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 3,
          mb: 4
        }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/add')}
            sx={{ 
              backgroundColor: primaryBlue,
              color: 'white',
              '&:hover': { backgroundColor: darkBlue }
            }}
          >
            New Medicine
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField 
              variant="outlined" 
              placeholder="Search medicines..." 
              size="small" 
              sx={{ width: 250 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Typography variant="body1">
              {time.format('MMM D, YYYY h:mm A')}
            </Typography>
            <IconButton onClick={() => navigate('/alerts')}>
              <Badge badgeContent={pendingRestock} color="error">
                <Notifications color="action" />
              </Badge>
            </IconButton>
          </Box>
        </Box>

        {/* Status Cards Section */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          mb: 4,
          flexWrap: 'wrap',
          justifyContent: 'center',
          '& > *': { 
            flex: '1 1 180px',
            minWidth: '180px',
            maxWidth: '220px',
            textAlign: 'center',
            transition: 'transform 0.2s',
            '&:hover': { 
              transform: 'translateY(-3px)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            }
          }
        }}>
          <Card sx={{ 
            bgcolor: primaryBlue, 
            color: 'white',
            background: `linear-gradient(135deg, ${primaryBlue} 0%, ${darkBlue} 100%)`
          }}>
            <CardContent>
              <Typography variant="h6">Total Stock</Typography>
              <Typography variant="h4">{totalStock}</Typography>
            </CardContent>
          </Card>

          <Card 
            sx={{ 
              bgcolor: lightBlue,
              color: darkBlue,
              cursor: 'pointer',
              background: `linear-gradient(135deg, ${lightBlue} 0%, ${accentBlue} 100%)`
            }}
            onClick={() => navigate('/alerts', { state: { filter: 'low-stock' } })}
          >
            <CardContent>
              <Typography variant="h6">Low Stock</Typography>
              <Typography variant="h4">{lowStock}</Typography>
            </CardContent>
          </Card>

          <Card 
            sx={{ 
              bgcolor: accentBlue,
              color: 'white',
              cursor: 'pointer',
              background: `linear-gradient(135deg, ${accentBlue} 0%, ${primaryBlue} 100%)`
            }}
            onClick={() => navigate('/alerts', { state: { filter: 'expiry' } })}
          >
            <CardContent>
              <Typography variant="h6">Expiring Soon</Typography>
              <Typography variant="h4">{expiringSoon}</Typography>
            </CardContent>
          </Card>

          <Card sx={{ 
            bgcolor: darkBlue, 
            color: 'white',
            background: `linear-gradient(135deg, ${darkBlue} 0%, #0d47a1 100%)`
          }}>
            <CardContent>
              <Typography variant="h6">Pending Restock</Typography>
              <Typography variant="h4">{pendingRestock}</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Enhanced Stock Chart */}
        <Box sx={{ 
          mb: 4, 
          width: '60%', 
          mx: 'auto',
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          p: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          backgroundColor: lightBlue
        }}>
          <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', color: darkBlue }}>
            Stock Overview
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: darkBlue }}
                axisLine={{ stroke: darkBlue }}
              />
              <YAxis 
                tick={{ fill: darkBlue }}
                axisLine={{ stroke: darkBlue }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="totalStock" 
                name="Total Stock"
                stroke={primaryBlue} 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, stroke: primaryBlue, strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="lowStock" 
                name="Low Stock Items"
                stroke="#ff6b6b" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6, stroke: '#ff6b6b', strokeWidth: 2 }}
              />
              <ReferenceLine 
                y={averageThreshold} 
                label={{ 
                  value: 'Avg Threshold', 
                  position: 'top',
                  fill: darkBlue,
                  fontSize: 12
                }} 
                stroke={darkBlue}
                strokeDasharray="3 3" 
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Inventory Table */}
        <TableContainer 
          component={Paper} 
          sx={{ 
            border: `1px solid ${primaryBlue}`,
            borderRadius: 2,
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: lightBlue }}>
                <TableCell sx={{ fontWeight: 600, color: darkBlue }}>Medicine</TableCell>
                <TableCell sx={{ fontWeight: 600, color: darkBlue }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600, color: darkBlue }}>Stock</TableCell>
                <TableCell sx={{ fontWeight: 600, color: darkBlue }}>Threshold</TableCell>
                <TableCell sx={{ fontWeight: 600, color: darkBlue }}>Expiry</TableCell>
                <TableCell sx={{ fontWeight: 600, color: darkBlue }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMedicines.map((med) => (
                <TableRow 
                  key={med._id}
                  hover
                  sx={{ '&:last-child td': { borderBottom: 0 } }}
                >
                  <TableCell>{med.name}</TableCell>
                  <TableCell>{med.category}</TableCell>
                  <TableCell>{med.stock}</TableCell>
                  <TableCell>{med.threshold}</TableCell>
                  <TableCell>
                    {dayjs(med.expiryDate).format('MMM D, YYYY')}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => handleEdit(med._id)}
                      sx={{ 
                        mr: 1,
                        color: primaryBlue,
                        borderColor: primaryBlue,
                        '&:hover': {
                          backgroundColor: lightBlue,
                          borderColor: darkBlue
                        }
                      }}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDeleteClick(med)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ color: darkBlue }}>
          {"Confirm Delete"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete {medicineToDelete?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDeleteDialog}
            sx={{ color: primaryBlue }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            sx={{ 
              backgroundColor: primaryBlue,
              color: 'white',
              '&:hover': {
                backgroundColor: darkBlue
              }
            }}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;