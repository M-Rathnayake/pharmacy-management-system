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
  Container,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadPDFButton from "./DownloadPDFButton";

const LedgerForm = () => {
  const [transactionId, setTransactionId] = useState("");
  const [accountName, setAccountName] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [ledgerData, setLedgerData] = useState([]);
  const [errors, setErrors] = useState({});
  const [alertMsg, setAlertMsg] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchLedgerData();
  }, []);

  const fetchLedgerData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/ledger");
      setLedgerData(response.data);
    } catch (error) {
      console.error("Error fetching ledger data:", error);
    }
  };

  const validateForm = () => {
    let formErrors = {};
    if (!transactionId) formErrors.transactionId = "Transaction ID is required";
    if (!accountName.trim()) formErrors.accountName = "Account Name is required";
    if (!transactionType) formErrors.transactionType = "Transaction Type is required";
    if (!description.trim()) formErrors.description = "Description is required";
    if (!date) formErrors.date = "Date is required";
    if (!amount) formErrors.amount = "Amount is required";
    if (!referenceId) formErrors.referenceId = "Reference ID is required";
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
      transaction_id: transactionId,
      account_name: accountName,
      transaction_type: transactionType,
      description,
      date,
      amount: Number(amount),
      reference_id: referenceId,
      created_At: new Date(),
    };

    try {
      if (!isEditing) {
        await axios.post("http://localhost:8080/api/ledger", newData);
      } else {
        await axios.put(`http://localhost:8080/api/ledger/${editingId}`, newData);
        setIsEditing(false);
        setEditingId(null);
      }

      setTransactionId("");
      setAccountName("");
      setTransactionType("");
      setDescription("");
      setDate("");
      setAmount("");
      setReferenceId("");
      setErrors({});
      fetchLedgerData();
    } catch (error) {
      console.error("Error submitting data:", error);
      setAlertMsg("Error submitting data. Please try again.");
    }
  };

  const handleEdit = (id) => {
    const data = ledgerData.find((item) => item._id === id);
    setTransactionId(data.transaction_id);
    setAccountName(data.account_name);
    setTransactionType(data.transaction_type);
    setDescription(data.description);
    setDate(data.date);
    setAmount(data.amount.toString());
    setReferenceId(data.reference_id);
    setEditingId(id);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/ledger/${id}`);
      fetchLedgerData();
    } catch (error) {
      console.error("Error deleting data:", error);
      setAlertMsg("Error deleting data. Please try again.");
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>Ledger</Typography>
      {alertMsg && <Alert severity="error">{alertMsg}</Alert>}

      {/* Form */}
      <Typography variant="h5" gutterBottom>
              <font align="left" color="#3998ff"><h5>Create a new entry</h5></font>
            </Typography>
      <Grid container spacing={2} component="form" onSubmit={handleSubmit}>
        <Grid item xs={6}>
          <TextField label="Transaction ID" fullWidth value={transactionId} onChange={(e) => setTransactionId(e.target.value)} error={Boolean(errors.transactionId)} helperText={errors.transactionId} required />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Account Name" fullWidth value={accountName} onChange={(e) => setAccountName(e.target.value)} error={Boolean(errors.accountName)} helperText={errors.accountName} required />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Transaction Type" fullWidth value={transactionType} onChange={(e) => setTransactionType(e.target.value)} error={Boolean(errors.transactionType)} helperText={errors.transactionType} required />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Description" fullWidth value={description} onChange={(e) => setDescription(e.target.value)} error={Boolean(errors.description)} helperText={errors.description} required />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Date" type="date" fullWidth value={date} onChange={(e) => setDate(e.target.value)} error={Boolean(errors.date)} helperText={errors.date} required />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Amount" type="number" fullWidth value={amount} onChange={(e) => setAmount(e.target.value)} error={Boolean(errors.amount)} helperText={errors.amount} required />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Reference ID" fullWidth value={referenceId} onChange={(e) => setReferenceId(e.target.value)} error={Boolean(errors.referenceId)} helperText={errors.referenceId} required />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary">{isEditing ? "Update" : "Add"}</Button>
        </Grid>
      </Grid>

      {/* Ledger Table */}
      <Typography variant="h5" gutterBottom>
              <font align="left" color="#3998ff"><h5>Ledger Data</h5></font>
            </Typography>
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Account Name</TableCell>
              <TableCell>Transaction Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Reference ID</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ledgerData.map((row) => (
              <TableRow key={row._id}>
                <TableCell>{row.transaction_id}</TableCell>
                <TableCell>{row.account_name}</TableCell>
                <TableCell>{row.transaction_type}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.amount}</TableCell>
                <TableCell>{row.reference_id}</TableCell>
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
      <Typography variant="h5" gutterBottom>
        <font align="left" color="#3998ff"><h5>Print Ledger</h5></font>
            </Typography>
      {ledgerData.length > 0 && (
        <Box mt={2}>
          <DownloadPDFButton documentType="ledger" documentId={ledgerData[0]._id} fileName="ledger.pdf" />
        </Box>
      )}
    </Box>
  );
};

export default LedgerForm;
