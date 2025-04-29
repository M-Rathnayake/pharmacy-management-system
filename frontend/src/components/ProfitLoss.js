import React, { useState, useEffect } from "react";
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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadPDFButton from "./DownloadPDFButton";
import SearchBar from "./SearchBar";

const ProfitLossForm = () => {
  const [period, setPeriod] = useState("");
  const [revenue, setRevenue] = useState("");
  const [expenses, setExpenses] = useState("");
  const [profitLossData, setProfitLossData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [errors, setErrors] = useState({});
  const [alertMsg, setAlertMsg] = useState({ text: "", severity: "error" });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProfitLossData();
  }, []);

  useEffect(() => {
    setFilteredData(profitLossData);
  }, [profitLossData]);

  const fetchProfitLossData = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/profitloss/profitloss");
      setProfitLossData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setAlertMsg({ text: "Error fetching data", severity: "error" });
    }
  };

  const validateForm = () => {
    let formErrors = {};
    let isValid = true;

    if (!period.trim()) {
      formErrors.period = "Period is required";
      isValid = false;
    }

    if (revenue === "") {
      formErrors.revenue = "Revenue is required";
      isValid = false;
    } else if (isNaN(revenue)) {
      formErrors.revenue = "Please enter a valid number";
      isValid = false;
    } else if (Number(revenue) < 0) {
      formErrors.revenue = "Revenue cannot be negative";
      isValid = false;
    }

    if (expenses === "") {
      formErrors.expenses = "Expenses is required";
      isValid = false;
    } else if (isNaN(expenses)) {
      formErrors.expenses = "Please enter a valid number";
      isValid = false;
    } else if (Number(expenses) < 0) {
      formErrors.expenses = "Expenses cannot be negative";
      isValid = false;
    }

    setErrors(formErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    setAlertMsg({ text: "Please fix the errors below before submitting.", severity: "error" });
    return;
  }

  const calculatedProfit = Number(revenue) - Number(expenses);
  const newData = {
    date: period, 
    revenue: Number(revenue),
    expenses: Number(expenses),
    profit: calculatedProfit,
  };

  try {
    const response = await axios.post("http://localhost:8080/api/profitloss/profitloss", newData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Server response:", response.data);
    setAlertMsg({ text: "Data added successfully", severity: "success" });
    resetForm();
    fetchProfitLossData();
  } catch (error) {
    console.error("Error details:", error.response?.data || error.message);
    setAlertMsg({ 
      text: error.response?.data?.message || "Error adding data. Please try again.", 
      severity: "error" 
    });
  }
};

  const resetForm = () => {
    setPeriod("");
    setRevenue("");
    setExpenses("");
    setErrors({});
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (id) => {
    const data = profitLossData.find((item) => item._id === id);
    if (data) {
      setPeriod(data.period);
      setRevenue(data.revenue.toString());
      setExpenses(data.expenses.toString());
      setEditingId(id);
      setIsEditing(true);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/profitloss/profitloss/${id}`);
      setAlertMsg({ text: "Data deleted successfully", severity: "success" });
      fetchProfitLossData();
    } catch (error) {
      console.error("Error deleting data:", error);
      setAlertMsg({ text: "Error deleting data. Please try again.", severity: "error" });
    }
  };

  const displayNetProfit =
    revenue && expenses && !isNaN(revenue) && !isNaN(expenses)
      ? Number(revenue) - Number(expenses)
      : "";

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        <h3>Profit/Loss Data</h3>
        <font align="left" color="#3998ff"><h5>Create a new entry</h5></font>
      </Typography>
      
      {alertMsg.text && (
        <Alert 
          severity={alertMsg.severity} 
          sx={{ mb: 2 }}
          onClose={() => setAlertMsg({ text: "", severity: "error" })}
        >
          {alertMsg.text}
        </Alert>
      )}

      <Grid container spacing={2} component="form" onSubmit={handleSubmit}>
        <Grid item xs={12}>
          <TextField
            label="Period"
            fullWidth
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            error={Boolean(errors.period)}
            helperText={errors.period || "Enter time period (e.g., 2023_01)"}
            required
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Revenue"
            type="number"
            fullWidth
            value={revenue}
            onChange={(e) => {
              setRevenue(e.target.value);
              if (errors.revenue) {
                setErrors({...errors, revenue: ""});
              }
            }}
            error={Boolean(errors.revenue)}
            helperText={errors.revenue || "Enter numeric value only"}
            required
            inputProps={{ min: 0 }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Expenses"
            type="number"
            fullWidth
            value={expenses}
            onChange={(e) => {
              setExpenses(e.target.value);
              if (errors.expenses) {
                setErrors({...errors, expenses: ""});
              }
            }}
            error={Boolean(errors.expenses)}
            helperText={errors.expenses || "Enter numeric value only"}
            required
            inputProps={{ min: 0 }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Net Profit"
            type="number"
            fullWidth
            value={displayNetProfit}
            disabled
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary" sx={{ mr: 2 }}>
            {isEditing ? "Update" : "Add"}
          </Button>
          {isEditing && (
            <Button variant="outlined" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        <font align="left" color="#3998ff"><h5>Profit/Loss Data</h5></font>
      </Typography>
      
      <SearchBar data={profitLossData} searchKey="period" onResults={setFilteredData} />

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Period</TableCell>
              <TableCell align="right">Revenue</TableCell>
              <TableCell align="right">Expenses</TableCell>
              <TableCell align="right">Net Profit</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <TableRow key={row._id}>
                  <TableCell>{row.period}</TableCell>
                  <TableCell align="right">{row.revenue.toLocaleString()}</TableCell>
                  <TableCell align="right">{row.expenses.toLocaleString()}</TableCell>
                  <TableCell align="right">{row.net_Profit.toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(row._id)}>
                      <EditIcon color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(row._id)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Container sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          <font align="left" color="#3998ff"><h5>Print Profit/Loss statement</h5></font>
        </Typography>
        <Box mt={2}>
          {profitLossData.length > 0 && (
            <DownloadPDFButton
              documentType="profit-loss"
              documentId={profitLossData[0]._id}
              fileName="profit_loss_statement.pdf"
            />
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default ProfitLossForm;