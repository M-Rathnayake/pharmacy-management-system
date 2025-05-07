import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, AppBar, Toolbar, Typography, Button } from '@mui/material';
import SupplierList from './components/SupplierList';
import OrderList from './components/OrderList';
import InvoiceList from './components/InvoiceList';
import SupplierReport from './components/SupplierReport';

function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            Pharmacy Supplier Management
          </Typography>
          <Button color="inherit" href="/suppliers">Suppliers</Button>
          <Button color="inherit" href="/orders">Orders</Button>
          <Button color="inherit" href="/invoices">Invoices</Button>
          <Button color="inherit" href="/report">Report</Button>
        </Toolbar>
      </AppBar>
      <Container>
        <Routes>
          <Route path="/suppliers" element={<SupplierList />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/invoices" element={<InvoiceList />} />
          <Route path="/report" element={<SupplierReport />} />
          <Route path="/" element={<SupplierList />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;