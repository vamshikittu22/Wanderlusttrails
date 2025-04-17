//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log('Redirecting to login: Not authenticated', { isAuthenticated, user });
    toast.error('You are not authorized. Please log in.');
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    console.log('Redirecting due to role mismatch', { userRole: user.role, requiredRole });
    toast.error('You do not have permission to access this page.');
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;