import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  CircularProgress,
  Alert as MuiAlert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Badge,
  Card,
  CardContent,
  Grid,
  Chip,
  Tooltip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Notifications,
  ArrowBack,
  Home,
  Inventory,
  Category,
  Warning,
  Search,
  FilterList,
  Refresh
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getMedicines, deleteMedicine } from "../../services/medicineService";
import { getAllUnresolvedAlerts } from "../../services/alertService";
import dayjs from 'dayjs';

// Color constants
const primaryBlue = '#3998ff';
const lightBlue = '#e6f2ff';
const darkBlue = '#1a5cb3';
const accentBlue = '#82c9ff';
const navHoverColor = '#283593';
const navActiveColor = '#3949ab';

const drawerWidth = 240;

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState(null);
  const [unresolvedAlertsCount, setUnresolvedAlertsCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  
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
  }, []);

  // Filter and sort medicines
  const filteredMedicines = medicines
    .filter(med => {
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        med.name.toLowerCase().includes(searchLower) ||
        (med.category && med.category.toLowerCase().includes(searchLower)) ||
        (med.barcode && med.barcode.toString().toLowerCase().includes(searchLower));
      
      const matchesCategory = filterCategory === 'all' || med.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'stock') return b.stock - a.stock;
      if (sortBy === 'expiry') return new Date(a.expiryDate) - new Date(b.expiryDate);
      return 0;
    });

  // Calculate summary statistics
  const totalMedicines = medicines.length;
  const lowStockMedicines = medicines.filter(med => med.stock <= med.threshold).length;
  const expiringMedicines = medicines.filter(med => {
    const expiryDate = new Date(med.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;
  const expiredMedicines = medicines.filter(med => new Date(med.expiryDate) < new Date()).length;

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
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography variant="h4" component="h2" sx={{ color: darkBlue, fontWeight: 'bold' }}>
          Stock Management
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/inventory/add', { state: { from: location.pathname } })}
            sx={{ 
              bgcolor: primaryBlue,
              '&:hover': { bgcolor: darkBlue }
            }}
          >
            New Medicine
          </Button>
          <Tooltip title="Refresh data">
            <IconButton onClick={fetchData}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: lightBlue, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Inventory sx={{ color: darkBlue, mr: 1 }} />
                <Typography variant="h6" color={darkBlue}>Total Medicines</Typography>
              </Box>
              <Typography variant="h4">{totalMedicines}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff3e0', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Warning sx={{ color: '#e65100', mr: 1 }} />
                <Typography variant="h6" color="#e65100">Low Stock</Typography>
              </Box>
              <Typography variant="h4">{lowStockMedicines}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#ffebee', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Warning sx={{ color: '#c62828', mr: 1 }} />
                <Typography variant="h6" color="#c62828">Expiring Soon</Typography>
              </Box>
              <Typography variant="h4">{expiringMedicines}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#ffcdd2', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Warning sx={{ color: '#d32f2f', mr: 1 }} />
                <Typography variant="h6" color="#d32f2f">Expired</Typography>
              </Box>
              <Typography variant="h4">{expiredMedicines}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                label="Category"
                onChange={(e) => setFilterCategory(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterList />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">All Categories</MenuItem>
                {Array.from(new Set(medicines.map(med => med.category))).map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                label="Sort by"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="stock">Stock Level</MenuItem>
                <MenuItem value="expiry">Expiry Date</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

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
            {filteredMedicines.map((med) => {
              const isLowStock = med.stock <= med.threshold;
              const isExpiringSoon = new Date(med.expiryDate) - new Date() <= 30 * 24 * 60 * 60 * 1000;
              const isExpired = new Date(med.expiryDate) < new Date();

              return (
                <TableRow 
                  key={med._id}
                  hover
                  sx={{ 
                    '&:last-child td': { borderBottom: 0 },
                    bgcolor: isExpired ? '#ffcdd2' : isExpiringSoon ? '#ffebee' : isLowStock ? '#fff3e0' : 'inherit'
                  }}
                >
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {med.name}
                    </Typography>
                    {med.barcode && (
                      <Typography variant="caption" color="textSecondary">
                        Barcode: {med.barcode}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={med.category} 
                      size="small"
                      sx={{ 
                        bgcolor: lightBlue,
                        color: darkBlue
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: isLowStock ? '#e65100' : 'inherit',
                          fontWeight: 500
                        }}
                      >
                        {med.stock}
                      </Typography>
                      {isLowStock && (
                        <Chip 
                          label="Low Stock" 
                          size="small"
                          color="warning"
                          icon={<Warning />}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{med.threshold}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        variant="body1"
                        sx={{ 
                          color: isExpired ? '#d32f2f' : isExpiringSoon ? '#c62828' : 'inherit'
                        }}
                      >
                        {dayjs(med.expiryDate).format('MMM D, YYYY')}
                      </Typography>
                      {isExpired && (
                        <Chip 
                          label="Expired" 
                          size="small"
                          color="error"
                          icon={<Warning />}
                        />
                      )}
                      {isExpiringSoon && !isExpired && (
                        <Chip 
                          label="Expiring Soon" 
                          size="small"
                          color="warning"
                          icon={<Warning />}
                        />
                      )}
                    </Box>
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
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

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

export default MedicineList;