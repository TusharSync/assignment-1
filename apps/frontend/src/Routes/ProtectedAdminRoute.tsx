import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { ReactElement } from 'react';

interface ProtectedAdminRouteProps {
  element: ReactElement;
}

// Protected Admin Route Component
const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({
  element,
}) => {
  const { currentUser } = useAuthStore();
  // If user is an admin, render the protected route; otherwise, redirect to login
  if (currentUser?.isLoggedIn) {
    if (currentUser?.role === 'admin') {
      return element;
    } else {
      return <Navigate to="/home" />;
    }
  } else {
    console.log("this route is logged");
    
    return <Navigate to="/login" />;
  }
};

export default ProtectedAdminRoute;
