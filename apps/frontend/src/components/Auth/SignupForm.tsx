import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography } from '@mui/material';
import { signup } from '../../services/api/auth';
import { CommonFormProps } from '../../common/dto';

const SignupForm: React.FC<CommonFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    city: '',
    state: '',
    area: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const { email, name, password, city, state, area } = formData;
    if (!email || !name || !password || !city || !state || !area) {
      setError('All fields are required.');
      return false;
    }
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setError('Invalid email format.');
      return false;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await signup(formData);
      if (response.status === 201) {
        onSuccess();
        navigate('/login');
      } else {
        setError('Signup failed. Please try again.');
      }
    } catch (err: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: 400,
        margin: '0 auto',
        padding: 2,
        borderRadius: 1,
        boxShadow: 3,
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Sign Up
      </Typography>
      <TextField
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        fullWidth
        required
        sx={{ marginBottom: 2 }}
        error={!!error && !formData.email}
        helperText={!!error && !formData.email ? error : ''}
      />
      <TextField
        label="Name"
        name="name"
        type="text"
        value={formData.name}
        onChange={handleChange}
        fullWidth
        required
        sx={{ marginBottom: 2 }}
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        fullWidth
        required
        sx={{ marginBottom: 2 }}
        error={!!error && formData.password.length < 8}
        helperText={!!error && formData.password.length < 8 ? 'Password must be at least 8 characters.' : ''}
      />
      <TextField
        label="City"
        name="city"
        type="text"
        value={formData.city}
        onChange={handleChange}
        fullWidth
        required
        sx={{ marginBottom: 2 }}
      />
      <TextField
        label="State"
        name="state"
        type="text"
        value={formData.state}
        onChange={handleChange}
        fullWidth
        required
        sx={{ marginBottom: 2 }}
      />
      <TextField
        label="Area"
        name="area"
        type="text"
        value={formData.area}
        onChange={handleChange}
        fullWidth
        required
        sx={{ marginBottom: 2 }}
      />
      {error && (
        <Typography color="error" sx={{ marginBottom: 2 }}>
          {error}
        </Typography>
      )}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
        sx={{ padding: 1 }}
      >
        {loading ? 'Signing Up...' : 'Sign Up'}
      </Button>
    </Box>
  );
};

export default SignupForm;
