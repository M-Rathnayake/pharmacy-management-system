import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { getSupplierReport } from '../api';

function SupplierReport() {
  const [report, setReport] = useState([]);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    const { data } = await getSupplierReport();
    setReport(data);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Supplier Performance Report</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Delivery Time</TableCell>
            <TableCell>Quality Rating</TableCell>
            <TableCell>Compliance</TableCell>
            <TableCell>Flagged</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {report.map((supplier, index) => (
            <TableRow key={index}>
              <TableCell>{supplier.name}</TableCell>
              <TableCell>{supplier.deliveryTime}</TableCell>
              <TableCell>{supplier.qualityRating}</TableCell>
              <TableCell>{supplier.compliance ? 'Yes' : 'No'}</TableCell>
              <TableCell>{supplier.flagged ? 'Yes' : 'No'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default SupplierReport;