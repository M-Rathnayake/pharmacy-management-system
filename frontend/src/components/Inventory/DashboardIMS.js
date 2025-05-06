import React, { useState, useEffect } from 'react';
import { 
  Box, Drawer, List, ListItem, ListItemButton, ListItemText,
  IconButton, Badge, TextField, Card, CardContent,
  Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, CircularProgress, Alert as MuiAlert, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions,
  ListItemIcon, Chip, Divider, Stack, Grid, Link as MuiLink
} from '@mui/material';
import { 
  Notifications, 
  Add, 
  Edit, 
  Delete, 
  ArrowBack,
  Home,
  Inventory,
  Category,
  Warning,
  TrendingUp
} from '@mui/icons-material';
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
import CountUp from 'react-countup';

const drawerWidth = 240;

// Color constants
const primaryBlue = '#3998ff';
const lightBlue = '#e6f2ff';
const darkBlue = '#1a5cb3';
const accentBlue = '#82c9ff';
const navHoverColor = '#283593';
const navActiveColor = '#3949ab';

// Color constants for status
const successGreen = '#2e7d32';
const warningOrange = '#e65100';
const errorRed = '#c62828';
const infoBlue = '#3998ff';

// Add light shades for backgrounds
const lightGreen = '#e8f5e9';
const lightOrange = '#fff3e0';
const lightRed = '#ffebee';
const lightInfo = '#e3f2fd';

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
    navigate(`/inventory/medicines/edit/${medicineId}`, { state: { from: location.pathname } });
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

  // Helper for greeting
  const getGreeting = () => {
    const hour = time.hour();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Get up to 3 recent unresolved alerts
  const recentAlerts = alerts.filter(a => !a.resolved).slice(0, 3);

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
            bgcolor: darkBlue,
            color: 'white'
          },
        }}
        variant="permanent"
      >
        <List>
          {/* Back to Staff Dashboard */}
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              component={Link} 
              to="/"
              sx={{
                borderRadius: '12px',
                '&:hover': {
                  bgcolor: navHoverColor
                }
              }}
            >
              <ListItemIcon>
                <ArrowBack sx={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Back to Staff Dashboard" 
                primaryTypographyProps={{
                  fontWeight: 'normal'
                }}
              />
            </ListItemButton>
          </ListItem>

          {/* Dashboard */}
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              component={Link} 
              to="/inventory"
              selected={location.pathname === '/inventory'}
              sx={{
                borderRadius: '12px',
                '&.Mui-selected': {
                  bgcolor: navActiveColor,
                  '&:hover': {
                    bgcolor: navActiveColor
                  }
                },
                '&:hover': {
                  bgcolor: navHoverColor
                }
              }}
            >
              <ListItemIcon>
                <Home sx={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Dashboard" 
                primaryTypographyProps={{
                  fontWeight: location.pathname === '/inventory' ? 'bold' : 'normal'
                }}
              />
            </ListItemButton>
          </ListItem>

          {/* Stock Management */}
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              component={Link} 
              to="/inventory/medicines"
              selected={location.pathname === '/inventory/medicines'}
              sx={{
                borderRadius: '12px',
                '&.Mui-selected': {
                  bgcolor: navActiveColor,
                  '&:hover': {
                    bgcolor: navActiveColor
                  }
                },
                '&:hover': {
                  bgcolor: navHoverColor
                }
              }}
            >
              <ListItemIcon>
                <Inventory sx={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Stock Management" 
                primaryTypographyProps={{
                  fontWeight: location.pathname === '/inventory/medicines' ? 'bold' : 'normal'
                }}
              />
            </ListItemButton>
          </ListItem>

          {/* Transactions */}
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              component={Link} 
              to="/inventory/transactions"
              selected={location.pathname === '/inventory/transactions'}
              sx={{
                borderRadius: '12px',
                '&.Mui-selected': {
                  bgcolor: navActiveColor,
                  '&:hover': {
                    bgcolor: navActiveColor
                  }
                },
                '&:hover': {
                  bgcolor: navHoverColor
                }
              }}
            >
              <ListItemIcon>
                <TrendingUp sx={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Transaction History" 
                primaryTypographyProps={{
                  fontWeight: location.pathname === '/inventory/transactions' ? 'bold' : 'normal'
                }}
              />
            </ListItemButton>
          </ListItem>

          {/* Alerts */}
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              component={Link} 
              to="/inventory/alerts"
              selected={location.pathname === '/inventory/alerts'}
              sx={{
                borderRadius: '12px',
                '&.Mui-selected': {
                  bgcolor: navActiveColor,
                  '&:hover': {
                    bgcolor: navActiveColor
                  }
                },
                '&:hover': {
                  bgcolor: navHoverColor
                }
              }}
            >
              <ListItemIcon>
                <Badge badgeContent={unresolvedAlertsCount} color="error">
                  <Warning sx={{ color: 'white' }} />
                </Badge>
              </ListItemIcon>
              <ListItemText 
                primary="Alerts" 
                primaryTypographyProps={{
                  fontWeight: location.pathname === '/inventory/alerts' ? 'bold' : 'normal'
                }}
              />
            </ListItemButton>
          </ListItem>

          {/* Add Medicine */}
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton 
              component={Link} 
              to="/inventory/add"
              selected={location.pathname === '/inventory/add'}
              sx={{
                borderRadius: '12px',
                '&.Mui-selected': {
                  bgcolor: navActiveColor,
                  '&:hover': {
                    bgcolor: navActiveColor
                  }
                },
                '&:hover': {
                  bgcolor: navHoverColor
                }
              }}
              onClick={() => navigate('/inventory/add', { state: { from: location.pathname } })}
            >
              <ListItemIcon>
                <Add sx={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Add Medicine" 
                primaryTypographyProps={{
                  fontWeight: location.pathname === '/inventory/add' ? 'bold' : 'normal'
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content Area */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'white', maxWidth: '100vw', overflowX: 'hidden' }}>
        {/* Top Bar/Header (Staff Dashboard style) */}
        <Box sx={{
          width: '100%',
          boxSizing: 'border-box',
          bgcolor: darkBlue,
          color: 'white',
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 2.5 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 2,
          mb: 3,
          boxShadow: '0 2px 8px rgba(26,92,179,0.10)',
          overflowX: 'visible',
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            Inventory
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 400, textAlign: 'right' }}>
            {getGreeting()}, Staff!
          </Typography>
        </Box>

        {/* HERO SUMMARY SECTION */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 2,
          mb: 2,
          bgcolor: '#f5f8fd',
          borderRadius: 3,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: darkBlue, mb: 0.5 }}>
            Inventory Overview
          </Typography>
          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
            Your inventory at a glance
          </Typography>
          <Grid container spacing={2} justifyContent="center" sx={{ width: '100%' }}>
            <Grid item xs={6} sm={3} md={3}>
              <Card sx={{ bgcolor: lightGreen, py: 1, px: 0.5, borderRadius: 2, boxShadow: '0 1px 4px rgba(46,125,50,0.08)', textAlign: 'center', minHeight: 90 }}>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Inventory sx={{ color: successGreen, fontSize: 28, mb: 0.5 }} />
                  <Typography variant="subtitle2" color="textPrimary">Total Stock</Typography>
                  <Typography variant="h5" sx={{ color: successGreen, fontWeight: 700, lineHeight: 1.1 }}>
                    <CountUp end={totalStock} duration={1.2} separator="," />
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3} md={3}>
              <Card sx={{ bgcolor: lightOrange, py: 1, px: 0.5, borderRadius: 2, boxShadow: '0 1px 4px rgba(230,81,0,0.08)', textAlign: 'center', minHeight: 90 }}>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Warning sx={{ color: warningOrange, fontSize: 28, mb: 0.5 }} />
                  <Typography variant="subtitle2" color="textPrimary">Low Stock</Typography>
                  <Typography variant="h5" sx={{ color: warningOrange, fontWeight: 700, lineHeight: 1.1 }}>
                    <CountUp end={lowStock} duration={1.2} separator="," />
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3} md={3}>
              <Card sx={{ bgcolor: lightRed, py: 1, px: 0.5, borderRadius: 2, boxShadow: '0 1px 4px rgba(198,40,40,0.08)', textAlign: 'center', minHeight: 90 }}>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Warning sx={{ color: errorRed, fontSize: 28, mb: 0.5 }} />
                  <Typography variant="subtitle2" color="textPrimary">Expiring Soon</Typography>
                  <Typography variant="h5" sx={{ color: errorRed, fontWeight: 700, lineHeight: 1.1 }}>
                    <CountUp end={expiringSoon} duration={1.2} separator="," />
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3} md={3}>
              <Card sx={{ bgcolor: lightInfo, py: 1, px: 0.5, borderRadius: 2, boxShadow: '0 1px 4px rgba(57,152,255,0.08)', textAlign: 'center', minHeight: 90 }}>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Notifications sx={{ color: infoBlue, fontSize: 28, mb: 0.5 }} />
                  <Typography variant="subtitle2" color="textPrimary">Pending Restock</Typography>
                  <Typography variant="h5" sx={{ color: infoBlue, fontWeight: 700, lineHeight: 1.1 }}>
                    <CountUp end={pendingRestock} duration={1.2} separator="," />
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          {/* Key Insights Row */}
          <Stack direction="row" spacing={1.5} sx={{ mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Chip label={`${lowStock} low stock`} sx={{ bgcolor: lightOrange, color: warningOrange, fontWeight: 600, fontSize: 14, height: 28 }} icon={<Warning sx={{ color: warningOrange }} />} />
            <Chip label={`${expiringSoon} expiring soon`} sx={{ bgcolor: lightRed, color: errorRed, fontWeight: 600, fontSize: 14, height: 28 }} icon={<Warning sx={{ color: errorRed }} />} />
            <Chip label={`${pendingRestock} unresolved alerts`} sx={{ bgcolor: lightInfo, color: infoBlue, fontWeight: 600, fontSize: 14, height: 28 }} icon={<Notifications sx={{ color: infoBlue }} />} />
          </Stack>
        </Box>

        {/* Stock Overview Graph */}
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '100vw', overflowX: 'auto' }}>
          <Paper elevation={2} sx={{
            mb: 3,
            width: '100%',
            maxWidth: 800,
            borderRadius: 3,
            p: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            backgroundColor: 'white',
          }}>
            <Typography variant="subtitle1" sx={{ mb: 1, textAlign: 'center', color: darkBlue, fontWeight: 600 }}>
              Stock Overview
            </Typography>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={stockData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: darkBlue, fontWeight: 500, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: darkBlue, fontWeight: 500, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#fafafa' }} />
                <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, bottom: 0 }} />
                <Line 
                  type="monotone" 
                  dataKey="totalStock" 
                  name="Total Stock"
                  stroke={successGreen} 
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: successGreen, stroke: 'white', strokeWidth: 1 }}
                  activeDot={{ r: 5, stroke: successGreen, strokeWidth: 2, fill: 'white' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="lowStock" 
                  name="Low Stock Items"
                  stroke={warningOrange} 
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: warningOrange, stroke: 'white', strokeWidth: 1 }}
                  activeDot={{ r: 5, stroke: warningOrange, strokeWidth: 2, fill: 'white' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
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