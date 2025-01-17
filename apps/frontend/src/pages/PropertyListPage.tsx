import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useEffect } from 'react';
import { usePropertyFetchAndFilterStore } from '../store/propertyStore';
import { useNavigate } from 'react-router-dom';

const PropertyListPage: React.FC = () => {
  const { properties, fetchProperties } = usePropertyFetchAndFilterStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ marginBottom: 3 }}>
        Properties
      </Typography>
      <List>
        {properties.map((property) => (
          <ListItem
            key={property._id}
            button
            onClick={() => navigate(`/property/${property._id}`)}
          >
            <ListItemText
              primary={property.title}
              secondary={`Price: $${property.price}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default PropertyListPage;
