import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const addSupplier = (data) => API.post('/suppliers', data);
export const getSuppliers = () => API.get('/suppliers');
export const updateSupplier = (id, data) => API.put(`/suppliers/${id}`, data);
export const deleteSupplier = (id) => API.delete(`/suppliers/${id}`);
export const verifySupplier = (id) => API.put(`/suppliers/verify/${id}`);
export const updatePerformance = (id, data) => API.put(`/suppliers/performance/${id}`, data);
export const flagSupplier = (id) => API.put(`/suppliers/flag/${id}`);
export const getSupplierReport = () => API.get('/suppliers/report');

export const placeOrder = (data) => API.post('/orders', data);
export const getOrders = () => API.get('/orders');

export const createInvoice = (data) => API.post('/invoices', data);
export const getInvoices = () => API.get('/invoices');
export const approvePayment = (id) => API.put(`/invoices/approve/${id}`);