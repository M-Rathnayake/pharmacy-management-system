import React, { useState } from 'react';
import { Container, Typography, Alert, Snackbar } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { addMedicine } from '../../services/medicineService';
import MedicineForm from './MedicineForm';

const AddMedicine = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = async (medicineData) => {
    try {
      await addMedicine({
        ...medicineData,
        stock: Number(medicineData.stock),
        threshold: Number(medicineData.threshold)
      });
      setSuccess(true);
      setTimeout(() => {
        const from = location.state?.from || '/inventory';
        navigate(from);
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to add medicine');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Add New Medicine
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      <MedicineForm onSave={handleSave} />
      <Snackbar open={success} autoHideDuration={1200} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert elevation={6} variant="filled" severity="success">
          Medicine added successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AddMedicine; 