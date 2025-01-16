import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { usePropertyStore } from '../store/propertyStore';
import PropertyModal from './property/PropertyModal';

const Header = () => {
  const navigate = useNavigate(); // Use useNavigate to redirect the user
  const { currentUser, setCurrentUser } = useAuthStore();
  const { setModalOpen } = usePropertyStore();

  const handleLogout = () => {
    if (currentUser?.role === 'admin') {
      localStorage.clear();
      navigate('/admin-login');
    } else {
      localStorage.clear();
      navigate('/login');
    }
    setCurrentUser(undefined);
  };

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'primary.main', boxShadow: 4 }}>
      <PropertyModal />
      <Toolbar>
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          My App
        </Typography>

        <Box>
          {/* Add Property button, shown only if logged in as admin */}
          {currentUser?.isLoggedIn && currentUser?.role === 'admin' && (
            <Button
              color="secondary"
              variant="contained"
              sx={{
                marginRight: 2,
                ':hover': {
                  bgcolor: 'secondary.main',
                  color: 'white',
                },
              }}
              onClick={() => {
                setModalOpen(true);
              }}
            >
              Add Property
            </Button>
          )}
          {!currentUser?.isLoggedIn && (
            <>
              <Button
                color="secondary"
                variant="contained"
                component="a"
                href="/login"
                sx={{
                  marginLeft: 2,
                  ':hover': {
                    bgcolor: 'secondary.main',
                    color: 'white',
                  },
                }}
              >
                User-Login
              </Button>

              <Button
                color="secondary"
                variant="contained"
                component="a"
                href="/admin-login"
                sx={{
                  marginLeft: 2,
                  ':hover': {
                    bgcolor: 'secondary.main',
                    color: 'white',
                  },
                }}
              >
                Admin-Login
              </Button>
              <Button
                color="secondary"
                variant="contained"
                component="a"
                href="/signup"
                sx={{
                  marginLeft: 2,
                  ':hover': {
                    bgcolor: 'secondary.main',
                    color: 'white',
                  },
                }}
              >
                User Sign Up
              </Button>
            </>
          )}
        </Box>
        <Box>
          {/* Logout Button */}
          {currentUser?.isLoggedIn && (
            <Button
              color="error"
              variant="contained"
              onClick={handleLogout}
              sx={{
                marginLeft: 2,
                textTransform: 'none',
                ':hover': {
                  bgcolor: 'error.main',
                  color: 'white',
                },
              }}
            >
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
