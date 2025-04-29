import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  Table,
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadPDFButton from "./DownloadPDFButton";

const PettyCashForm = () => {
  const [pettyId, setPettyId] = useState("");
  const [description, setDescription] = useState("");
  const [receiptNo, setReceiptNo] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [pettyCashData, setPettyCashData] = useState([]);
  const [errors, setErrors] = useState({});
  const [alertMsg, setAlertMsg] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchPettyCashData();
  }, []);

  const fetchPettyCashData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/pettyCash");
      setPettyCashData(response.data);
    } catch (error) {
      console.error("Error fetching petty cash data:", error);
    }
  };

  const validateForm = () => {
    let formErrors = {};
    if (!pettyId) formErrors.pettyId = "Petty ID is required";
    if (!description.trim()) formErrors.description = "Description is required";
    if (!receiptNo.trim()) formErrors.receiptNo = "Receipt No is required";
    if (!transactionType) formErrors.transactionType = "Transaction Type is required";
    if (!date) formErrors.date = "Date is required";
    if (!amount) formErrors.amount = "Amount is required";
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMsg("");

    if (!validateForm()) {
      setAlertMsg("Please fix the errors before submitting.");
      return;
    }

    const newData = {
      petty_id: pettyId,
      description,
      receipt_no: receiptNo,
      transaction_type: transactionType,
      date,
      amount: Number(amount),
    };

    try {
      if (!isEditing) {
        await axios.post("http://localhost:8080/api/pettyCash", newData);
      } else {
        await axios.put(`http://localhost:8080/api/pettyCash/${editingId}`, newData);
        setIsEditing(false);
        setEditingId(null);
      }

      setPettyId("");
      setDescription("");
      setReceiptNo("");
      setTransactionType("");
      setDate("");
      setAmount("");
      setErrors({});
      fetchPettyCashData();
    } catch (error) {
      console.error("Error submitting data:", error);
      setAlertMsg("Error submitting data. Please try again.");
    }
  };

  const handleEdit = (id) => {
    const data = pettyCashData.find((item) => item._id === id);
    setPettyId(data.petty_id);
    setDescription(data.description);
    setReceiptNo(data.receipt_no);
    setTransactionType(data.transaction_type);
    setDate(data.date);
    setAmount(data.amount.toString());
    setEditingId(id);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/pettyCash/${id}`);
      fetchPettyCashData();
    } catch (error) {
      console.error("Error deleting data:", error);
      setAlertMsg("Error deleting data. Please try again.");
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>Petty Cash</Typography>
      {alertMsg && <Alert severity="error">{alertMsg}</Alert>}

      {/* Form */}
      <Grid container spacing={2} component="form" onSubmit={handleSubmit}>
        <Grid item xs={6}>
          <TextField label="Petty ID" fullWidth value={pettyId} onChange={(e) => setPettyId(e.target.value)} error={Boolean(errors.pettyId)} helperText={errors.pettyId} required />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Description" fullWidth value={description} onChange={(e) => setDescription(e.target.value)} error={Boolean(errors.description)} helperText={errors.description} required />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Receipt No" fullWidth value={receiptNo} onChange={(e) => setReceiptNo(e.target.value)} error={Boolean(errors.receiptNo)} helperText={errors.receiptNo} required />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Transaction Type" fullWidth value={transactionType} onChange={(e) => setTransactionType(e.target.value)} error={Boolean(errors.transactionType)} helperText={errors.transactionType} required />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Date" type="date" fullWidth value={date} onChange={(e) => setDate(e.target.value)} error={Boolean(errors.date)} helperText={errors.date} required />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Amount" type="number" fullWidth value={amount} onChange={(e) => setAmount(e.target.value)} error={Boolean(errors.amount)} helperText={errors.amount} required />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary">{isEditing ? "Update" : "Add"}</Button>
        </Grid>
      </Grid>

      {/* Petty Cash Table */}
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Petty ID</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Receipt No</TableCell>
              <TableCell>Transaction Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pettyCashData.map((row) => (
              <TableRow key={row._id}>
                <TableCell>{row.petty_id}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.receipt_no}</TableCell>
                <TableCell>{row.transaction_type}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.amount}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(row._id)}><EditIcon color="primary" /></IconButton>
                  <IconButton onClick={() => handleDelete(row._id)}><DeleteIcon color="error" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Download Button */}
      {pettyCashData.length > 0 && (
        <Box mt={2}>
          <DownloadPDFButton documentType="pettyCash" documentId={pettyCashData[0]._id} fileName="petty_cash.pdf" />
        </Box>
      )}
    </Box>
  );
};

export default PettyCashForm;
