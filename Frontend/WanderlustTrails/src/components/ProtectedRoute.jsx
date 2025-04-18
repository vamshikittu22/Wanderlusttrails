// path: Frontend/WanderlustTrails/src/context/ProtectedRoute.jsx
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUser } from './../context/UserContext';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, isAuthenticated, isInitialized } = useUser();
    const location = useLocation();

    const checkAccess = () => {
        console.log('[ProtectedRoute] Checking:', {
            isAuthenticated,
            isInitialized,
            userId: user?.id,
            userRole: user?.role,
            requiredRole,
            pathname: location.pathname,
        });

        if (!isInitialized) {
            console.log('[ProtectedRoute] Waiting for UserContext initialization');
            return { allowed: false, redirect: null };
        }

        if (location.pathname === '/login') {
            console.log('[ProtectedRoute] Already on /login, no redirect needed');
            return { allowed: true };
        }

        if (!isAuthenticated) {
            console.log('[ProtectedRoute] Not authenticated');
            return { allowed: false, redirect: '/login', message: 'You are not authorized. Please log in.' };
        }

        if (!user?.id) {
            console.log('[ProtectedRoute] Missing user.id');
            return { allowed: false, redirect: '/login', message: 'Session invalid. Please log in again.' };
        }

        if (requiredRole && user.role !== requiredRole) {
            console.log('[ProtectedRoute] Role mismatch', { userRole: user.role, requiredRole });
            return { allowed: false, redirect: '/', message: 'You do not have permission to access this page.' };
        }

        console.log('[ProtectedRoute] Access granted');
        return { allowed: true };
    };

    const { allowed, redirect, message } = checkAccess();

    useEffect(() => {
        if (!allowed && message) {
            console.log('[ProtectedRoute] Showing toast:', message);
            toast.error(message);
        }
    }, [allowed, message]);

    if (!allowed && redirect) {
        console.log('[ProtectedRoute] Redirecting to:', redirect);
        return <Navigate to={redirect} replace />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;