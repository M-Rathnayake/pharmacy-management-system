import React from 'react';
import { Button, Box } from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Download, Visibility } from '@mui/icons-material';

const DownloadPDFButton = ({ documentType, data, fileName, sx }) => {
  const handleDownload = (openInViewer = false) => {
    try {
      // Validate data
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No data available for PDF generation');
      }

      const doc = new jsPDF();

      // Set default font to avoid undefined font errors
      doc.setFont('helvetica', 'normal');

      // Add header
      doc.setFontSize(18);
      doc.setTextColor(57, 152, 255); // #3998ff
      doc.text('EsyPharma', 14, 20);

      // Add title
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0); // Black
      doc.text(`${documentType === 'profit-loss' ? 'Profit & Loss Statement' : 'Balance Sheet'} Report`, 14, 30);

      // Add line separator
      doc.setDrawColor(57, 152, 255); // #3998ff
      doc.setLineWidth(0.5);
      doc.line(14, 35, 200, 35);

      let columns, rows;

      if (documentType === 'profit-loss') {
        columns = [
          { header: 'Period', dataKey: 'period' },
          { header: 'Revenue (Rs.)', dataKey: 'revenue' },
          { header: 'Expenses (Rs.)', dataKey: 'expenses' },
          { header: 'Net Profit (Rs.)', dataKey: 'net_Profit' }
        ];

        rows = data.map((item) => {
          // Validate item
          if (
            !item.period ||
            typeof item.revenue !== 'number' ||
            typeof item.expenses !== 'number' ||
            typeof item.profit !== 'number'
          ) {
            console.warn('Invalid data item:', item);
            return {
              period: item.period || 'N/A',
              revenue: (typeof item.revenue === 'number' ? item.revenue : 0).toLocaleString('en-IN'),
              expenses: (typeof item.expenses === 'number' ? item.expenses : 0).toLocaleString('en-IN'),
              net_Profit: (typeof item.profit === 'number' ? item.profit : 0).toLocaleString('en-IN'),
            };
          }

          return {
            period: item.period,
            revenue: item.revenue.toLocaleString('en-IN'),
            expenses: item.expenses.toLocaleString('en-IN'),
            net_Profit: item.profit.toLocaleString('en-IN'),
          };
        });
      } else if (documentType === 'balance-sheet') {
        columns = [
          { header: 'Period', dataKey: 'period' },
          { header: 'Date', dataKey: 'date' },
          { header: 'Assets (Rs.)', dataKey: 'assets' },
          { header: 'Liabilities (Rs.)', dataKey: 'liabilities' },
          { header: 'Equity (Rs.)', dataKey: 'equity' },
          { header: 'Status', dataKey: 'status' }
        ];

        rows = data.map((item) => {
          const isBalanced = Math.abs(
            item.assets.total_assets - 
            (item.liabilities.total_liabilities + item.equity.total_equity)
          ) < 0.01;

          return {
            period: item.period || 'N/A',
            date: new Date(item.period_date).toLocaleDateString('en-IN'),
            assets: (item.assets?.total_assets || 0).toLocaleString('en-IN'),
            liabilities: (item.liabilities?.total_liabilities || 0).toLocaleString('en-IN'),
            equity: (item.equity?.total_equity || 0).toLocaleString('en-IN'),
            status: isBalanced ? 'Balanced' : 'Imbalanced'
          };
        });
      }

      // Add table
      autoTable(doc, {
        startY: 40,
        head: [columns.map((col) => col.header)],
        body: rows.map((row) => columns.map((col) => row[col.dataKey])),
        headStyles: {
          fillColor: [57, 152, 255], // #3998ff
          textColor: 255, // White
          fontSize: 10,
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240], // Light gray
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak',
        },
        columnStyles: {
          0: { cellWidth: 'auto' }, // Period
          1: { cellWidth: 'auto' }, // Date
          2: { cellWidth: 'auto', halign: 'right' }, // Assets
          3: { cellWidth: 'auto', halign: 'right' }, // Liabilities
          4: { cellWidth: 'auto', halign: 'right' }, // Equity
          5: { cellWidth: 'auto', halign: 'center' } // Status
        },
      });

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal'); // Reset font for footer
        doc.setFontSize(10);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width - 30,
          doc.internal.pageSize.height - 10
        );
      }

      // Sanitize fileName
      const sanitizedFileName = (fileName || `${documentType}_report.pdf`).replace(
        /[^a-zA-Z0-9._-]/g,
        '_'
      );

      if (openInViewer) {
        // Generate Blob URL for viewing
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
        // Revoke URL after 30 seconds
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 30000);
      } else {
        // Trigger download
        doc.save(sanitizedFileName);
      }
    } catch (error) {
      console.error('Error generating PDF:', error.message, error.stack);
      alert(`Failed to generate PDF: ${error.message}`);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button
        variant="contained"
        onClick={() => handleDownload(false)}
        startIcon={<Download />}
        sx={{
          backgroundColor: '#3998ff',
          color: 'white',
          '&:hover': { backgroundColor: '#2979ff' },
          ...sx,
        }}
      >
        Download PDF
      </Button>
      <Button
        variant="outlined"
        onClick={() => handleDownload(true)}
        startIcon={<Visibility />}
        sx={{
          borderColor: '#3998ff',
          color: '#3998ff',
          '&:hover': { borderColor: '#2979ff', color: '#2979ff' },
          backgroundColor: 'white',
        }}
      >
        View PDF
      </Button>
    </Box>
  );
};

export default DownloadPDFButton;