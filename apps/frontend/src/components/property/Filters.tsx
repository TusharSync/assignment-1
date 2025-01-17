import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Slider,
  Typography,
} from '@mui/material';
import { usePropertyFetchAndFilterStore } from '../../store/propertyStore';

const Filters: React.FC = () => {
  const { filters, setFilters, fetchProperties } =
    usePropertyFetchAndFilterStore();

  const [toggleLevel, setToggleLevel] = useState<
    'market' | 'neighbourhood' | null
  >(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);

  const handleFilterChange = (
    key: keyof typeof filters,
    value: string | number
  ) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleToggleChange = (
    event: React.MouseEvent<HTMLElement>,
    newLevel: 'market' | 'neighbourhood' | null
  ) => {
    setToggleLevel(newLevel);
    if (newLevel === 'market') {
      setFilters({
        ...filters,
        marketLevel: true,
        neighborhoodLevel: undefined,
        low: priceRange[0],
        high: priceRange[1],
      });
    } else if (newLevel === 'neighbourhood') {
      setFilters({
        neighborhoodLevel: true,
        marketLevel: undefined,
      });
    } else {
      setFilters({
        ...filters,
        neighborhoodLevel: undefined,
        marketLevel: undefined,
      });
    }
  };

  const handleClearFilters = () => {
    setFilters({});
    setToggleLevel(null);
    setPriceRange([0, 1000000]);
    fetchProperties();
  };

  const handlePriceRangeChange = (event: Event, newRange: Array<number>) => {
    if (Array.isArray(newRange)) {
      setPriceRange([newRange[0], newRange[1]]);
      setFilters({ ...filters, low: newRange[0], high: newRange[1] });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Price"
          type="number"
          value={filters.price || ''}
          onChange={(e) =>
            handleFilterChange(
              'price',
              e.target.value === '' ? '' : Number(e.target.value)
            )
          }
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
      </Box>

      <ToggleButtonGroup
        value={toggleLevel}
        exclusive
        onChange={handleToggleChange}
        aria-label="Filter Level"
      >
        <ToggleButton value="market" aria-label="Market Level">
          Market Level
        </ToggleButton>
        <ToggleButton value="neighbourhood" aria-label="Neighbourhood Level">
          Neighbourhood Level
        </ToggleButton>
      </ToggleButtonGroup>

      {toggleLevel === 'market' && (
        <Box sx={{ mt: 2 }}>
          <Typography gutterBottom>Price Range</Typography>
          <Slider
            value={priceRange}
            onChange={handlePriceRangeChange as any}
            valueLabelDisplay="auto"
            min={0}
            max={10000000}
            step={1000}
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              label="Low Price"
              type="number"
              value={priceRange[0]}
              onChange={(e) => {
                const newLowPrice = Math.max(0, Number(e.target.value));
                setPriceRange([newLowPrice, priceRange[1]]);
                setFilters({ ...filters, low: newLowPrice });
              }}
              fullWidth
            />
            <TextField
              label="High Price"
              type="number"
              value={priceRange[1]}
              onChange={(e) => {
                const newHighPrice = Number(e.target.value);
                setPriceRange([priceRange[0], newHighPrice]);
                setFilters({ ...filters, high: newHighPrice });
              }}
              fullWidth
            />
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Button variant="contained" onClick={fetchProperties}>
          Apply
        </Button>
        <Button variant="outlined" onClick={handleClearFilters}>
          Clear Filters
        </Button>
      </Box>
    </Box>
  );
};

export default Filters;
