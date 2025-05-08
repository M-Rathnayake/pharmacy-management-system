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
      doc.text(`${documentType === 'profit-loss' ? 'Profit & Loss Statement' : 
                documentType === 'balance-sheet' ? 'Balance Sheet' : 
                documentType === 'ledger' ? 'Ledger Accounts' : 
                documentType} Report`, 14, 30);

      // Add line separator
      doc.setDrawColor(57, 152, 255); // #3998ff
      doc.setLineWidth(0.5);
      doc.line(14, 35, 200, 35);

      // Add report generation details
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100); // Gray
      const currentDate = new Date().toLocaleDateString('en-IN');
      const currentTime = new Date().toLocaleTimeString('en-IN');
      doc.text(`Generated on: ${currentDate} at ${currentTime}`, 14, 45);

      let columns, rows, summaryData;

      if (documentType === 'profit-loss') {
        columns = [
          { header: 'Period', dataKey: 'period' },
          { header: 'Revenue (Rs.)', dataKey: 'revenue' },
          { header: 'Expenses (Rs.)', dataKey: 'expenses' },
          { header: 'Net Profit (Rs.)', dataKey: 'net_Profit' }
        ];

        rows = data.map((item) => ({
          period: item.period || 'N/A',
          revenue: (item.revenue || 0).toLocaleString('en-IN'),
          expenses: (item.expenses || 0).toLocaleString('en-IN'),
          net_Profit: (item.profit || 0).toLocaleString('en-IN'),
        }));

        // Calculate summary for profit-loss
        const totalRevenue = data.reduce((sum, item) => sum + (item.revenue || 0), 0);
        const totalExpenses = data.reduce((sum, item) => sum + (item.expenses || 0), 0);
        const totalProfit = totalRevenue - totalExpenses;
        summaryData = [
          ['Total Revenue', totalRevenue.toLocaleString('en-IN')],
          ['Total Expenses', totalExpenses.toLocaleString('en-IN')],
          ['Net Profit', totalProfit.toLocaleString('en-IN')]
        ];
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

        // Calculate summary for balance sheet
        const totalAssets = data.reduce((sum, item) => sum + (item.assets?.total_assets || 0), 0);
        const totalLiabilities = data.reduce((sum, item) => sum + (item.liabilities?.total_liabilities || 0), 0);
        const totalEquity = data.reduce((sum, item) => sum + (item.equity?.total_equity || 0), 0);
        summaryData = [
          ['Total Assets', totalAssets.toLocaleString('en-IN')],
          ['Total Liabilities', totalLiabilities.toLocaleString('en-IN')],
          ['Total Equity', totalEquity.toLocaleString('en-IN')],
          ['Balance Status', Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01 ? 'Balanced' : 'Imbalanced']
        ];
      } else if (documentType === 'ledger') {
        columns = [
          { header: 'Account Code', dataKey: 'accountCode' },
          { header: 'Account Name', dataKey: 'accountName' },
          { header: 'Type', dataKey: 'accountType' },
          { header: 'Opening Balance (Rs.)', dataKey: 'openingBalance' },
          { header: 'Balance Type', dataKey: 'balanceType' },
          { header: 'Status', dataKey: 'isActive' }
        ];

        rows = data.map((item) => ({
          accountCode: item.accountCode || 'N/A',
          accountName: item.accountName || 'N/A',
          accountType: item.accountType ? item.accountType.charAt(0).toUpperCase() + item.accountType.slice(1) : 'N/A',
          openingBalance: (item.openingBalance || 0).toLocaleString('en-IN'),
          balanceType: item.balanceType ? item.balanceType.charAt(0).toUpperCase() + item.balanceType.slice(1) : 'N/A',
          isActive: item.isActive ? 'Active' : 'Inactive'
        }));

        // Calculate summary for ledger
        const totalAccounts = data.length;
        const activeAccounts = data.filter(item => item.isActive).length;
        const totalBalance = data.reduce((sum, item) => sum + (item.openingBalance || 0), 0);
        summaryData = [
          ['Total Accounts', totalAccounts.toString()],
          ['Active Accounts', activeAccounts.toString()],
          ['Total Opening Balance', totalBalance.toLocaleString('en-IN')]
        ];
      }

      // Add table
      autoTable(doc, {
        startY: 50,
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
          0: { cellWidth: 'auto' }, // First column
          1: { cellWidth: 'auto' }, // Second column
          2: { cellWidth: 'auto' }, // Third column
          3: { cellWidth: 'auto', halign: 'right' }, // Amount columns
          4: { cellWidth: 'auto' }, // Balance Type/Status
          5: { cellWidth: 'auto' } // Last column
        },
      });

      // Add summary section
      const finalY = doc.lastAutoTable.finalY || 50;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Black
      doc.text('Summary', 14, finalY + 15);

      // Add summary table
      autoTable(doc, {
        startY: finalY + 20,
        head: [['Item', 'Amount']],
        body: summaryData,
        headStyles: {
          fillColor: [57, 152, 255],
          textColor: 255,
          fontSize: 10,
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 'auto', halign: 'right' }
        },
      });

      // Add footer with page numbers and generation details
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('helvetica', 'normal'); // Reset font for footer
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100); // Gray
        doc.text(
          `Page ${i} of ${pageCount} | Generated on ${currentDate} at ${currentTime}`,
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
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF: ' + error.message);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button
        variant="contained"
        startIcon={<Download />}
        onClick={() => handleDownload(false)}
        sx={sx}
      >
        Download PDF
      </Button>
      <Button
        variant="outlined"
        startIcon={<Visibility />}
        onClick={() => handleDownload(true)}
        sx={sx}
      >
        View PDF
      </Button>
    </Box>
  );
};

export default DownloadPDFButton;