import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import StaffLayout from './layouts/StaffLayout';

// Staff Dashboard
import StaffDashboard from './components/Staff/StaffDashboard';

// Inventory Management
import DashboardIMS from './components/Inventory/DashboardIMS';
import MedicineList from './components/Inventory/MedicineList';
import AddMedicine from './components/Inventory/AddMedicine';
import EditMedicine from './components/Inventory/EditMedicine';
import AlertList from './components/Inventory/AlertList';
import TransactionLogs from './components/Inventory/TransactionLogs';

// Placeholder components for other management systems
const OrderManagement = () => <div>Order Management System (Coming Soon)</div>;
const SupplierManagement = () => <div>Supplier Management System (Coming Soon)</div>;
const FinancialManagement = () => <div>Financial Management System (Coming Soon)</div>;

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
      <Router>
        <Routes>
          <Route path="/" element={<StaffLayout />}>
            {/* Staff Dashboard as main landing page */}
            <Route index element={<StaffDashboard />} />

            {/* Inventory Management */}
            <Route path="inventory">
              <Route index element={<DashboardIMS />} />
              <Route path="medicines" element={<MedicineList />} />
              <Route path="medicines/edit/:id" element={<EditMedicine />} />
              <Route path="add" element={<AddMedicine />} />
              <Route path="alerts" element={<AlertList />} />
              <Route path="transactions" element={<TransactionLogs />} />
            </Route>

            {/* Other Management Systems */}
            <Route path="orders/*" element={<OrderManagement />} />
            <Route path="suppliers/*" element={<SupplierManagement />} />
            <Route path="finance/*" element={<FinancialManagement />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;