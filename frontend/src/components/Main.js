import React from "react";
import { AppBar, Toolbar, Typography, Box, Grid,Card , CardContent } from "@mui/material";

const MainForm = () => {
  return (
      <AppBar position="static" sx={{ bgcolor: "#3998FF" }}>
        <Toolbar>
          <Typography variant="h4" sx={{ flexGrow: 5, color: "white" }}>
            Financial Management Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
  );
};

export default MainForm;
