import { Box, Typography } from '@mui/material';
import PropertyListPage from './PropertyListPage';

const AdminHome = () => {
  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ marginBottom: 3 }}>
        Admin Dashboard
        <PropertyListPage />
      </Typography>
    </Box>
  );
};

export default AdminHome;
