import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import Filters from './property/Filters';
import PropertyGrid from './property/PropertyGrid';
import { usePropertyFetchAndFilterStore } from '../store/propertyStore';
import FinancialCalculator from './FinancialCalculator';

const HomePage: React.FC = () => {
  const { fetchProperties } = usePropertyFetchAndFilterStore();

  useEffect(() => {
    fetchProperties(); // Fetch properties on initial render
  }, [fetchProperties]);

  return (
    <Box sx={{ padding: 2 }}>
      <FinancialCalculator />
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
          Properties
        </Typography>
        <Filters />
        <PropertyGrid />
      </Box>
    </Box>
  );
};

export default HomePage;
