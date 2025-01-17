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
      <Typography variant="h4" gutterBottom>
        Home
      </Typography>
      <Filters />
      <FinancialCalculator />
      <PropertyGrid />
    </Box>
  );
};

export default HomePage;
