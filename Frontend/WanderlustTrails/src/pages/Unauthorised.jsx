//path: Frontend/WanderlustTrails/src/pages/Unauthorised.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  // Redirect to login page after 3 seconds when component mounts
  React.useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');  // Redirect after a timeout
    }, 3000);

    // Clear timeout if component unmounts before redirect
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div>
      <h2>You do not have permission to access this page.</h2>
      <p>You will be redirected to the login page shortly...</p>
    </div>
  );
};

export default Unauthorized;
