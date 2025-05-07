import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper,
  Button, IconButton, Badge, CircularProgress, Alert as MuiAlert,
  Tabs, Tab
} from '@mui/material';
import { Report, CheckCircle, ArrowBack } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  getAllUnresolvedAlerts, 
  resolveAlert,
  getAlerts
} from '../../services/alertService';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resolvingId, setResolvingId] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0 for unresolved, 1 for resolved
  const navigate = useNavigate();
  const location = useLocation();
  const filter = location.state?.filter;

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await getAlerts();
      setAlerts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    const filtered = alerts.filter(alert => {
      // First filter by resolved status
      if (activeTab === 0 && alert.resolved) return false;
      if (activeTab === 1 && !alert.resolved) return false;
      
      // Then apply type filter if exists
      if (!filter) return true;
      if (filter === 'low-stock') return alert.type === 'low-stock';
      if (filter === 'expiry') return alert.type === 'near-expiry';
      return true;
    });
    setFilteredAlerts(filtered);
  }, [alerts, filter, activeTab]);

  const handleResolve = async (alertId) => {
    try {
      setResolvingId(alertId);
      const success = await resolveAlert(alertId);
      if (success) {
        // Refresh the alerts list instead of just removing
        await fetchAlerts();
        setError(null);
      } else {
        setError('Failed to resolve alert. Please try again.');
      }
    } catch (err) {
      setError('Error resolving alert: ' + err.message);
    } finally {
      setResolvingId(null);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">
          {filter === 'low-stock' ? 'Low Stock Alerts' : 
           filter === 'expiry' ? 'Expiry Alerts' : 
           'All Alerts'}
        </Typography>
        <Badge 
          badgeContent={filteredAlerts.length} 
          color="error" 
          sx={{ ml: 2 }}
        >
          <Report color="action" />
        </Badge>
      </Box>

      {error && (
        <MuiAlert severity="error" sx={{ mb: 2 }}>
          {error}
        </MuiAlert>
      )}

      {filter && (
        <Button 
          variant="outlined" 
          sx={{ mb: 2 }}
          onClick={() => navigate('/alerts')}
        >
          Show All Alerts
        </Button>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Unresolved Alerts" />
          <Tab label="Resolved Alerts" />
        </Tabs>
      </Box>

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
              filteredAlerts.map((alert) => (
                <TableRow key={alert._id}>
                  <TableCell>
                    {alert.type === 'low-stock' ? 'Low Stock' : 'Expiry Alert'}
                  </TableCell>
                  <TableCell>
                    {alert.medicineId?.name || 'Unknown Medicine'}
                  </TableCell>
                  <TableCell>{alert.message}</TableCell>
                  <TableCell>
                    {new Date(alert.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {alert.resolved ? 'Resolved' : 'Active'}
                  </TableCell>
                  <TableCell>
                    {!alert.resolved && (
                      <Button
                        startIcon={<CheckCircle />}
                        onClick={() => handleResolve(alert._id)}
                        color="success"
                        disabled={resolvingId === alert._id}
                      >
                        {resolvingId === alert._id ? 'Resolving...' : 'Resolve'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" color="textSecondary">
                    No {filter ? 'matching' : ''} alerts found
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

export default Alerts;