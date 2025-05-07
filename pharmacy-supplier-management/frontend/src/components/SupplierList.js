import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Typography
} from '@mui/material';
import {
  addSupplier, getSuppliers, updateSupplier, deleteSupplier, verifySupplier,
  updatePerformance, flagSupplier
} from '../api';

function SupplierList() {
  const [suppliers, setSuppliers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', contact: '', address: '', legalDocuments: [] });
  const [editId, setEditId] = useState(null);
  const [performanceForm, setPerformanceForm] = useState({ deliveryTime: 0, qualityRating: 0, compliance: true });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    const { data } = await getSuppliers();
    setSuppliers(data);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setForm({ name: '', contact: '', address: '', legalDocuments: [] });
    setEditId(null);
  };

  const handleSubmit = async () => {
    if (editId) {
      await updateSupplier(editId, form);
    } else {
      await addSupplier(form);
    }
    fetchSuppliers();
    handleClose();
  };

  const handleEdit = (supplier) => {
    setForm(supplier);
    setEditId(supplier._id);
    handleOpen();
  };

  const handleDelete = async (id) => {
    await deleteSupplier(id);
    fetchSuppliers();
  };

  const handleVerify = async (id) => {
    await verifySupplier(id);
    fetchSuppliers();
  };

  const handlePerformanceUpdate = async (id) => {
    await updatePerformance(id, performanceForm);
    fetchSuppliers();
  };

  const handleFlag = async (id) => {
    await flagSupplier(id);
    fetchSuppliers();
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Suppliers</Typography>
      <Button variant="contained" onClick={handleOpen}>Add Supplier</Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Contact</TableCell>
            <TableCell>Address</TableCell>
            <TableCell>Verified</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier._id}>
              <TableCell>{supplier.name}</TableCell>
              <TableCell>{supplier.contact}</TableCell>
              <TableCell>{supplier.address}</TableCell>
              <TableCell>{supplier.isVerified ? 'Yes' : 'No'}</TableCell>
              <TableCell>
                <Button onClick={() => handleEdit(supplier)}>Edit</Button>
                <Button onClick={() => handleDelete(supplier._id)}>Delete</Button>
                <Button onClick={() => handleVerify(supplier._id)}>Verify</Button>
                <Button onClick={() => handleFlag(supplier._id)}>Flag</Button>
                <div>
                  <TextField
                    label="Delivery Time"
                    type="number"
                    value={performanceForm.deliveryTime}
                    onChange={(e) => setPerformanceForm({ ...performanceForm, deliveryTime: e.target.value })}
                  />
                  <TextField
                    label="Quality Rating"
                    type="number"
                    value={performanceForm.qualityRating}
                    onChange={(e) => setPerformanceForm({ ...performanceForm, qualityRating: e.target.value })}
                  />
                  <Button onClick={() => handlePerformanceUpdate(supplier._id)}>Update Performance</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editId ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Contact"
            fullWidth
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
          />
          <TextField
            label="Address"
            fullWidth
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default SupplierList;