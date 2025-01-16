import React from 'react';
import { Box, TextField, Button } from '@mui/material';
import { usePropertyFetchAndFilterStore } from '../../store/propertyStore';

const Filters: React.FC = () => {
  const { filters, setFilters, fetchProperties } =
    usePropertyFetchAndFilterStore();

  const handleFilterChange = (
    key: keyof typeof filters,
    value: string | number
  ) => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
      <TextField
        label="Price"
        type="number"
        value={filters.price || ''}
        onChange={(e) => handleFilterChange('price', Number(e.target.value))}
        fullWidth
      />
      <TextField
        label="Location"
        value={filters.location || ''}
        onChange={(e) => handleFilterChange('location', e.target.value)}
        fullWidth
      />
      <TextField
        label="Property Type"
        value={filters.propertyType || ''}
        onChange={(e) => handleFilterChange('propertyType', e.target.value)}
        fullWidth
      />
      <TextField
        label="City"
        value={filters.city || ''}
        onChange={(e) => handleFilterChange('city', e.target.value)}
        fullWidth
      />
      <TextField
        label="State"
        value={filters.state || ''}
        onChange={(e) => handleFilterChange('state', e.target.value)}
        fullWidth
      />
      <TextField
        label="Area"
        value={filters.area || ''}
        onChange={(e) => handleFilterChange('area', e.target.value)}
        fullWidth
      />
      <Button variant="contained" onClick={fetchProperties}>
        Apply
      </Button>
    </Box>
  );
};

export default Filters;
