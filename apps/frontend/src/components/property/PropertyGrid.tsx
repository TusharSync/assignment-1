import React from 'react';
import { Grid, Card, CardContent, Typography, CardMedia } from '@mui/material';
import { usePropertyFetchAndFilterStore } from '../../store/propertyStore';
const PropertyGrid: React.FC = () => {
  const { properties } = usePropertyFetchAndFilterStore();

  return (
    <Grid container spacing={3}>
      {properties.map((property) => (
        <Grid item xs={12} sm={6} md={4} key={property.title}>
          <Card>
            <CardContent>
              <Typography variant="h6">{property.title}</Typography>
              <Typography variant="body2">Price: ${property.price}</Typography>
              <Typography variant="body2">
                Location: {property.location}
              </Typography>
              <Typography variant="body2">
                Type: {property.propertyType}
              </Typography>
              <Typography variant="body2">City: {property.city}</Typography>
              <Typography variant="body2">State: {property.state}</Typography>
              <Typography variant="body2">Area: {property.area}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default PropertyGrid;
