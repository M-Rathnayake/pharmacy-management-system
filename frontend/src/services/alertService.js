import axios from "axios";

const API_URL = "http://localhost:8080/api/inventoryAlerts";

export const getAlerts = async () => {
  try {
    const response = await axios.get(`${API_URL}`);
    if (response.data && response.data.success) {
      return Array.isArray(response.data.data) ? response.data.data : [];
    }
    return [];
  } catch (error) {
    console.error("Alerts Error:", error.response?.data || error.message);
    return [];
  }
};

export const getAllUnresolvedAlerts = async () => {
  try {
    const response = await axios.get(`${API_URL}?status=unresolved`);
    if (response.data && response.data.success) {
      return Array.isArray(response.data.data) ? response.data.data : [];
    }
    return [];
  } catch (error) {
    console.error("Alerts Error:", error.response?.data || error.message);
    return [];
  }
};

export const resolveAlert = async (alertId) => {
  try {
    const response = await axios.patch(`${API_URL}/${alertId}/resolve`);
    if (response.data && response.data.success) {
      return true;
    }
    // Pass the backend error message up
    throw new Error(response.data?.error || "Unknown error");
  } catch (error) {
    // Log and rethrow the error so the UI can show it
    console.error("Resolve Error Details:", error);
    throw error;
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
    const today = new Date();
    const daysUntilExpiry = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      newAlerts.push({
        type: 'expired',
        medicineId: med._id,
        medicineName: med.name,
        message: `${med.name} has expired on ${expiryDate.toLocaleDateString()}`,
        priority: 'high',
        createdAt: new Date().toISOString()
      });
    } else if (daysUntilExpiry < 30) {
      newAlerts.push({
        type: 'near-expiry',
        medicineId: med._id,
        medicineName: med.name,
        message: `${med.name} expires in ${daysUntilExpiry} days (${expiryDate.toLocaleDateString()})`,
        priority: 'medium',
        createdAt: new Date().toISOString()
      });
    }
  });
  
  return newAlerts;
};