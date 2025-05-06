import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Avatar,
  useTheme,
  useMediaQuery,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  LocalPharmacy as PharmacyIcon,
  ShoppingCart as OrderIcon,
  AttachMoney as FinanceIcon,
  Business as SupplierIcon,
  ExitToApp as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  People as PeopleIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginDialog from '../components/Auth/LoginDialog';

const drawerWidth = 280;

const menuItems = [
  {
    title: 'Dashboard',
    path: '/',
    icon: <DashboardIcon />,
    description: 'Main dashboard overview'
  },
  {
    title: 'Inventory Management',
    path: '/inventory',
    icon: <InventoryIcon />,
    description: 'Manage medicines and stock'
  },
  {
    title: 'Order Management',
    path: '/orders',
    icon: <OrderIcon />,
    description: 'Handle customer orders'
  },
  {
    title: 'Supplier Management',
    path: '/suppliers',
    icon: <SupplierIcon />,
    description: 'Manage suppliers'
  },
  {
    title: 'Customer Management',
    path: '/customers',
    icon: <PeopleIcon />,
    description: 'Manage customers'
  },
  {
    title: 'Financial Management',
    path: '/finance',
    icon: <FinanceIcon />,
    description: 'Track finances'
  }
];

const StaffLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout: handleLogout } = useAuth();

  const isInventorySection = location.pathname.startsWith('/inventory');

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const getPageTitle = () => {
    const currentPath = location.pathname;
    if (currentPath === '/') return 'Dashboard';
    if (currentPath.startsWith('/inventory')) return 'Inventory Management';
    if (currentPath.startsWith('/orders')) return 'Order Management';
    if (currentPath.startsWith('/suppliers')) return 'Supplier Management';
    if (currentPath.startsWith('/finance')) return 'Financial Management';
    return 'Dashboard';
  };

  const drawer = (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Logo/Brand Section */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PharmacyIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h6" noWrap component="div">
          Pharmacy MS
        </Typography>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <List sx={{ px: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={location.pathname === item.path || (location.pathname.startsWith(item.path + '/') && !isInventorySection)}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.title}
                  secondary={item.description}
                  secondaryTypographyProps={{
                    sx: { 
                      opacity: 0.7,
                      display: { xs: 'none', sm: 'block' }
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* User Profile Section */}
      {user ? (
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {user.name?.charAt(0) || 'U'}
            </Avatar>
            <Box>
              <Typography variant="subtitle1">{user.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {user.role}
              </Typography>
            </Box>
          </Box>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 1,
              color: 'error.main',
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </Box>
      ) : (
        <Box sx={{ p: 2 }}>
          <ListItemButton
            onClick={() => setLoginDialogOpen(true)}
            sx={{
              borderRadius: 1,
              color: 'primary.main',
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>
              <LoginIcon />
            </ListItemIcon>
            <ListItemText primary="Login" />
          </ListItemButton>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Only show AppBar and Drawer when not in inventory section */}
      {!isInventorySection && (
        <>
          <AppBar
            position="fixed"
            sx={{
              width: { md: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
              ml: { md: `${drawerOpen ? drawerWidth : 0}px` },
              transition: theme.transitions.create(['margin', 'width'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
              </IconButton>
              <Typography variant="h6" noWrap component="div">
                {getPageTitle()}
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              {!user && (
                <Button
                  color="inherit"
                  startIcon={<LoginIcon />}
                  onClick={() => setLoginDialogOpen(true)}
                >
                  Login
                </Button>
              )}
            </Toolbar>
          </AppBar>

          <Drawer
            variant={isMobile ? 'temporary' : 'persistent'}
            anchor="left"
            open={drawerOpen}
            onClose={handleDrawerToggle}
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
              },
            }}
          >
            {drawer}
          </Drawer>
        </>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: !isInventorySection ? 3 : 0,
          width: '100%',
          mt: !isInventorySection ? 8 : 0
        }}
      >
        <Outlet />
      </Box>

      <LoginDialog
        open={loginDialogOpen}
        onClose={() => setLoginDialogOpen(false)}
      />
    </Box>
  );
};

export default StaffLayout; 