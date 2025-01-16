import { useState } from 'react';
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { usePropertyStore } from '../../store/propertyStore';
import CloseIcon from '@mui/icons-material/Close'; // Import Close icon
import { addProperty } from '../../services/api/property';

const PropertyModal = () => {
  const { isModalOpen, setModalOpen } = usePropertyStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    trigger,
  } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setModalOpen(false);
    reset(); // Reset form fields
  };

  const onSubmit = async (data: any) => {
    // Validate all fields before proceeding
    const isValid = await trigger();
    if (!isValid) {
      console.log('Validation failed');
      return; // Stop submission if validation fails
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Append form fields to FormData
      formData.append('title', data.title);
      formData.append('price', data.price);
      formData.append('location', data.location);
      formData.append('propertyType', data.propertyType);
      formData.append('city', data.city);
      formData.append('state', data.state);
      formData.append('area', data.area);

      // Append file to FormData
      if (data.file && data.file.length > 0) {
        formData.append('file', data.file[0]); // Append only the first file
      } else {
        alert('Please select a valid PDF file');
        setIsSubmitting(false);
        return;
      }

      // Send FormData using the API
      await addProperty(formData);
      alert('Property created successfully!');
      handleClose(); // Close the modal
    } catch (error) {
      console.error('Error creating property:', error);
      alert('Error creating property');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isModalOpen} onClose={handleClose}>
      <Box sx={modalStyles}>
        <IconButton
          onClick={handleClose}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" sx={{ marginBottom: 2 }}>
          Add New Property
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            {...register('title', {
              required: 'Title is required',
              maxLength: {
                value: 100,
                message: 'Title must be less than 100 characters',
              },
            })}
            error={!!errors.title}
            helperText={errors.title?.message}
          />
          <TextField
            label="Price"
            fullWidth
            margin="normal"
            type="number"
            {...register('price', {
              required: 'Price is required',
              validate: {
                positiveNumber: (value) =>
                  value > 0 || 'Price must be a positive number',
              },
            })}
            error={!!errors.price}
            helperText={errors.price?.message}
          />
          <TextField
            label="Location"
            fullWidth
            margin="normal"
            {...register('location', { required: 'Location is required' })}
            error={!!errors.location}
            helperText={errors.location?.message}
          />
          <TextField
            label="Property Type"
            fullWidth
            margin="normal"
            {...register('propertyType', {
              required: 'Property type is required',
            })}
            error={!!errors.propertyType}
            helperText={errors.propertyType?.message}
          />
          <TextField
            label="City"
            fullWidth
            margin="normal"
            {...register('city', { required: 'City is required' })}
            error={!!errors.city}
            helperText={errors.city?.message}
          />
          <TextField
            label="State"
            fullWidth
            margin="normal"
            {...register('state', { required: 'State is required' })}
            error={!!errors.state}
            helperText={errors.state?.message}
          />
          <TextField
            label="Area"
            fullWidth
            margin="normal"
            {...register('area', { required: 'Area is required' })}
            error={!!errors.area}
            helperText={errors.area?.message}
          />

          {/* File Upload Field */}
          <Controller
            name="file"
            control={control}
            rules={{
              required: 'File is required',
              validate: {
                isPDF: (files) =>
                  files?.[0]?.type === 'application/pdf' ||
                  'Only PDF files are allowed',
                singleFile: (files) =>
                  files?.length === 1 || 'Only one file is allowed',
                fileSize: (files) => {
                  const maxSize = 5 * 1024 * 1024; // 5MB
                  return (
                    files?.[0]?.size <= maxSize ||
                    'File size must be less than 5MB'
                  );
                },
              },
            }}
            render={({ field: { onChange } }) => (
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => {
                  onChange(e.target.files); // Pass files to react-hook-form
                }}
                style={{ marginTop: 16 }}
              />
            )}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ marginTop: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Submit'
            )}
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

const modalStyles = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  padding: 2,
  width: 400,
  height: 'auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

export default PropertyModal;
