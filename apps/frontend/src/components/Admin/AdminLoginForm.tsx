import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography } from '@mui/material';
import { adminLogin } from '../../services/api/admin';
import useAuthStore from '../../store/authStore';
import { CommonFormProps } from '../../common/dto';

const AdminLoginForm : React.FC<CommonFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Use useNavigate to redirect the user
  const { setCurrentUser } = useAuthStore();
  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call the login function from your API service
      localStorage.clear()
      const response = await adminLogin({ email, password });
      if (response.data.success) {
        // Assuming the response contains the token, extract it and store it in localStorage
        const token = response.data.data.accessToken; // Adjust this depending on the actual response structure
        const user = response.data.data.user; // Adjust this depending on the actual response structure

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user)
        // Call the onSuccess callback and redirect to the products page
        onSuccess();
        navigate('/admin'); // Redirect to the products page upon successful login
      } else {
        localStorage.clear()
      }
    } catch (err:any) {
      setError('Login failed');
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
        bgcolor: 'background.paper', // Background for the form box
      }}
    >
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        required
        sx={{ marginBottom: 2 }}
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        required
        sx={{ marginBottom: 2 }}
      />
      {error && <Typography color="error" sx={{ marginBottom: 2 }}>{error}</Typography>}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
        sx={{ padding: 1 }}
      >
        {loading ? 'Logging In...' : 'Log In'}
      </Button>
    </Box>
  );
};

export default AdminLoginForm;
