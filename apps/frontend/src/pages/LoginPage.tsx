import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';
import { Box, Typography } from '@mui/material';
import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

const LoginPage = () => {
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (currentUser?.isLoggedIn) {
      navigate('/home');
    }
  });
  console.log('Login page is rendered');

  const handleLoginSuccess = () => {
    navigate('/');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'white', // Set the background color to white for the entire page
        padding: 2,
      }}
    >
      <Typography variant="h4" sx={{ marginBottom: 4 }}>
        Login to User Account
      </Typography>
      <LoginForm onSuccess={handleLoginSuccess} />
    </Box>
  );
};

export default LoginPage;
