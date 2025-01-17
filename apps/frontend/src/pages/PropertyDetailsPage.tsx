import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Divider,
} from '@mui/material';
import { useEffect } from 'react';
import {usePropertyFetchAndFilterStore} from '../store/propertyStore';
import { useNavigate, useParams } from 'react-router-dom';

const PropertyDetailsPage: React.FC = () => {
  const { selectedProperty, offers, selectProperty } = usePropertyFetchAndFilterStore();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) selectProperty(id);
  }, [id, selectProperty]);

  if (!selectedProperty) {
    return <Typography variant="h6">Loading property details...</Typography>;
  }

  return (
    <Box sx={{ padding: 4 }}>
      {/* Display Selected Property Details */}
      <Box
        sx={{
          marginBottom: 4,
          padding: 2,
          border: '1px solid #ccc',
          borderRadius: '8px',
        }}
      >
        <Typography variant="h5" sx={{ marginBottom: 2 }}>
          Property Details
        </Typography>
        <Typography>
          <strong>Title:</strong> {selectedProperty.title}
        </Typography>
        <Typography>
          <strong>Price:</strong> ${selectedProperty.price}
        </Typography>
        <Typography>
          <strong>Location:</strong> {selectedProperty.location}
        </Typography>
        <Typography>
          <strong>Property Type:</strong> {selectedProperty.propertyType}
        </Typography>
        <Typography>
          <strong>City:</strong> {selectedProperty.city}
        </Typography>
        <Typography>
          <strong>State:</strong> {selectedProperty.state}
        </Typography>
        <Typography>
          <strong>Area:</strong> {selectedProperty.area}
        </Typography>
      </Box>

      {/* Display Offers List */}
      <Typography variant="h4" sx={{ marginBottom: 3 }}>
        Offers for Property
      </Typography>
      <List>
        {offers.map((offer) => (
          <ListItem
            key={offer._id}
            secondaryAction={
              <Button
                variant="outlined"
                onClick={() => navigate(`/offer/${offer._id}/email-thread`)}
              >
                View Email Thread
              </Button>
            }
          >
            <ListItemText
              primary={`Buyer: ${offer.buyerName}`}
              secondary={`Offer Amount: $${offer.offerAmount}`}
            />
          </ListItem>
        ))}
      </List>

      {/* Divider if no offers */}
      {offers.length === 0 && (
        <Typography variant="body1" sx={{ marginTop: 3 }}>
          No offers available for this property.
        </Typography>
      )}
    </Box>
  );
};

export default PropertyDetailsPage;
