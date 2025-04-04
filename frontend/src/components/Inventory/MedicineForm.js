import React, { useState, useEffect, useRef } from 'react';
import { 
  Box,
  TextField, 
  Button, 
  Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { getMedicineById } from "../../services/medicineService";
import { getMedicines } from "../../services/medicineService";

const MedicineForm = ({ onSave }) => {
  const { id } = useParams();
  const [medicine, setMedicine] = useState({
    name: '',
    barcode: '',
    description: '',
    stock: 0,
    threshold: 10,
    expiryDate: dayjs(),
    category: 'Tablet',
    supplierId: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const originalStock = useRef(0);

  useEffect(() => {
    if (id) {
      const fetchMedicine = async () => {
        try {
          const medicineData = await getMedicineById(id);
          originalStock.current = medicineData.stock; 
          setMedicine({
            ...medicineData,
            expiryDate: dayjs(medicineData.expiryDate)
          });
        } catch (err) {
          setError(err.message || 'Failed to load medicine data');
        } finally {
          setLoading(false);
        }
      };
      fetchMedicine();
    }
  }, [id]);

  const categories = [
    'Tablet',
    'Syrup',
    'Capsule',
    'Injection',  
    'OTC',
    'Prescription',  
    'Other'
  ];

  const statusOptions = [
    'active',
    'discontinued',
    'recalled'
  ];

  const checkExistingMedicine = async () => {
    const medicines = await getMedicines();
    return medicines.some(
      med => med.name.toLowerCase() === medicine.name.toLowerCase() 
      && med.barcode === medicine.barcode
      && (!id || med.id !== id)
    );
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!id && await checkExistingMedicine()) {
      setError("This medicine (same name and barcode) already exists");
      return;
    }
    
    setShowConfirmation(true);
  };

  const handleConfirmUpdate = async () => {
    setIsSubmitting(true);
    try {
      const medicineToSave = {
        ...medicine,
        expiryDate: medicine.expiryDate.toISOString()
      };
      await onSave(medicineToSave);

      if (id) {
        const stockChange = medicine.stock - originalStock.current;
        
        if (stockChange !== 0) {
          const transactionType = stockChange > 0 ? 'restock' : 'sale';
          console.log(`Would create ${transactionType} transaction for ${Math.abs(stockChange)} units`);
        }
      }

    } catch (err) {
      setError(err.message || 'Failed to update medicine');
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  const handleCancelUpdate = () => {
    setShowConfirmation(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error: {error}</Alert>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3} sx={{ maxWidth: 600, p: 2 }}>
          <Typography variant="h6">
            {id ? "Edit Medicine" : "Add New Medicine"}
          </Typography>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Medicine Name"
              value={medicine.name}
              onChange={(e) => setMedicine({...medicine, name: e.target.value})}
              required
              fullWidth
            />

            <TextField
              label="Barcode"
              value={medicine.barcode}
              onChange={(e) => setMedicine({...medicine, barcode: e.target.value})}
              required
              fullWidth
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={medicine.category}
                label="Category"
                onChange={(e) => setMedicine({...medicine, category: e.target.value})}
                required
              >
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Supplier ID"
              value={medicine.supplierId}
              onChange={(e) => setMedicine({...medicine, supplierId: e.target.value})}
              required
              fullWidth
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Current Stock"
              type="number"
              value={medicine.stock}
              onChange={(e) => setMedicine({...medicine, stock: Number(e.target.value)})}
              inputProps={{ min: 0 }}
              required
              fullWidth
            />

            <TextField
              label="Low Stock Threshold"
              type="number"
              value={medicine.threshold}
              onChange={(e) => setMedicine({...medicine, threshold: Number(e.target.value)})}
              inputProps={{ min: 1 }}
              required
              fullWidth
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <DatePicker
              label="Expiry Date"
              value={medicine.expiryDate}
              onChange={(newDate) => setMedicine({...medicine, expiryDate: newDate})}
              slotProps={{ textField: { fullWidth: true } }}
              minDate={dayjs()}
            />
            
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={medicine.status}
                label="Status"
                onChange={(e) => setMedicine({...medicine, status: e.target.value})}
              >
                {statusOptions.map(status => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <TextField
            label="Description"
            multiline
            rows={3}
            value={medicine.description}
            onChange={(e) => setMedicine({...medicine, description: e.target.value})}
            inputProps={{ maxLength: 500 }}
            helperText={`${medicine.description.length}/500 characters`}
          />

          <Button 
            variant="contained" 
            type="submit"
            size="large"
            sx={{ alignSelf: 'flex-end' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : id ? (
              "Update Medicine"
            ) : (
              "Add Medicine"
            )}
          </Button>
        </Stack>
      </form>

      <Dialog
        open={showConfirmation}
        onClose={handleCancelUpdate}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Update"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to update {medicine.name}? This will modify the medicine details in the database.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelUpdate} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmUpdate} 
            color="primary"
            disabled={isSubmitting}
            autoFocus
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Confirm Update"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default MedicineForm;