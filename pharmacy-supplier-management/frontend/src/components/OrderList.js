import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Typography
} from '@mui/material';
import { placeOrder, getOrders } from '../api';
import { getSuppliers } from '../api';

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ supplierId: '', items: [{ name: '', quantity: 0 }] });

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
  }, []);

  const fetchOrders = async () => {
    const { data } = await getOrders();
    setOrders(data);
  };

  const fetchSuppliers = async () => {
    const { data } = await getSuppliers();
    setSuppliers(data);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({ supplierId: '', items: [{ name: '', quantity: 0 }] });
  };

  const handleSubmit = async () => {
    await placeOrder(form);
    fetchOrders();
    handleClose();
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Orders</Typography>
      <Button variant="contained" onClick={handleOpen}>Place Order</Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Supplier</TableCell>
            <TableCell>Items</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order._id}>
              <TableCell>{order.supplierId.name}</TableCell>
              <TableCell>{order.items.map(item => `${item.name}: ${item.quantity}`).join(', ')}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Place Order</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Supplier"
            fullWidth
            value={form.supplierId}
            onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            {suppliers.map((supplier) => (
              <option key={supplier._id} value={supplier._id}>{supplier.name}</option>
            ))}
          </TextField>
          {form.items.map((item, index) => (
            <div key={index}>
              <TextField
                label="Item Name"
                value={item.name}
                onChange={(e) => {
                  const newItems = [...form.items];
                  newItems[index].name = e.target.value;
                  setForm({ ...form, items: newItems });
                }}
              />
              <TextField
                label="Quantity"
                type="number"
                value={item.quantity}
                onChange={(e) => {
                  const newItems = [...form.items];
                  newItems[index].quantity = e.target.value;
                  setForm({ ...form, items: newItems });
                }}
              />
            </div>
          ))}
          <Button onClick={() => setForm({ ...form, items: [...form.items, { name: '', quantity: 0 }] })}>
            Add Item
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Place Order</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default OrderList;