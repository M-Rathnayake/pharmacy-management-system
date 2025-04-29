import React from 'react';
import { Button } from '@mui/material';

const DownloadPDFButton = ({ documentType, documentId, fileName }) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/${documentType}/pdf/${documentId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || `${documentType}.pdf`;
      link.click();
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      onClick={handleDownload}
      sx={{ backgroundColor: '#3998ff', '&:hover': { backgroundColor: 'darkblue' } }}
    >
      Download {documentType} PDF
    </Button>
  );
};

export default DownloadPDFButton;
