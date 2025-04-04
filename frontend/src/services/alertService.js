import axios from "axios";

const API_URL = "http://localhost:8080/api/inventoryAlerts";

export const getAllUnresolvedAlerts = async () => {
  try {
    const response = await axios.get(`${API_URL}`);
    console.log('Full API Response:', response); 
    
    if (response.data && response.data.success) {
      return Array.isArray(response.data.data) ? response.data.data : [];
    }
    
    console.error('Unexpected response structure:', response.data);
    return [];
  } catch (error) {
    console.error("Alerts Error:", error.response?.data || error.message);
    return [];
  }
};

export const resolveAlert = async (alertId) => {
  try {
    await axios.patch(`${API_URL}/${alertId}`, { resolved: true });
    return true;
  } catch (error) {
    console.error("Resolve Error:", error.response?.data || error.message);
    return false;
  }
};

// Mock alerts related functions
export const createMockAlert = (alertData) => {
  const alerts = JSON.parse(localStorage.getItem('mockAlerts') || '[]');
  alerts.push(alertData);
  localStorage.setItem('mockAlerts', JSON.stringify(alerts));
  return alertData;
};

export const checkStockLevels = (medicines) => {
  const newAlerts = [];
  
  medicines.forEach(med => {
    
    if (med.stock < med.threshold) {
      newAlerts.push({
        type: 'low-stock',
        medicineId: med._id,
        medicineName: med.name,
        message: `${med.name} stock is low (${med.stock} remaining)`,
        priority: 'high',
        createdAt: new Date().toISOString()
      });
    }
    
    // Check expiry
    const expiryDate = new Date(med.expiryDate);
    const daysUntilExpiry = Math.floor((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 30) {
      newAlerts.push({
        type: 'near-expiry',
        medicineId: med._id,
        medicineName: med.name,
        message: `${med.name} expires in ${daysUntilExpiry} days`,
        priority: 'medium',
        createdAt: new Date().toISOString()
      });
    }
  });
  
  return newAlerts;
};