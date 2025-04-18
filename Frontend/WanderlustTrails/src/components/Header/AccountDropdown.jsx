//path: Wanderlusttrails/Frontend/WanderlustTrails/src/components/Header/AccountDropdown.jsx
import React, { useState } from "react";
import { NavDropdown, NavLink } from "react-bootstrap";
import { useUser } from "../../context/UserContext";
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AccountDropdown() {
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const { user, setUser } = useUser(); // Get user and setUser from UserContext
    const navigate = useNavigate(); // Hook for navigation


    const handleLogout = async () => {
        try {
            // Call the logout endpoint to end the session on the server
            const response = await axios.get('http://localhost/WanderlustTrails/backend/config/logout.php');
            console.log(response.data);
    
            if (response.data.success) {
                // Clear user context and localStorage
                setUser(null);
                localStorage.removeItem('user');
                localStorage.removeItem('token'); // Clear the token as well
                
                // Show the success toast with the PHP message
                toast.success(response.data.message, {
                    position: "top-center",
                    autoClose: 3000, // Show for 3 seconds
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: false
                });
    
                // Redirect to the login page after a brief delay
                setTimeout(() => {
                    navigate('/login');
                }, 100); // Redirect after toast disappears
    
            } else {
                // If there's an error in the PHP response, display it in the toast
                toast.error(response.data.message || 'An error occurred during logout. Retry!!', {
                    position: "top-center",
                    autoClose: 500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                });
            }
    
        } catch (error) {
            console.error("Error during logout:", error);
    
            // Handle network or server error
            toast.error("Error during logout. Please try again.", {
                position: "top-center",
                autoClose: 500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
        }
    };  
    
    return (
        <NavDropdown
            title="Account"
            className="bg-gradient-to-r from-orange-500 to-orange-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none"
            menuVariant="dark"
            show={isAccountOpen}
            onToggle={() => setIsAccountOpen(!isAccountOpen)}
        >
            {!user ? (
                <>
                    <NavDropdown.Item as={NavLink} to="/Login" className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800">Login</NavDropdown.Item>
                    <NavDropdown.Item as={NavLink} to="/Signup" className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800">Signup</NavDropdown.Item>
                    <NavDropdown.Item as={NavLink} to="/ForgotPassword" className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800">Forgot Password</NavDropdown.Item>
                </>
            ) : (
                <>
                    <NavDropdown.Item as={NavLink} to="/Profile" className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800">Profile</NavDropdown.Item>
                    <NavDropdown.Item as={NavLink} to="" onClick={handleLogout} className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800">Logout</NavDropdown.Item>
                </>
            )}
        </NavDropdown>
    );
}
