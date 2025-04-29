import React, { useState, useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadPDFButton from "./DownloadPDFButton";
import axios from "axios";
import {
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  Table,
  Container,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  IconButton,
  Alert,
} from "@mui/material";

const BankBookForm = () => {
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [voucherNo, setVoucherNo] = useState("");
  const [deposits, setDeposits] = useState("");
  const [withdrawal, setWithdrawal] = useState("");
  const [balance, setBalance] = useState("");
  const [bankBookData, setBankBookData] = useState([]);
  const [errors, setErrors] = useState({});
  const [alertMsg, setAlertMsg] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchBankBookData();
  }, []);

  const fetchBankBookData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/bankbook");
      setBankBookData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const validateForm = () => {
    let formErrors = {};
    if (!date) formErrors.date = "Date is required";
    if (!description.trim()) formErrors.description = "Description is required";
    if (deposits === "" && withdrawal === "") {
      formErrors.deposits = "At least one of deposits or withdrawal is required";
    }
    if (balance === "") formErrors.balance = "Balance is required";
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertMsg("");
    if (!validateForm()) {
      setAlertMsg("Please fix the errors below before submitting.");
      return;
    }
    const newData = {
      date,
      description,
      voucher_no: voucherNo,
      deposits: Number(deposits) || 0,
      withdrawal: Number(withdrawal) || 0,
      balance: Number(balance),
    };
    try {
      if (!isEditing) {
        await axios.post("http://localhost:8080/api/bankbook", newData);
      } else {
        await axios.put(`http://localhost:8080/api/bankbook/${editingId}`, newData);
        setIsEditing(false);
        setEditingId(null);
      }
      setDate("");
      setDescription("");
      setVoucherNo("");
      setDeposits("");
      setWithdrawal("");
      setBalance("");
      setErrors({});
      fetchBankBookData();
    } catch (error) {
      console.error("Error submitting data:", error);
      setAlertMsg("Error submitting data. Please try again.");
    }
  };

  const handleEdit = (id) => {
    const data = bankBookData.find((item) => item._id === id);
    setDate(data.date);
    setDescription(data.description);
    setVoucherNo(data.voucher_no);
    setDeposits(data.deposits.toString());
    setWithdrawal(data.withdrawal.toString());
    setBalance(data.balance.toString());
    setEditingId(id);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/bankbook/${id}`);
      fetchBankBookData();
    } catch (error) {
      console.error("Error deleting data:", error);
      setAlertMsg("Error deleting data. Please try again.");
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>
              <h3>Bank Book</h3>
              <font align="left" color="#3998ff"><h5>Create a new entry</h5></font>
            </Typography>
      {alertMsg && <Alert severity="error">{alertMsg}</Alert>}
      <Grid container spacing={2} component="form" onSubmit={handleSubmit}>
        <Grid item xs={12}>
          <TextField label="Date" type="date" fullWidth value={date} onChange={(e) => setDate(e.target.value)} error={Boolean(errors.date)} helperText={errors.date} required />
        </Grid>
        <Grid item xs={12}>
          <TextField label="Description" fullWidth value={description} onChange={(e) => setDescription(e.target.value)} error={Boolean(errors.description)} helperText={errors.description} required />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Voucher No" type="number" fullWidth value={voucherNo} onChange={(e) => setVoucherNo(e.target.value)} />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Deposits" type="number" fullWidth value={deposits} onChange={(e) => setDeposits(e.target.value)} error={Boolean(errors.deposits)} helperText={errors.deposits} />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Withdrawal" type="number" fullWidth value={withdrawal} onChange={(e) => setWithdrawal(e.target.value)} />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Balance" type="number" fullWidth value={balance} onChange={(e) => setBalance(e.target.value)} error={Boolean(errors.balance)} helperText={errors.balance} required />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary">{isEditing ? "Update" : "Add"}</Button>
        </Grid>
      </Grid>
      <Typography variant="h5" gutterBottom>
        <font align="left" color="#3998ff"><h5>Print Bank Book Data</h5></font>
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Voucher No</TableCell>
              <TableCell>Deposits</TableCell>
              <TableCell>Withdrawal</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bankBookData.map((row) => (
              <TableRow key={row._id}>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.voucher_no}</TableCell>
                <TableCell>{row.deposits}</TableCell>
                <TableCell>{row.withdrawal}</TableCell>
                <TableCell>{row.balance}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(row._id)}><EditIcon color="primary" /></IconButton>
                  <IconButton onClick={() => handleDelete(row._id)}><DeleteIcon color="error" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Container sx={{ mt: 4 }}>
      
      <Box mt={2}>
          {/* Example: Use the first record's id for PDF download if available */}
          {bankBookData.length > 0 && (
            <DownloadPDFButton
              documentType="bank_book"
              documentId={bankBookData[0]._id}
              fileName="bank_book.pdf"
            />
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default BankBookForm;