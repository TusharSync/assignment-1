import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Header from './components/Header';

import HomePage from './components/Home';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AdminLoginPage from './components/Admin/AdminLoginPage';
import NotificationSnackbar from './components/NotificationSnackbar';
import AdminHome from './pages/AdminHomePage';
import useAuthStore from './store/authStore';
import { useEffect } from 'react';
import ProtectedAdminRoute from './Routes/ProtectedAdminRoute';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import EmailThreadPage from './pages/EmailThreadPage';

function App() {
  const { currentUser } = useAuthStore();
  useEffect(() => {
    console.log('Welcome to dashboard');
  }, [currentUser]);
  // Define a Material-UI theme
  const theme = createTheme({
    palette: {
      primary: {
        main: '#1976d2', // Customize the primary color
      },
      secondary: {
        main: '#9c27b0', // Customize the secondary color
      },
      error: {
        main: '#f44336', // Customize the error color
      },
      background: {
        default: '#f4f6f8', // Customize the background color
      },
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif', // Set default font family
    },
    components: {
      MuiButton: {
        defaultProps: {
          variant: 'contained', // Set default button style
        },
      },
    },
  });
  return (
    <ThemeProvider theme={theme}>
      {/* Global Snackbar */}
      <NotificationSnackbar />
      <Router>
        <Header />
        <Routes>
          {/* Default route redirects to /home */}
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          {/* <Route path="/admin" element={<AdminHome />} /> */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/home" element={<HomePage />} />
          {/* Protected Admin routes */}
          <Route
            path="/admin"
            element={<ProtectedAdminRoute element={<AdminHome />} />}
          />
          <Route
            path="/property/:id"
            element={<ProtectedAdminRoute element={<PropertyDetailsPage />} />}
          />
          <Route
            path="/offer/:id/email-thread"
            element={<ProtectedAdminRoute element={<EmailThreadPage />} />}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
