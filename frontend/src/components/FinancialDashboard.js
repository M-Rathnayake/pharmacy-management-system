import React from "react";
import BalanceSheet from "./BalanceSheet";
import axios from "axios";
import ProfitLossForm from "./ProfitLoss";
import BankBookForm from "./BankBook";
import PettyCashForm from "./PettyCash";
import LedgerForm from "./Ledger";
import SalaryForm from "./Salary";
import Main from "./Main";
import Header from "./Header";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import MainForm from "./Main";

function FinancialDashboard() {
  return (
    <Router>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        {/* Header - now at the very top */}
        <Header />
        
        {/* Main content area with sidebar and content */}
        <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
          {/* Sidebar */}
          <Drawer
            sx={{
              width: 240,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: 240,
                boxSizing: "border-box",
                backgroundColor: "#3998ff",
                color: "#FFFFFF",
                marginTop: "70px", // Adjust this to match your header height
              },
              "& .Mui-selected": {
                backgroundColor: "#3998ff",
              },
              "& .MuiListItemText-root": {
                color: "white",
              },
            }}
            variant="permanent"
            anchor="left"
          >
            <List>
              <ListItem button component={Link} to="/main">
                <ListItemText primary="Main" />
              </ListItem>
              <ListItem button component={Link} to="/profit-loss">
                <ListItemText primary="Profit & Loss" />
              </ListItem>
              <ListItem button component={Link} to="/balance-sheet">
                <ListItemText primary="Balance Sheet" />
              </ListItem>
              <ListItem button component={Link} to="/bank-book">
                <ListItemText primary="Bank Book" />
              </ListItem>
              <ListItem button component={Link} to="/ledger">
                <ListItemText primary="Ledger" />
              </ListItem>
              <ListItem button component={Link} to="/salary">
                <ListItemText primary="Salary" />
              </ListItem>
              <ListItem button component={Link} to="/petty-cash">
                <ListItemText primary="Petty Cash" />
              </ListItem>
            </List>
          </Drawer>

          {/* Main Content Area */}
          <Box
            component="main"
            sx={{ 
              flexGrow: 1, 
              bgcolor: "#f5f5f5", 
              p: 3,
              marginTop: "30px", // Match header height
              overflow: "auto",
              height: "calc(100vh - 70px)" // Adjust height accounting for header
            }}
          >
            <Routes>
              <Route path="/main" element={<MainForm/>} />
              <Route path="/profit-loss" element={<ProfitLossForm/>} />
              <Route path="/balance-sheet" element={<BalanceSheet />} />
              <Route path="/bank-book" element={<BankBookForm/>} />
              <Route path="/ledger" element={<LedgerForm/>} />
              <Route path="/salary" element={<SalaryForm/>} />
              <Route path="/petty-cash" element={<PettyCashForm/>} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </Router>
  );
}

export default FinancialDashboard;