import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Typography
} from '@mui/material';
import { createInvoice, getInvoices, approvePayment } from '../api';
import { getOrders } from '../api';

function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ supplierId: '', orderId: '', amount: 0 });

  useEffect(() => {
    fetchInvoices();
    fetchOrders();
  }, []);

  const fetchInvoices = async () => {
    const { data } = await getInvoices();
    setInvoices(data);
  };

  const fetchOrders = async () => {
    const { data } = await getOrders();
    setOrders(data);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({ supplierId: '', orderId: '', amount: 0 });
  };

  const handleSubmit = async () => {
    await createInvoice(form);
    fetchInvoices();
    handleClose();
  };

  const handleApprove = async (id) => {
    await approvePayment(id);
    fetchInvoices();
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Invoices</Typography>
      <Button variant="contained" onClick={handleOpen}>Create Invoice</Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Supplier</TableCell>
            <TableCell>Order</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice._id}>
              <TableCell>{invoice.supplierId.name}</TableCell>
              <TableCell>{invoice.orderId._id}</TableCell>
              <TableCell>{invoice.amount}</TableCell>
              <TableCell>{invoice.status}</TableCell>
              <TableCell>
                {invoice.status === 'pending' && (
                  <Button onClick={() => handleApprove(invoice._id)}>Approve Payment</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create Invoice</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Order"
            fullWidth
            value={form.orderId}
            onChange={(e) => {
              const order = orders.find(o => o._id === e.target.value);
              setForm({ ...form, orderId: e.target.value, supplierId: order.supplierId._id });
            }}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            {orders.map((order) => (
              <option key={order._id} value={order._id}>{order._id}</option>
            ))}
          </TextField>
          <TextField
            label="Amount"
            type="number"
            fullWidth
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Create</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default InvoiceList;