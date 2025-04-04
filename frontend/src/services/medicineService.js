import axios from "axios";

const API_URL = "http://localhost:8080/api/inventory";

// Fetching medicines
export const getMedicines = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching medicines:", error);
    throw error;
  }
};

// Fetching a medicine by ID
export const getMedicineById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching medicine ${id}:`, error);
    throw error;
  }
};

// Adding a new medicine
export const addMedicine = async (medicineData) => {
  try {
    const response = await axios.post(API_URL, medicineData);
    return response.data;
  } catch (error) {
    console.error("Error adding medicine:", error);
    throw error;
  }
};

// Updating a medicine
export const updateMedicine = async (id, medicineData) => {
  try {
    
    const currentResponse = await axios.get(`${API_URL}/${id}`);
    const currentMedicine = currentResponse.data;
    
    const updateResponse = await axios.put(`${API_URL}/${id}`, medicineData);
    
    // for mock transaction, creating transaction if stock changed
    if (currentMedicine.stock !== medicineData.stock) {
      const quantityDiff = medicineData.stock - currentMedicine.stock;
      const transactionType = quantityDiff > 0 ? 'restock' : 'adjustment';
      
      const transactionPayload = {
        medicineId: id,
        type: transactionType,
        quantity: Math.abs(quantityDiff),
        notes: `Stock ${transactionType} during medicine update`,
        previousStock: currentMedicine.stock,
        newStock: medicineData.stock
      };
      
      // Creating mock transaction 
      createTransaction(transactionPayload)
        .catch(err => console.warn("Transaction logging failed (non-critical):", err));
    }
    
    return updateResponse.data;
  } catch (error) {
    console.error("Update Error:", error.response?.data || error.message);
    throw error;
  }
};

// Deleting a medicine
export const deleteMedicine = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error(`Error deleting medicine ${id}:`, error);
    throw error;
  }
};

// Mock transactions
export const createMockTransaction = (transactionData) => {
  try {
    
    const transactions = JSON.parse(localStorage.getItem('mockTransactions') || '[]');
    
    const transactionList = Array.isArray(transactions) ? transactions : [];
    
    transactionList.push({
      ...transactionData,
      transactionId: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
    
    localStorage.setItem('mockTransactions', JSON.stringify(transactionList));
    return transactionData;
  } catch (error) {
    console.error('Error saving transaction:', error);
    
    localStorage.setItem('mockTransactions', JSON.stringify([transactionData]));
    return transactionData;
  }
};

export const getMockTransactions = () => {
  try {
    const transactions = localStorage.getItem('mockTransactions');
    if (!transactions) return []; 
    
    const parsed = JSON.parse(transactions);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error parsing transactions:', error);
    
    localStorage.removeItem('mockTransactions');
    return [];
  }
};
