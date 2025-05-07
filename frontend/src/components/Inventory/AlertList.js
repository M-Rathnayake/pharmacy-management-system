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
  TablePagination,
  Tabs,
  Tab
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
import { getAlerts, resolveAlert } from "../../services/alertService";
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
  const [activeTab, setActiveTab] = useState(0); // 0 for unresolved, 1 for resolved
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await getAlerts();
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
      await fetchAlerts(); // Refresh the list
      setError(null);
    } catch (error) {
      setError(error.message || "Failed to resolve alert. Please try again.");
    } finally {
      setResolveDialogOpen(false);
      setAlertToResolve(null);
    }
  };

  const handleConfirmResolveAll = async () => {
    try {
      const unresolvedAlerts = alerts.filter(alert => !alert.resolved);
      await Promise.all(unresolvedAlerts.map(alert => resolveAlert(alert._id)));
      await fetchAlerts();
      setError(null);
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0); // Reset to first page when changing tabs
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
      // First filter by resolved status
      if (activeTab === 0 && alert.resolved) return false;
      if (activeTab === 1 && !alert.resolved) return false;
      
      // Then apply type filter
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

  // Calculate summary statistics for unresolved alerts only
  const unresolvedAlerts = alerts.filter(alert => !alert.resolved);
  const totalAlerts = unresolvedAlerts.length;
  const lowStockAlerts = unresolvedAlerts.filter(alert => alert.type === 'low-stock').length;
  const expiringAlerts = unresolvedAlerts.filter(alert => alert.type === 'near-expiry').length;
  const expiredAlerts = unresolvedAlerts.filter(alert => alert.type === 'expired').length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <LinearProgress sx={{ width: '100%' }} />
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
          {activeTab === 0 && (
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
          )}
          <Tooltip title="Refresh alerts">
            <IconButton onClick={fetchAlerts}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label={`Unresolved Alerts (${unresolvedAlerts.length})`} />
          <Tab label={`Resolved Alerts (${alerts.length - unresolvedAlerts.length})`} />
        </Tabs>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Filter Type</InputLabel>
          <Select
            value={filterType}
            label="Filter Type"
            onChange={(e) => setFilterType(e.target.value)}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="low-stock">Low Stock</MenuItem>
            <MenuItem value="near-expiry">Near Expiry</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
      </Box>

      {/* Alerts Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Medicine</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAlerts.length > 0 ? (
              filteredAlerts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((alert) => (
                  <TableRow key={alert._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getAlertIcon(alert.type)}
                        <Typography>
                          {alert.type === 'low-stock' ? 'Low Stock' : 
                           alert.type === 'near-expiry' ? 'Near Expiry' : 
                           'Expired'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {alert.medicineId?.name || 'Unknown Medicine'}
                    </TableCell>
                    <TableCell>{alert.message}</TableCell>
                    <TableCell>
                      {dayjs(alert.createdAt).fromNow()}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={alert.resolved ? 'Resolved' : 'Active'}
                        color={alert.resolved ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {!alert.resolved && (
                        <Button
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleResolveClick(alert)}
                          color="success"
                          size="small"
                        >
                          Resolve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" color="textSecondary">
                    No alerts found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
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

      {/* Resolve Dialog */}
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
          <Button onClick={handleConfirmResolve} color="success" autoFocus>
            Resolve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resolve All Dialog */}
      <Dialog
        open={resolveAllDialogOpen}
        onClose={handleCloseResolveAllDialog}
      >
        <DialogTitle>Confirm Resolution</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to resolve all unresolved alerts?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResolveAllDialog}>Cancel</Button>
          <Button onClick={handleConfirmResolveAll} color="success" autoFocus>
            Resolve All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AlertList; 