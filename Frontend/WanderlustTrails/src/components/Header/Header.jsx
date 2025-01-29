import React, { useState } from "react";
import axios from 'axios';
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Nav, Navbar, NavDropdown, Container } from 'react-bootstrap';
import logo from '../../assets/Images/WanderlustTrails5.webp';
import { useUser } from "../../context/UserContext";
import { toast } from 'react-toastify';


export default function Header() {
    const [isDestinationOpen, setIsDestinationOpen] = useState(false);
    const [isBookOpen, setIsBookOpen] = useState(false);
    const [isPlanOpen, setIsPlanOpen] = useState(false);
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    
    const { user, setUser } = useUser(); // Get user and setUser from UserContext
    const navigate = useNavigate(); // Hook for navigation


    const handleLogout = async () => {
        try {
            // Call the logout endpoint to end the session on the server
            const response = await axios.get('http://localhost/WanderlustTrails/backend/config/auth/logout.php');
            console.log(response.data);
    
            if (response.data.success) {
                // Clear user context and localStorage
                setUser(null);
                localStorage.removeItem('user');
                localStorage.removeItem('token'); // Clear the token as well
                
                // Show the success toast with the PHP message
                toast.success(response.data.message, {
                    position: "top-center",
                    autoClose: 1000, // Show for 1 seconds
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: false
                });
    
                // Redirect to the login page after a brief delay
                setTimeout(() => {
                    navigate('/login');
                }, 500); // Redirect after toast disappears
    
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
    

    const [searchTerm, setSearchTerm] = useState('');
    const handleSearchChange = (e) => setSearchTerm(e.target.value);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        console.log('Searching for:', searchTerm);
        // Redirect to search results page or handle search
    };

    return (
        <header className="shadow sticky z-50 top-0 backdrop-blur-lg border-b border-neutral-700/80">
            <nav className="relative px-4 lg:px-6 py-2.5 mx-auto">
                <div className="flex justify-between items-center">
                    <Link to="/" className="container flex items-center hover:text-orange-700 hover:shadow-xl">
                        <img src={logo} className="mr-3 h-16" alt="Logo" />
                        <span className="text-xl tracking-tight flex">Wanderlust Trails</span>
                    </Link>
                    <div className="flex">
                        <Navbar expand="lg" className="py-2">
                            <Container fluid>
                                <Navbar.Toggle aria-controls="navbarScroll" className="border-b bg-gray-300" />
                                <Navbar.Collapse id="navbarScroll">
                                    <Nav className="my-2 my-lg-0 items-center space-x-1" style={{ maxHeight: '100px' }} navbarScroll>
                                        <NavLink to='/' className={({ isActive }) => `nav-link ${isActive ? "text-orange-700" : "text-gray-100"} hover:text-orange-700 transition-all duration-200`}>
                                            Home
                                        </NavLink>
                                        
                                        {/* <NavDropdown
                                            title={<span className="text-gray-100 hover:text-orange-700">Destinations</span>}
                                            menuVariant="dark"
                                            show={isDestinationOpen}
                                            onToggle={() => setIsDestinationOpen(!isDestinationOpen)}
                                        >
                                            <NavDropdown.Item as={NavLink} to="/service1" className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200">Service 1</NavDropdown.Item>
                                            <NavDropdown.Item as={NavLink} to="/service2" className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200">Service 2</NavDropdown.Item>
                                            <NavDropdown.Item as={NavLink} to="/Review" className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200">Review</NavDropdown.Item>
                                        </NavDropdown> */}

                                        <NavDropdown
                                            title={<span className="text-gray-100 hover:text-orange-700">Book</span>}
                                            menuVariant="dark"
                                            show={isBookOpen}
                                            onToggle={() => setIsBookOpen(!isBookOpen)}
                                        >
                                            <NavDropdown.Item as={NavLink} to="/FlightAndHotel" className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200">Flight & Hotel</NavDropdown.Item>
                                            <NavDropdown.Item as={NavLink} to="/TravelPackages" className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200">Travel Packages</NavDropdown.Item>
                                            {/* <NavDropdown.Item as={NavLink} to="/service3" className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200">Service 3</NavDropdown.Item> */}
                                        </NavDropdown>

                                        <NavLink to='Blogs' className={({ isActive }) => `nav-link ${isActive ? "text-orange-700" : "text-gray-100"} hover:text-orange-700 transition-all duration-200`}>Blogs</NavLink>

                                        <NavDropdown
                                            title={<span className="text-gray-100 hover:text-orange-700">Plan</span>}
                                            menuVariant="dark"
                                            show={isPlanOpen}
                                            onToggle={() => setIsPlanOpen(!isPlanOpen)}
                                        >
                                            <NavDropdown.Item as={NavLink} to="/TodoList" className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200">Todo List</NavDropdown.Item>
                                            <NavDropdown.Item as={NavLink} to="/NeedAssist" className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200">Need Assistance</NavDropdown.Item>
                                            <NavDropdown.Item as={NavLink} to="/CurrencyConverter" className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200">Currency Converter</NavDropdown.Item>
                                            <NavDropdown.Item as={NavLink} to="/TravelInsurance" className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200">Travel Insurance</NavDropdown.Item>
                                        </NavDropdown>

                                        <NavLink to='Help' className={({ isActive }) => `nav-link ${isActive ? "text-orange-700" : "text-gray-100"} hover:text-orange-700 transition-all duration-200`}>Help</NavLink>

                                        <NavLink to='About' className={({ isActive }) => `nav-link ${isActive ? "text-orange-700" : "text-gray-100"} hover:text-orange-700 transition-all duration-200`}>About</NavLink>

                                        <div className="relative">
                                            <form onSubmit={handleSearchSubmit}>
                                                <input
                                                    type="text"
                                                    placeholder="Search destinations..."
                                                    value={searchTerm}
                                                    onChange={handleSearchChange}
                                                    className="text-white placeholder-gray-400 rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button type="submit" className="border border-b absolute right-2 top-1/2 transform -translate-y-1/2" aria-label="Search">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
                                                        <g fill="black" stroke="orange" strokeWidth="1.2">
                                                            <circle cx="11" cy="11" r="6" fill="green" fillOpacity=".35" />
                                                            <path strokeLinecap="round" d="M11 8a3 3 0 0 0-3 3m12 9l-3-3" />
                                                        </g>
                                                    </svg>
                                                </button>
                                            </form>
                                        </div>
                                    </Nav>
                                </Navbar.Collapse>
                            </Container>
                        </Navbar>
                    </div>
                    <div>
                        <NavDropdown
                            title="Account"
                            className="bg-gradient-to-r from-orange-500 to-orange-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none"
                            menuVariant="dark"
                            show={isAccountOpen}
                            onToggle={() => setIsAccountOpen(!isAccountOpen)}
                        >
                            {!user ? (
                                <>
                                    <NavDropdown.Item as={NavLink} to="/Login" className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800"
                                    >Login</NavDropdown.Item>
                                    <NavDropdown.Item as={NavLink} to="/Signup" className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800"
                                    >Signup</NavDropdown.Item>
                                    <NavDropdown.Item as={NavLink} to="/ForgotPassword" className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800"
                                    >Forgot Password</NavDropdown.Item>
                                </>
                            ) : (
                                <>
                                    <NavDropdown.Item as={NavLink} to={user?.role === 'admin' ? "/AdminDashboard" : "/Userdashboard"} className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800"
                                    > {user?.role === 'admin' ? "Admin Dashboard" : "User Dashboard"} </NavDropdown.Item>
                                    <NavDropdown.Item as={NavLink} to="" onClick={handleLogout} className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800"
                                    >Logout</NavDropdown.Item>
                                </>
                            )}
                        </NavDropdown>
                    </div>
                </div>
            </nav>
        </header>
    );
}

