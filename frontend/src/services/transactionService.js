import axios from "axios";

const API_URL = "http://localhost:8080/api/inventoryTransactions";

export const getTransactions = async (medicineId = null) => {
  try {
    const endpoint = medicineId 
      ? `${API_URL}/medicine/${medicineId}`
      : API_URL;
    
    const response = await axios.get(endpoint);
    return response.data.data || [];
  } catch (error) {
    console.error("Transaction Error:", error.response?.data || error.message);
    return [];
  }
};

export const createTransaction = async (transactionData) => {
  try {
    const response = await axios.post(API_URL, transactionData);
    return response.data;
  } catch (error) {
    console.error("Transaction Creation Error:", error.response?.data || error.message);
    throw error;
  }
};

export const getTransactionById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Transaction Fetch Error:", error.response?.data || error.message);
    throw error;
  }
};