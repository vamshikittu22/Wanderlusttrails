import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';
import { toast } from 'react-toastify';

const ProtectedRoute = ({  children, requiredRole }) => {
    const { user, isAuthenticated } = useUser();

    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        toast.error('You are not authorized. Please log in.');
        return <Navigate to="/login" />;
    }

    if (requiredRole && user.role !== requiredRole) {
        // Redirect if role doesn't match
        toast.error('You do not have permission to access this page.');
        return <Navigate to="/login" />;
    }

    
    return <Outlet/>;

};

export default ProtectedRoute;
