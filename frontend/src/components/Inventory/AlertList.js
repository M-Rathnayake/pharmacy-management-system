import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
  Alert,
  Stack,
  Divider,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Timer as TimerIcon,
  Error as ErrorIcon,
  Search as SearchIcon,
  DoneAll as DoneAllIcon,
  ArrowBack
} from '@mui/icons-material';
import { getAllUnresolvedAlerts, resolveAlert } from "../../services/alertService";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate } from 'react-router-dom';

// Extend dayjs with the relativeTime plugin
dayjs.extend(relativeTime);

const AlertList = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolveAllDialogOpen, setResolveAllDialogOpen] = useState(false);
  const [alertToResolve, setAlertToResolve] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await getAllUnresolvedAlerts();
      setAlerts(data);
    } catch (error) {
      setError("Failed to fetch alerts: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveClick = (alert) => {
    setAlertToResolve(alert);
    setResolveDialogOpen(true);
  };

  const handleResolveAllClick = () => {
    setResolveAllDialogOpen(true);
  };

  const handleConfirmResolve = async () => {
    try {
      await resolveAlert(alertToResolve._id);
      fetchAlerts();
    } catch (error) {
      setError("Failed to resolve alert: " + error.message);
    } finally {
      setResolveDialogOpen(false);
    }
  };

  const handleConfirmResolveAll = async () => {
    try {
      // Resolve all alerts in parallel
      await Promise.all(alerts.map(alert => resolveAlert(alert._id)));
      fetchAlerts();
    } catch (error) {
      setError("Failed to resolve all alerts: " + error.message);
    } finally {
      setResolveAllDialogOpen(false);
    }
  };

  const handleCloseResolveDialog = () => {
    setResolveDialogOpen(false);
    setAlertToResolve(null);
  };

  const handleCloseResolveAllDialog = () => {
    setResolveAllDialogOpen(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'low-stock':
        return <LocalPharmacyIcon sx={{ color: '#e65100' }} />;
      case 'near-expiry':
        return <TimerIcon sx={{ color: '#c62828' }} />;
      case 'expired':
        return <ErrorIcon sx={{ color: '#d32f2f' }} />;
      default:
        return <WarningIcon sx={{ color: '#f57c00' }} />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'low-stock':
        return '#fff3e0';
      case 'near-expiry':
        return '#ffebee';
      case 'expired':
        return '#ffcdd2';
      default:
        return '#fff3e0';
    }
  };

  const getAlertTextColor = (type) => {
    switch (type) {
      case 'low-stock':
        return '#e65100';
      case 'near-expiry':
        return '#c62828';
      case 'expired':
        return '#d32f2f';
      default:
        return '#f57c00';
    }
  };

  const filteredAlerts = alerts
    .filter(alert => {
      const matchesType = filterType === 'all' || alert.type === filterType;
      const matchesSearch = alert.message.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return a.type.localeCompare(b.type);
    });

  // Calculate summary statistics
  const totalAlerts = alerts.length;
  const lowStockAlerts = alerts.filter(alert => alert.type === 'low-stock').length;
  const expiringAlerts = alerts.filter(alert => alert.type === 'near-expiry').length;
  const expiredAlerts = alerts.filter(alert => alert.type === 'expired').length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <LinearProgress sx={{ width: '100%' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
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
              color: '#1a5cb3',
              '&:hover': {
                backgroundColor: '#e6f2ff'
              }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h2" sx={{ color: '#1a5cb3', fontWeight: 'bold' }}>
            Alerts
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<DoneAllIcon />}
            onClick={handleResolveAllClick}
            sx={{ 
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#388e3c' }
            }}
          >
            Resolve All
          </Button>
          <Tooltip title="Refresh alerts">
            <IconButton onClick={fetchAlerts}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e6f2ff', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon sx={{ color: '#1a5cb3', mr: 1 }} />
                <Typography variant="h6" color="#1a5cb3">Total Alerts</Typography>
              </Box>
              <Typography variant="h4">{totalAlerts}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff3e0', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalPharmacyIcon sx={{ color: '#e65100', mr: 1 }} />
                <Typography variant="h6" color="#e65100">Low Stock</Typography>
              </Box>
              <Typography variant="h4">{lowStockAlerts}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#ffebee', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TimerIcon sx={{ color: '#c62828', mr: 1 }} />
                <Typography variant="h6" color="#c62828">Expiring Soon</Typography>
              </Box>
              <Typography variant="h4">{expiringAlerts}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#ffcdd2', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ErrorIcon sx={{ color: '#d32f2f', mr: 1 }} />
                <Typography variant="h6" color="#d32f2f">Expired</Typography>
              </Box>
              <Typography variant="h4">{expiredAlerts}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={filterType}
                label="Filter by Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="low-stock">Low Stock</MenuItem>
                <MenuItem value="near-expiry">Expiring Soon</MenuItem>
                <MenuItem value="expired">Expired</MenuItem>
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
                <MenuItem value="date">Date (Newest First)</MenuItem>
                <MenuItem value="type">Alert Type</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Alerts Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAlerts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((alert) => (
                <TableRow 
                  key={alert._id}
                  sx={{ 
                    bgcolor: getAlertColor(alert.type),
                    '&:hover': {
                      bgcolor: `${getAlertColor(alert.type)}dd`
                    }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getAlertIcon(alert.type)}
                      <Typography 
                        sx={{ 
                          ml: 1,
                          color: getAlertTextColor(alert.type),
                          textTransform: 'capitalize'
                        }}
                      >
                        {alert.type.replace('-', ' ')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{alert.message}</TableCell>
                  <TableCell>
                    <Chip 
                      label={dayjs(alert.createdAt).fromNow()}
                      size="small"
                      sx={{ bgcolor: 'rgba(255, 255, 255, 0.8)' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleResolveClick(alert)}
                      size="small"
                      sx={{ 
                        bgcolor: '#4caf50',
                        '&:hover': { bgcolor: '#388e3c' }
                      }}
                    >
                      Resolve
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAlerts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Resolve Confirmation Dialog */}
      <Dialog
        open={resolveDialogOpen}
        onClose={handleCloseResolveDialog}
      >
        <DialogTitle>Confirm Resolution</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this alert as resolved?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResolveDialog}>Cancel</Button>
          <Button 
            onClick={handleConfirmResolve} 
            color="success"
            variant="contained"
          >
            Resolve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resolve All Confirmation Dialog */}
      <Dialog
        open={resolveAllDialogOpen}
        onClose={handleCloseResolveAllDialog}
      >
        <DialogTitle>Confirm Resolve All</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark all alerts as resolved? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResolveAllDialog}>Cancel</Button>
          <Button 
            onClick={handleConfirmResolveAll} 
            color="success"
            variant="contained"
          >
            Resolve All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AlertList; 