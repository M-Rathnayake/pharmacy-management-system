import React from 'react';
import { Box, Typography } from '@mui/material';
import MedicineForm from './MedicineForm';
import { updateMedicine } from '../../services/medicineService';
import { useNavigate, useLocation } from 'react-router-dom';

const EditMedicine = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSave = async (medicineData) => {
    try {
      await updateMedicine(medicineData._id, medicineData);
      const from = location.state?.from || '/inventory/medicines';
      navigate(from);
    } catch (error) {
      throw error;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Edit Medicine
      </Typography>
      <MedicineForm onSave={handleSave} />
    </Box>
  );
};

export default EditMedicine; 