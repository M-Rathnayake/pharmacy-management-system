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

const BalanceSheetForm = () => {
  const [periods, setPeriods] = useState("");
  const [assets, setAssets] = useState("");
  const [equity, setEquity] = useState("");
  const [liabilities, setLiabilities] = useState("");
  const [balanceData, setBalanceData] = useState([]);
  const [errors, setErrors] = useState({});
  const [alertMsg, setAlertMsg] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchBalanceData();
  }, []);

  const fetchBalanceData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/balancesheet");
      setBalanceData(response.data);
    } catch (error) {
      console.error("Error fetching balance sheet data:", error);
    }
  };

  const validateForm = () => {
    let formErrors = {};
    if (!periods.trim()) formErrors.periods = "Period is required";
    if (!assets) formErrors.assets = "Assets are required";
    if (!equity) formErrors.equity = "Equity is required";
    if (!liabilities) formErrors.liabilities = "Liabilities are required";
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
      periods,
      assets: Number(assets),
      equity: Number(equity),
      liabilities: Number(liabilities),
    };

    try {
      if (!isEditing) {
        const response = await axios.post("http://localhost:8080/api/balancesheet/balancesheet", newData);
        console.log("Added:", response.data);
      } else {
        await axios.put(`http://localhost:8080/api/balancesheet/${editingId}`, newData);
        setIsEditing(false);
        setEditingId(null);
      }

      setPeriods("");
      setAssets("");
      setEquity("");
      setLiabilities("");
      setErrors({});
      fetchBalanceData();
    } catch (error) {
      console.error("Error submitting data:", error);
      setAlertMsg("Error submitting data. Please try again.");
    }
  };

  const handleEdit = (id) => {
    const data = balanceData.find((item) => item._id === id);
    setPeriods(data.periods);
    setAssets(data.assets.toString());
    setEquity(data.equity.toString());
    setLiabilities(data.liabilities.toString());
    setEditingId(id);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/balancesheet/${id}`);
      fetchBalanceData();
    } catch (error) {
      console.error("Error deleting data:", error);
      setAlertMsg("Error deleting data. Please try again.");
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>Balance Sheet Management</Typography>
      {alertMsg && <Alert severity="error">{alertMsg}</Alert>}

      {/* Form */}
      <Grid container spacing={2} component="form" onSubmit={handleSubmit}>
        <Grid item xs={6}>
          <TextField label="Period" fullWidth value={periods} onChange={(e) => setPeriods(e.target.value)} error={Boolean(errors.periods)} helperText={errors.periods} required />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Assets" type="number" fullWidth value={assets} onChange={(e) => setAssets(e.target.value)} error={Boolean(errors.assets)} helperText={errors.assets} required />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Equity" type="number" fullWidth value={equity} onChange={(e) => setEquity(e.target.value)} error={Boolean(errors.equity)} helperText={errors.equity} required />
        </Grid>
        <Grid item xs={6}>
          <TextField label="Liabilities" type="number" fullWidth value={liabilities} onChange={(e) => setLiabilities(e.target.value)} error={Boolean(errors.liabilities)} helperText={errors.liabilities} required />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary">{isEditing ? "Update" : "Add"}</Button>
        </Grid>
      </Grid>

      {/* Balance Sheet Table */}
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Period</TableCell>
              <TableCell>Assets</TableCell>
              <TableCell>Equity</TableCell>
              <TableCell>Liabilities</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {balanceData.map((row) => (
              <TableRow key={row._id}>
                <TableCell>{row.periods}</TableCell>
                <TableCell>{row.assets}</TableCell>
                <TableCell>{row.equity}</TableCell>
                <TableCell>{row.liabilities}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(row._id)}><EditIcon color="primary" /></IconButton>
                  <IconButton onClick={() => handleDelete(row._id)}><DeleteIcon color="error" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BalanceSheetForm;
