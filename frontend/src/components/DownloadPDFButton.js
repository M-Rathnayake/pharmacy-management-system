import React from 'react';
import { Button } from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Explicitly import autoTable

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
      doc.text(`${documentType} Report`, 14, 30);

      // Add line separator
      doc.setDrawColor(57, 152, 255); // #3998ff
      doc.setLineWidth(0.5);
      doc.line(14, 35, 200, 35);

      // Prepare table data
      const columns = [
        { header: 'Period', dataKey: 'period' },
        { header: 'Revenue (Rs.)', dataKey: 'revenue' },
        { header: 'Expenses (Rs.)', dataKey: 'expenses' },
        { header: 'Net Profit (Rs.)', dataKey: 'net_Profit' },
      ];

      const rows = data.map((item) => {
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
          net_Profit: item.profit.toLocaleString('en-IN'), // Use 'profit' from MongoDB
        };
      });

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
          1: { cellWidth: 'auto', halign: 'right' }, // Revenue
          2: { cellWidth: 'auto', halign: 'right' }, // Expenses
          3: { cellWidth: 'auto', halign: 'right' }, // Net Profit
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
      const sanitizedFileName = (fileName || `${documentType}_statement.pdf`).replace(
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
    <div>
      <Button
        variant="contained"
        onClick={() => handleDownload(false)}
        sx={{
          backgroundColor: '#3998ff',
          color: 'white',
          '&:hover': { backgroundColor: '#2979ff' },
          mr: 1,
          ...sx,
        }}
      >
        Download PDF
      </Button>
      <Button
        variant="outlined"
        onClick={() => handleDownload(true)}
        sx={{
          borderColor: '#3998ff',
          color: '#3998ff',
          '&:hover': { borderColor: '#2979ff', color: '#2979ff' },
        }}
      >
        View PDF
      </Button>
    </div>
  );
};

export default DownloadPDFButton;