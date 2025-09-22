import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Nav, Navbar, Container } from 'react-bootstrap';
import logo from '../../assets/Images/WanderlustTrails5.webp';
import { useUser } from "../../context/UserContext";
import SearchBar from './SearchBar';
import CustomDropdown from './../CustomDropdown';

export default function Header() {
    const { user, isAuthenticated, logout } = useUser();
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);

    const handleLogout = () => {
        console.log('[Header] handleLogout called');
        logout();
        console.log('[Header] Navigating to /login');
        navigate('/login');
    };

    const bookItems = [
        { label: "Flight & Hotel", path: "/FlightAndHotel" },
        { label: "Travel Packages", path: "/TravelPackages" },
        { label: "Customized Itinerary", path: "/CustomizedItinerary" },
    ];

    const planItems = [
        { label: "Todo List", path: "/TodoList" },
        { label: "Currency Converter", path: "/CurrencyConverter" },
        { label: "Need Assistance", path: "/NeedAssist" },
        { label: "Travel Insurance", path: "/TravelInsurance" },
    ];

    const viewItems = [
        { label: "Reviews", path: "/Reviews" },
        { label: "Blogs", path: "/Blogs" },
        { label: "Culture & History", path: "/CultureAndHistory" },
        
    ];

    const aboutItems = [
        { label: "About", path: "/About" },
        { label: "Help", path: "/Help" },
        { label: "Contact", path: "/ContactUs" },
    ];

    const accountItems = !isAuthenticated
        ? [
            { label: "Login", path: "/Login" },
            { label: "Signup", path: "/Signup" },
            { label: "Forgot Password", path: "/ForgotPassword" },
        ]
        : user?.role === 'admin'
        ? [
            { label: "Admin Dashboard", path: "/AdminDashboard" },
            { label: "Logout", path: "", onClick: handleLogout },
          ]
        : [
            { label: "User Dashboard", path: "/Userdashboard" },
            { label: "Logout", path: "", onClick: handleLogout },
          ];

    console.log('[Header] Rendering CustomDropdown for Book:', { bookItems, expanded });

    return (
        <header className="shadow sticky z-50 top-0 backdrop-blur-lg border-b border-neutral-700/80">
            <nav className="relative px-4 lg:px-6 py-2.5 mx-auto">
                <div className="flex justify-between items-center">
                    <Link to="/" className="container flex items-center hover:text-orange-700 hover:shadow-xl">
                        <img src={logo} className="mr-3 h-16" alt="Logo" />
                        <span className="text-xl tracking-tight flex">Wanderlust Trails</span>
                    </Link>
                    <div className="flex">
                        <Navbar
                            expand="lg"
                            className="py-2"
                            expanded={expanded}
                            onToggle={() => {
                                setExpanded(!expanded);
                                console.log('[Header] Navbar toggled:', !expanded);
                            }}
                        >
                            <Container fluid>
                                <Navbar.Toggle aria-controls="navbarScroll" className="border-b bg-gray-300" />
                                <Navbar.Collapse id="navbarScroll">
                                    <Nav
                                        className="my-2 my-lg-0 items-center space-x-1 min-h-[40px]"
                                        navbarScroll
                                    >
                                        <NavLink
                                            to='/'
                                            className={({ isActive }) => `nav-link ${isActive ? "text-orange-700" : "text-gray-100"} hover:text-orange-700 transition-all duration-200`}
                                        >
                                            Home
                                        </NavLink>
                                        {user?.role !== 'admin' && (
                                            <CustomDropdown title="Book" items={bookItems} />
                                        )}
                                        <CustomDropdown title="Plan" items={planItems} />
                                        <CustomDropdown title="View" items={viewItems} />
                                        <CustomDropdown title="About" items={aboutItems} />
                                        {/* <SearchBar /> */} 
                                        
                                    </Nav>
                                </Navbar.Collapse>
                            </Container>
                        </Navbar>
                    </div>
                    <div>
                        <CustomDropdown
                            title="Account"
                            items={accountItems}
                            containerClassName="bg-gradient-to-r from-orange-500 to-orange-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none"
                        />
                    </div>
                </div>
            </nav>
        </header>
    );
}