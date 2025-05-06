import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import StaffLayout from './layouts/StaffLayout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Staff Dashboard
import StaffDashboard from './components/Staff/StaffDashboard';

// Inventory Management
import DashboardIMS from './components/Inventory/DashboardIMS';
import MedicineList from './components/Inventory/MedicineList';
import AddMedicine from './components/Inventory/AddMedicine';
import EditMedicine from './components/Inventory/EditMedicine';
import AlertList from './components/Inventory/AlertList';
import TransactionLogs from './components/Inventory/TransactionLogs';

// Other Management Systems - Import or use placeholders
const OrderManagement = () => <div>Order Management System</div>;
const SupplierManagement = () => <div>Supplier Management System</div>;
const FinancialManagement = () => <div>Financial Management System</div>;
const CustomerManagement = () => <div>Customer Management System</div>;

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e',
    },
    secondary: {
      main: '#0d47a1',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Protected Routes */}
            <Route path="/" element={<StaffLayout />}>
              {/* Staff Dashboard as main landing page */}
              <Route index element={<StaffDashboard />} />

              {/* Inventory Management */}
              <Route path="inventory">
                <Route index element={
                  <ProtectedRoute requiredPermission="inventory">
                    <DashboardIMS />
                  </ProtectedRoute>
                } />
                <Route path="medicines" element={
                  <ProtectedRoute requiredPermission="inventory">
                    <MedicineList />
                  </ProtectedRoute>
                } />
                <Route path="medicines/edit/:id" element={
                  <ProtectedRoute requiredPermission="inventory">
                    <EditMedicine />
                  </ProtectedRoute>
                } />
                <Route path="add" element={
                  <ProtectedRoute requiredPermission="inventory">
                    <AddMedicine />
                  </ProtectedRoute>
                } />
                <Route path="alerts" element={
                  <ProtectedRoute requiredPermission="inventory">
                    <AlertList />
                  </ProtectedRoute>
                } />
                <Route path="transactions" element={
                  <ProtectedRoute requiredPermission="inventory">
                    <TransactionLogs />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Order Management */}
              <Route path="orders/*" element={
                <ProtectedRoute requiredPermission="orders">
                  <OrderManagement />
                </ProtectedRoute>
              } />

              {/* Supplier Management */}
              <Route path="suppliers/*" element={
                <ProtectedRoute requiredPermission="suppliers">
                  <SupplierManagement />
                </ProtectedRoute>
              } />

              {/* Financial Management */}
              <Route path="finance/*" element={
                <ProtectedRoute requiredPermission="finance">
                  <FinancialManagement />
                </ProtectedRoute>
              } />

              {/* Customer Management */}
              <Route path="customers/*" element={
                <ProtectedRoute requiredPermission="customers">
                  <CustomerManagement />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;