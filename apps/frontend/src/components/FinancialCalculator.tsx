import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Snackbar,
  Alert,
  Chip,
} from '@mui/material';

const FinancialCalculator: React.FC = () => {
  const [cashFlows, setCashFlows] = useState<number[]>([]);
  const [currentCashFlow, setCurrentCashFlow] = useState<string>('');
  const [propertyValue, setPropertyValue] = useState<number | ''>('');
  const [netOperatingIncome, setNetOperatingIncome] = useState<number | ''>('');
  const [irrResult, setIrrResult] = useState<number | null>(null);
  const [capRateResult, setCapRateResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // IRR Calculation
  const calculateIRR = (cashFlows: number[]): number => {
    const NPV = (rate: number) =>
      cashFlows.reduce(
        (acc, cashFlow, i) => acc + cashFlow / Math.pow(1 + rate, i),
        0
      );
    let rate = 0.1; // Initial guess
    for (let i = 0; i < 100; i++) {
      const npv = NPV(rate);
      if (Math.abs(npv) < 0.01) break;
      rate += npv > 0 ? 0.01 : -0.01;
    }
    return rate;
  };

  // Cap Rate Calculation
  const calculateCapRate = (
    propertyValue: number,
    netOperatingIncome: number
  ): number => {
    return (netOperatingIncome / propertyValue) * 100;
  };

  const handleAddCashFlow = () => {
    const value = parseFloat(currentCashFlow);
    if (isNaN(value) || value < 0) {
      setError('Cash flow must be a non-negative number!');
      return;
    }
    setCashFlows((prev) => [...prev, value]);
    setCurrentCashFlow('');
  };

  const handleDeleteCashFlow = (index: number) => {
    setCashFlows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCalculate = () => {
    try {
      // Validate inputs
      if (cashFlows.length === 0 || !propertyValue || !netOperatingIncome) {
        setError('All fields are required!');
        return;
      }

      const irr = calculateIRR(cashFlows);
      const capRate = calculateCapRate(
        Number(propertyValue),
        Number(netOperatingIncome)
      );

      setIrrResult(irr);
      setCapRateResult(capRate);
      setError(null); // Clear errors if successful
    } catch (err) {
      setError('An error occurred while calculating values.');
    }
  };

  return (
    <Box
      sx={{
        padding: 3,
        marginTop: 4,
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#ffffff',
      }}
    >
      <Typography variant="h5" gutterBottom>
        Financial Calculator
      </Typography>
      <Grid container spacing={2}>
        {/* Cash Flows Input */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Cash Flows
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              alignItems: 'center',
              marginBottom: 2,
            }}
          >
            {cashFlows.map((flow, index) => (
              <Chip
                key={index}
                label={`$${flow}`}
                onDelete={() => handleDeleteCashFlow(index)}
                color="primary"
              />
            ))}
          </Box>
          <TextField
            label="Enter Cash Flow"
            variant="outlined"
            fullWidth
            value={currentCashFlow}
            onChange={(e) => setCurrentCashFlow(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCashFlow();
              }
            }}
            helperText="Press Enter to add cash flow (non-negative numbers only)"
          />
          <Button
            sx={{ marginTop: 1 }}
            variant="contained"
            onClick={handleAddCashFlow}
            disabled={!currentCashFlow.trim()}
          >
            Add Cash Flow
          </Button>
        </Grid>
        {/* Property Value Input */}
        <Grid item xs={6}>
          <TextField
            label="Property Value"
            variant="outlined"
            type="number"
            fullWidth
            value={propertyValue}
            onChange={(e) => setPropertyValue(parseFloat(e.target.value) || '')}
          />
        </Grid>
        {/* Net Operating Income Input */}
        <Grid item xs={6}>
          <TextField
            label="Net Operating Income"
            variant="outlined"
            type="number"
            fullWidth
            value={netOperatingIncome}
            onChange={(e) =>
              setNetOperatingIncome(parseFloat(e.target.value) || '')
            }
          />
        </Grid>
      </Grid>
      {/* Calculate Button */}
      <Button
        variant="contained"
        color="primary"
        sx={{ marginTop: 3 }}
        fullWidth
        onClick={handleCalculate}
      >
        Calculate
      </Button>
      {/* Results */}
      {irrResult !== null && capRateResult !== null && (
        <Box sx={{ marginTop: 3 }}>
          <Typography variant="body1">
            <strong>IRR:</strong> {(irrResult * 100).toFixed(2)}%
          </Typography>
          <Typography variant="body1">
            <strong>Cap Rate:</strong> {capRateResult.toFixed(2)}%
          </Typography>
        </Box>
      )}
      {/* Error Snackbar */}
      {error && (
        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
        >
          <Alert
            onClose={() => setError(null)}
            severity="error"
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default FinancialCalculator;
