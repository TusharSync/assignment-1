import { Snackbar, Alert } from '@mui/material';
import useSnackbarStore from '../store/notificationStore';

const NotificationSnackbar = () => {
  const { snackbarOpen, snackbarMessage, snackbarSeverity, closeSnackbar } = useSnackbarStore();

  return (
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={3000} // Snackbar disappears after 3 seconds
      onClose={(event, reason) => {
        if (reason === 'clickaway') return;
        closeSnackbar();
      }}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={closeSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
        {snackbarMessage}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSnackbar;
