import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { Container } from '@mui/material';
import Dashboard from './components/Inventory/DashboardIMS';
import MedicineForm from './components/Inventory/MedicineForm';
import MedicineList from './components/Inventory/MedicineList';
import Alerts from './components/Inventory/Alerts';
import TransactionLogs from './components/Inventory/TransactionLogs';
import { getMedicines, updateMedicine, addMedicine } from "./services/medicineService";

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

const AppContent = () => {
  const [medicines, setMedicines] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const data = await getMedicines();
      setMedicines(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load medicines:', error);
    }
  };

  const handleSave = async (medicineData) => {
    try {
      if (medicineData._id) {
        // Update existing medicine
        await updateMedicine(medicineData._id, medicineData);
      } else {
        // Add new medicine
        await addMedicine(medicineData);
      }
      await fetchMedicines(); 
      navigate('/'); 
    } catch (error) {
      console.error('Failed to save medicine:', error);
    }
  };

  return (
    <Container>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/medicines" element={<MedicineList medicines={medicines} />} />
        <Route path="/add" element={<MedicineForm onSave={handleSave} />} />
        <Route path="/edit/:id" element={<MedicineForm onSave={handleSave} />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/transactions" element={<TransactionLogs />} />
        <Route path="/transactions/:medicineId" element={<TransactionLogs />} />
      </Routes>
    </Container>
  );
};

export default App;