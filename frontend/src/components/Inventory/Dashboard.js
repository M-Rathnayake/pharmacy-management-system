import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Tooltip,
  LinearProgress,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Badge,
  Paper,
  Container,
  Button,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Inventory,
  Warning,
  TrendingUp,
  TrendingDown,
  Refresh,
  LocalPharmacy,
  AttachMoney,
  Category,
  Home,
  Notifications,
  Add,
  Edit,
  Delete,
  ArrowBack,
  Search
} from '@mui/icons-material';
import { getMedicines } from '../../services/medicineService';
import { getTransactions } from '../../services/transactionService';
import { getAlerts } from '../../services/alertService';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
import dayjs from 'dayjs';

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
const primaryBlue = '#3998ff';
const lightBlue = '#e6f2ff';
const darkBlue = '#1a5cb3';
const accentBlue = '#82c9ff';
const successGreen = '#2e7d32';
const warningOrange = '#e65100';
const errorRed = '#c62828';
const navHoverColor = '#283593';
const navActiveColor = '#3949ab';

const drawerWidth = 240;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState({
    totalMedicines: 0,
    totalStock: 0,
    lowStockItems: 0,
    expiringItems: 0,
    totalValue: 0
  });
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  const [unresolvedAlertsCount, setUnresolvedAlertsCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [time, setTime] = useState(dayjs());
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => setTime(dayjs()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [medicines, transactions, alerts] = await Promise.all([
        getMedicines(),
        getTransactions(),
        getAlerts()
      ]);

      // Calculate summary statistics
      const totalStock = medicines.reduce((sum, med) => sum + med.stock, 0);
      const lowStockItems = medicines.filter(med => med.stock <= med.threshold).length;
      const expiringItems = medicines.filter(med => 
        dayjs(med.expiryDate).diff(dayjs(), 'day') < 30
      ).length;
      const totalValue = medicines.reduce((sum, med) => sum + (med.stock * (med.price || 0)), 0);

      setSummaryData({
        totalMedicines: medicines.length,
        totalStock,
        lowStockItems,
        expiringItems,
        totalValue
      });

      setUnresolvedAlertsCount(alerts.filter(alert => !alert.resolved).length);

      // Prepare chart data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = dayjs().subtract(i, 'day');
        return date.format('MMM D');
      }).reverse();

      const transactionCounts = last7Days.map(date => {
        return transactions.filter(t => 
          dayjs(t.createdAt).format('MMM D') === date
        ).length;
      });

      const transactionValues = last7Days.map(date => {
        return transactions
          .filter(t => dayjs(t.createdAt).format('MMM D') === date)
          .reduce((sum, t) => sum + (t.quantity * (t.price || 0)), 0);
      });

      setChartData({
        labels: last7Days,
        datasets: [
          {
            label: 'Transactions',
            data: transactionCounts,
            borderColor: primaryBlue,
            backgroundColor: lightBlue,
            tension: 0.4
          },
          {
            label: 'Revenue',
            data: transactionValues,
            borderColor: successGreen,
            backgroundColor: '#e8f5e9',
            tension: 0.4
          }
        ]
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Transaction Overview',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
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
        <Alert severity="error">Error loading data: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Left Navigation Drawer */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: darkBlue,
            color: 'white',
            borderRight: 'none',
            boxShadow: '2px 0 8px rgba(0,0,0,0.15)'
          },
        }}
        variant="permanent"
        anchor="left"
      >
        {/* Logo/Brand Section */}
        <Box sx={{ 
          p: 3, 
          display: 'flex', 
          alignItems: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <LocalPharmacy sx={{ fontSize: 32, mr: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Pharmacy IMS
          </Typography>
        </Box>

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
                <Category sx={{ color: 'white' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Transactions" 
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

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Container maxWidth="xl">
          {/* Header Section */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3 
          }}>
            <Typography variant="h4" component="h2" sx={{ color: darkBlue, fontWeight: 'bold' }}>
              Dashboard Overview
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                variant="outlined"
                placeholder="Search medicines..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 250 }}
              />
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/inventory/add')}
                sx={{ 
                  bgcolor: primaryBlue,
                  '&:hover': { bgcolor: darkBlue }
                }}
              >
                New Medicine
              </Button>
              <Tooltip title="Refresh data">
                <IconButton onClick={fetchDashboardData}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: 'white', 
                height: '100%',
                transition: 'transform 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': { 
                  transform: 'translateY(-3px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocalPharmacy sx={{ color: primaryBlue, mr: 1 }} />
                    <Typography variant="h6" color="textPrimary">Total Medicines</Typography>
                  </Box>
                  <Typography variant="h4" color="textPrimary">{summaryData.totalMedicines}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: 'white', 
                height: '100%',
                transition: 'transform 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': { 
                  transform: 'translateY(-3px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Warning sx={{ color: warningOrange, mr: 1 }} />
                    <Typography variant="h6" color="textPrimary">Low Stock Items</Typography>
                  </Box>
                  <Typography variant="h4" color="textPrimary">{summaryData.lowStockItems}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: 'white', 
                height: '100%',
                transition: 'transform 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': { 
                  transform: 'translateY(-3px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Warning sx={{ color: errorRed, mr: 1 }} />
                    <Typography variant="h6" color="textPrimary">Expiring Soon</Typography>
                  </Box>
                  <Typography variant="h4" color="textPrimary">{summaryData.expiringItems}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                bgcolor: 'white', 
                height: '100%',
                transition: 'transform 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': { 
                  transform: 'translateY(-3px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AttachMoney sx={{ color: successGreen, mr: 1 }} />
                    <Typography variant="h6" color="textPrimary">Total Value</Typography>
                  </Box>
                  <Typography variant="h4" color="textPrimary">
                    ${summaryData.totalValue.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts */}
          <Paper sx={{ 
            p: 3, 
            mb: 4,
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" color="textPrimary" gutterBottom>
                Transaction Overview
              </Typography>
            </Box>
            <Box sx={{ height: 400 }}>
              <Line options={chartOptions} data={chartData} />
            </Box>
          </Paper>

          {/* Quick Actions and System Status */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                bgcolor: 'white',
                transition: 'transform 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': { 
                  transform: 'translateY(-3px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent>
                  <Typography variant="h6" color="textPrimary" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => navigate('/inventory/add')}
                      sx={{ 
                        bgcolor: primaryBlue,
                        '&:hover': { bgcolor: darkBlue }
                      }}
                    >
                      Add Medicine
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Inventory />}
                      onClick={() => navigate('/inventory/medicines')}
                      sx={{ 
                        color: darkBlue,
                        borderColor: darkBlue,
                        '&:hover': {
                          borderColor: primaryBlue,
                          bgcolor: lightBlue
                        }
                      }}
                    >
                      View Stock
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                bgcolor: 'white',
                transition: 'transform 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': { 
                  transform: 'translateY(-3px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent>
                  <Typography variant="h6" color="textPrimary" gutterBottom>
                    System Status
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Low Stock Items
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(summaryData.lowStockItems / summaryData.totalMedicines) * 100}
                        sx={{ 
                          height: 8,
                          borderRadius: 4,
                          bgcolor: '#fff3e0',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: warningOrange
                          }
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Expiring Items
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(summaryData.expiringItems / summaryData.totalMedicines) * 100}
                        sx={{ 
                          height: 8,
                          borderRadius: 4,
                          bgcolor: '#ffebee',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: errorRed
                          }
                        }}
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard; 