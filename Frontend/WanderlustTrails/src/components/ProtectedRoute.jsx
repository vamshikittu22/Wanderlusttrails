// path: Frontend/WanderlustTrails/src/components/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUser } from './../context/UserContext';
import { toast } from 'react-toastify';

// ProtectedRoute component restricts access based on authentication and role
const ProtectedRoute = ({ children, requiredRole }) => {
  // Get user data and authentication state from UserContext
  const { user, isAuthenticated, isInitialized } = useUser();
  const location = useLocation();

  // Function to check if user has access to the route
  const checkAccess = () => {
    console.log('[ProtectedRoute] Checking:', {
      isAuthenticated,
      isInitialized,
      userId: user?.id,
      userRole: user?.role,
      requiredRole,
      pathname: location.pathname,
    });

    // Wait until UserContext initialization completes before allowing access
    if (!isInitialized) {
      console.log('[ProtectedRoute] Waiting for UserContext initialization');
      return { allowed: false, redirect: null };
    }

    // Allow access if already on login page (to avoid redirect loop)
    if (location.pathname === '/login') {
      console.log('[ProtectedRoute] Already on /login, no redirect needed');
      return { allowed: true };
    }

    // Redirect to login if user is not authenticated
    if (!isAuthenticated) {
      console.log('[ProtectedRoute] Not authenticated');
      return {
        allowed: false,
        redirect: '/login',
        message: 'You are not authorized. Please log in.',
      };
    }

    // Redirect to login if user ID is missing (invalid session)
    if (!user?.id) {
      console.log('[ProtectedRoute] Missing user.id');
      return {
        allowed: false,
        redirect: '/login',
        message: 'Session invalid. Please log in again.',
      };
    }

    // Redirect if user role does not match requiredRole prop
    if (requiredRole && user.role !== requiredRole) {
      console.log('[ProtectedRoute] Role mismatch', {
        userRole: user.role,
        requiredRole,
      });
      return {
        allowed: false,
        redirect: '/',
        message: 'You do not have permission to access this page.',
      };
    }

    // Access granted if all checks pass
    console.log('[ProtectedRoute] Access granted');
    return { allowed: true };
  };

  // Destructure access result
  const { allowed, redirect, message } = checkAccess();

  // Show error toast message if access denied and a message is provided
  useEffect(() => {
    if (!allowed && message) {
      console.log('[ProtectedRoute] Showing toast:', message);
      toast.error(message);
    }
  }, [allowed, message]);

  // Redirect to specified route if access denied and redirect provided
  if (!allowed && redirect) {
    console.log('[ProtectedRoute] Redirecting to:', redirect);
    return <Navigate to={redirect} replace />;
  }

  // Render children if provided, otherwise render nested routes via Outlet
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
