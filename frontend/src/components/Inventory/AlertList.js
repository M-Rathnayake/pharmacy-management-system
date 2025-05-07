import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
  Alert,
  Stack,
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
  Tab,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
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

// Color constants
const primaryBlue = '#1a5cb3';
const lightBlue = '#e6f2ff';
const successGreen = '#2e7d32';
const warningOrange = '#e65100';
const errorRed = '#c62828';

const AlertList = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolveAllDialogOpen, setResolveAllDialogOpen] = useState(false);
  const [alertToResolve, setAlertToResolve] = useState(null);
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
      setError(null);
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
      await fetchAlerts();
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
    setPage(0);
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'low-stock':
        return <LocalPharmacyIcon sx={{ color: warningOrange }} />;
      case 'near-expiry':
        return <TimerIcon sx={{ color: errorRed }} />;
      case 'expired':
        return <ErrorIcon sx={{ color: errorRed }} />;
      default:
        return <WarningIcon sx={{ color: warningOrange }} />;
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

  const filteredAlerts = alerts
    .filter(alert => {
      // First filter by resolved status
      if (activeTab === 0 && alert.resolved) return false;
      if (activeTab === 1 && !alert.resolved) return false;
      
      // Then apply search filter
      const searchLower = searchQuery.toLowerCase();
      return (
        alert.message.toLowerCase().includes(searchLower) ||
        (alert.medicineId?.name || '').toLowerCase().includes(searchLower) ||
        alert.type.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Calculate summary statistics
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
              color: primaryBlue,
              '&:hover': {
                backgroundColor: lightBlue
              }
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h2" sx={{ color: primaryBlue, fontWeight: 'bold' }}>
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
                bgcolor: successGreen,
                '&:hover': { bgcolor: '#1b5e20' }
              }}
            >
              Resolve All
            </Button>
          )}
          <IconButton 
            onClick={fetchAlerts}
            sx={{ 
              color: primaryBlue,
              '&:hover': {
                backgroundColor: lightBlue
              }
            }}
          >
            <RefreshIcon />
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
              <Typography variant="h6" color={primaryBlue}>Total Alerts</Typography>
              <Typography variant="h4">{totalAlerts}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Typography variant="h6" color={warningOrange}>Low Stock</Typography>
              <Typography variant="h4">{lowStockAlerts}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#ffebee' }}>
            <CardContent>
              <Typography variant="h6" color={errorRed}>Expiring Soon</Typography>
              <Typography variant="h4">{expiringAlerts}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#ffcdd2' }}>
            <CardContent>
              <Typography variant="h6" color={errorRed}>Expired</Typography>
              <Typography variant="h4">{expiredAlerts}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label={`Unresolved Alerts (${unresolvedAlerts.length})`} />
          <Tab label={`Resolved Alerts (${alerts.length - unresolvedAlerts.length})`} />
        </Tabs>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search alerts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Alerts Table */}
      <TableContainer component={Paper} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: lightBlue }}>
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
                  <TableRow 
                    key={alert._id}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: getAlertColor(alert.type),
                        opacity: 0.8
                      }
                    }}
                  >
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
                          variant="outlined"
                        >
                          Resolve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
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
          <Button 
            onClick={handleConfirmResolve} 
            color="success" 
            variant="contained"
            autoFocus
          >
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
          <Button 
            onClick={handleConfirmResolveAll} 
            color="success" 
            variant="contained"
            autoFocus
          >
            Resolve All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AlertList; 