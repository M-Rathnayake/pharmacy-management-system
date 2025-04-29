import React, { useState } from "react";
import { TextField, Box } from "@mui/material";

const SearchBar = ({ data, searchKey, onResults }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    if (!value.trim()) {
      onResults(data);
      return;
    }

    const filteredData = data.filter((item) =>
      item[searchKey]?.toLowerCase().includes(value.toLowerCase())
    );

    onResults(filteredData);
  };

  return (
    <Box mb={2}>
      <TextField
        label="Search by Period"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={handleSearch}
      />
    </Box>
  );
};

export default SearchBar;