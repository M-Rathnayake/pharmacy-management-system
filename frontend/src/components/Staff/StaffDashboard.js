import React from 'react';
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  useTheme
} from '@mui/material';
import {
  Inventory,
  ShoppingCart,
  People,
  AttachMoney,
  Add,
  ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const managementSystems = [
  {
    title: 'Inventory Management',
    description: 'Manage medicines, stock levels, and inventory alerts',
    icon: <Inventory sx={{ fontSize: 40 }} />,
    path: '/inventory',
    color: '#1a237e',
    permission: 'inventory'
  },
  {
    title: 'Order Management',
    description: 'Process orders and manage customer requests',
    icon: <ShoppingCart sx={{ fontSize: 40 }} />,
    path: '/orders',
    color: '#0d47a1',
    permission: 'orders'
  },
  {
    title: 'Supplier Management',
    description: 'Manage supplier relationships and orders',
    icon: <People sx={{ fontSize: 40 }} />,
    path: '/suppliers',
    color: '#1565c0',
    permission: 'suppliers'
  },
  {
    title: 'Customer Management',
    description: 'Manage customer records and profiles',
    icon: <People sx={{ fontSize: 40 }} />,
    path: '/customers',
    color: '#1976d2',
    permission: 'customers'
  },
  {
    title: 'Financial Management',
    description: 'Track sales, expenses, and financial reports',
    icon: <AttachMoney sx={{ fontSize: 40 }} />,
    path: '/finance',
    color: '#1976d2',
    permission: 'finance'
  }
];

const StaffDashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { hasPermission } = useAuth();

  return (
    <Container maxWidth="xl">
      {/* Welcome Section */}
      <Box sx={{ mb: 6, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
          Welcome to Pharmacy Management System
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Select a management system to get started
        </Typography>
      </Box>

      {/* Management Systems Grid */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {managementSystems.map((system) => (
          hasPermission(system.permission) && (
            <Grid item xs={12} sm={6} md={3} key={system.title}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[4]
                  }
                }}
                onClick={() => navigate(system.path)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ color: system.color, mr: 2 }}>
                      {system.icon}
                    </Box>
                    <Typography variant="h6" component="h2" sx={{ color: system.color }}>
                      {system.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {system.description}
                  </Typography>
                  <Button
                    endIcon={<ArrowForward />}
                    sx={{ color: system.color }}
                  >
                    Access System
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )
        ))}
      </Grid>

      {/* Quick Actions Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ color: theme.palette.primary.main }}>
          Quick Actions
        </Typography>
        <Stack direction="row" spacing={2}>
          {hasPermission('inventory') && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/inventory/add')}
              sx={{ bgcolor: theme.palette.primary.main }}
            >
              Add New Medicine
            </Button>
          )}
          {hasPermission('orders') && (
            <Button
              variant="outlined"
              startIcon={<ShoppingCart />}
              onClick={() => navigate('/orders')}
            >
              Create New Order
            </Button>
          )}
        </Stack>
      </Box>
    </Container>
  );
};

export default StaffDashboard; 