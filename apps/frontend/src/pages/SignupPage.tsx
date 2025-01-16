import { useNavigate } from 'react-router-dom';
import SignupForm from '../components/Auth/SignupForm';
import { Box, Typography } from '@mui/material';

const SignupPage = () => {
  const navigate = useNavigate();

  const handleSignupSuccess = () => {
    navigate('/login');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        padding: 2,
      }}
    >
      <Typography variant="h4" sx={{ marginBottom: 4 }}>
        Create Your Account
      </Typography>
      <SignupForm onSuccess={handleSignupSuccess} />
    </Box>
  );
};

export default SignupPage;
