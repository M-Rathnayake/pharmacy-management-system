import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper,
  Button, IconButton, Badge, CircularProgress, Alert as MuiAlert
} from '@mui/material';
import { Report, CheckCircle, ArrowBack } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  getAllUnresolvedAlerts, 
  resolveAlert 
} from '../../services/alertService';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const filter = location.state?.filter;

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await getAllUnresolvedAlerts();
        setAlerts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  useEffect(() => {
    const filtered = alerts.filter(alert => {
      if (!filter) return true;
      if (filter === 'low-stock') return alert.type === 'low-stock';
      if (filter === 'expiry') return alert.type === 'near-expiry';
      return true;
    });
    setFilteredAlerts(filtered);
  }, [alerts, filter]);

  const handleResolve = async (alertId) => {
    const success = await resolveAlert(alertId);
    if (success) {
      setAlerts(prev => prev.filter(alert => alert._id !== alertId));
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
        <MuiAlert severity="error">Error loading alerts: {error}</MuiAlert>
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

      {filter && (
        <Button 
          variant="outlined" 
          sx={{ mb: 2 }}
          onClick={() => navigate('/alerts')}
        >
          Show All Alerts
        </Button>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Medicine</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Date</TableCell>
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
                    <Button
                      startIcon={<CheckCircle />}
                      onClick={() => handleResolve(alert._id)}
                      color="success"
                    >
                      Resolve
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
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