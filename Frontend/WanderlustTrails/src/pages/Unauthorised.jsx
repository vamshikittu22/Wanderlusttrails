//path: Frontend/WanderlustTrails/src/pages/Unauthorised.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    setTimeout(() => {
      navigate('/login');  // Redirect after a timeout
    }, 3000);
  }, [navigate]);

  return (
    <div>
      <h2>You do not have permission to access this page.</h2>
      <p>You will be redirected to the login page shortly...</p>
    </div>
  );
};

export default Unauthorized;
