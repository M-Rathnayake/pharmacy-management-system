import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import { CameraAlt, Close } from '@mui/icons-material';
import Quagga from 'quagga';

const BarcodeScanner = ({ onScan, onClose }) => {
  const scannerRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      if (isScanning) {
        Quagga.stop();
      }
    };
  }, [isScanning]);

  const startScanner = () => {
    setIsScanning(true);
    setError(null);

    Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: scannerRef.current,
        constraints: {
          facingMode: "environment",
          aspectRatio: { min: 1, max: 2 }
        },
      },
      locator: {
        patchSize: "medium",
        halfSample: true
      },
      numOfWorkers: 2,
      decoder: {
        readers: ["ean_reader", "ean_8_reader", "code_128_reader"]
      },
      locate: true
    }, function(err) {
      if (err) {
        setError("Failed to initialize scanner: " + err.message);
        setIsScanning(false);
        return;
      }
      Quagga.start();
    });

    Quagga.onDetected((result) => {
      const code = result.codeResult.code;
      onScan(code);
      Quagga.stop();
      setIsScanning(false);
    });
  };

  const stopScanner = () => {
    if (isScanning) {
      Quagga.stop();
      setIsScanning(false);
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 500, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Scan Barcode</Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Box>

      <Box 
        ref={scannerRef} 
        sx={{ 
          width: '100%', 
          height: 300, 
          bgcolor: 'black',
          borderRadius: 1,
          overflow: 'hidden',
          position: 'relative'
        }}
      />

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
        {!isScanning ? (
          <Button
            variant="contained"
            startIcon={<CameraAlt />}
            onClick={startScanner}
          >
            Start Scanning
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="error"
            onClick={stopScanner}
          >
            Stop Scanning
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default BarcodeScanner; 