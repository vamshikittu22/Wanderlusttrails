import React, {useState} from "react";
import { Link, NavLink } from "react-router-dom";
import { Nav, Navbar,NavDropdown,Container, Form, Button} from 'react-bootstrap'
import logo from '../../assets/Images/WanderlustTrails.jpg'


export default function Header() {
    const [isDestinationOpen, setIsDestinationOpen] = useState(false);
    const [isBookOpen, setIsBookOpen] = useState(false);
    const [isPlanOpen, setIsPlanOpen] = useState(false);
    const [isAccountOpen, setIsAccountOpen] = useState('')

    
    const [searchTerm, setSearchTerm] = useState('');
    const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
    };

    const handleSubmit = (e) => {
    e.preventDefault(); 
    //  redirect to search results page
    console.log('Searching for:', searchTerm);
  };

    return (
        <header className=" shadow sticky z-50 top-0 backdrop-blur-lg  border-b border-neutral-700/80">
            <nav className="relative px-4 lg:px-6 py-2.5 mx-auto">
                <div className="flex justify-between items-center ">
                    <Link to="/" className="container flex items-center hover:text-orange-700 hover:shadow-xl">
                        <img
                            src={logo}
                            className="mr-3 h-16"   
                            alt="Logo"
                        />
                        <span className="text-xl tracking-tight flex">Wanderlust Trails</span>

                    </Link>
                    <div className="flex">
                    <Navbar expand="lg" className=" py-2]">
                        <Container fluid>
                            <Navbar.Toggle aria-controls="navbarScroll" className="border-b bg-gray-300" />
                            <Navbar.Collapse  id="navbarScroll">
                                <Nav
                                className="my-2 my-lg-0 items-center space-x-1" 
                                style={{ maxHeight: '100px' }}
                                navbarScroll
                                >
                                <NavLink
                                    to='/'
                                    className={({ isActive }) => 
                                    `nav-link ${isActive ? "text-orange-700" : "text-gray-100"} hover:text-orange-700 transition-all duration-200`
                                    }
                                >Home
                                </NavLink>
                                
                                <NavDropdown
                                    title={<span className="text-gray-100 hover:text-orange-700">Destinations</span>}
                                    menuVariant="dark"
                                    show={isDestinationOpen}
                                    onToggle={() => setIsDestinationOpen(!isDestinationOpen)}
                                >
                                    <NavDropdown.Item
                                    as={NavLink}
                                    to="/service1"
                                    className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200"
                                    >Service 1
                                    </NavDropdown.Item>
                                    <NavDropdown.Item
                                    as={NavLink}
                                    to="/service2"
                                    className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200"
                                    >Service 2
                                    </NavDropdown.Item>
                                    <NavDropdown.Item
                                    as={NavLink}
                                    to="/service3"
                                    className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200"
                                    >Review
                                    </NavDropdown.Item>
                                </NavDropdown>

                                <NavDropdown
                                    title={<span className="text-gray-100 hover:text-orange-700">Book</span>}
                                    className="text-gray-700 hover:text-orange-700 transition-all duration-200"
                                    menuVariant="dark"
                                    show={isBookOpen}
                                    onToggle={() => setIsBookOpen(!isBookOpen)}
                                >
                                    <NavDropdown.Item
                                    as={NavLink}
                                    to="FlightAndHotel"
                                    className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200"
                                    >Flight & Hotel
                                    </NavDropdown.Item>
                                    <NavDropdown.Item
                                    as={NavLink}
                                    to="TravelPackages"
                                    className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200"
                                    >Travel Packages
                                    </NavDropdown.Item>
                                    <NavDropdown.Item
                                    as={NavLink}
                                    to="/service3"
                                    className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200"
                                    >Service 3
                                    </NavDropdown.Item>
                                </NavDropdown>

                                <NavLink
                                    to='Blogs'
                                    className={({ isActive }) => 
                                    `nav-link ${isActive ? "text-orange-700" : "text-gray-100"} hover:text-orange-700 transition-all duration-200`
                                    }
                                >Blogs
                                </NavLink>

                                <NavDropdown
                                    title={<span className="text-gray-100 hover:text-orange-700">Plan</span>}
                                    className="text-gray-700 hover:text-orange-700 transition-all duration-200"
                                    menuVariant="dark"
                                    show={isPlanOpen}
                                    onToggle={() => setIsPlanOpen(!isPlanOpen)}
                                >
                                    <NavDropdown.Item
                                    as={NavLink}
                                    to="NeedAssist"
                                    className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200"
                                    >Need Assistance
                                    </NavDropdown.Item>
                                    <NavDropdown.Item
                                    as={NavLink}
                                    to="CurrencyConverter"
                                    className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200"
                                    >Currency Convertor
                                    </NavDropdown.Item>
                                    <NavDropdown.Item
                                    as={NavLink}
                                    to="TravelInsurance"
                                    className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200"
                                    >Travel Insurance
                                    </NavDropdown.Item>
                                </NavDropdown>

                                <NavLink
                                    to='Help'
                                    className={({ isActive }) => 
                                    `nav-link ${isActive ? "text-orange-700" : "text-gray-100"} hover:text-orange-700 transition-all duration-200`
                                    }
                                >Help
                                </NavLink>

                                <NavLink
                                    to='About'
                                    className={({ isActive }) => 
                                    `nav-link ${isActive ? "text-orange-700" : "text-gray-100"} hover:text-orange-700 transition-all duration-200`
                                    }
                                >About
                                </NavLink>

                                <div>
                                    {/* Search Bar */}
                                    <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search destinations..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className=" text-white placeholder-gray-400 rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button type="submit" onClick={handleSubmit} className=" border border-b absolute right-2 top-1/2 transform -translate-y-1/2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
                                    <g fill="black" stroke="orange" stroke-width="1.2"><circle cx="11" cy="11" r="6" fill="green" fill-opacity=".35"/>
                                    <path stroke-linecap="round" d="M11 8a3 3 0 0 0-3 3m12 9l-3-3"/></g></svg>
                                    </button>
                                    </div>
                                </div>
                                </Nav>
                            </Navbar.Collapse>
                        </Container>
                    </Navbar>
                    </div>
                    <div className="">
                        <NavDropdown
                            title="Account"
                            className=" bg-gradient-to-r from-orange-500 to-orange-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none"
                            menuVariant="dark"
                            show={isAccountOpen}
                            onToggle={() => setIsAccountOpen(!isAccountOpen)}
                        >
                            <NavDropdown.Item
                            as={NavLink}
                            to="/Login"
                            className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 "
                            >Login
                            </NavDropdown.Item>
                            <NavDropdown.Item
                            as={NavLink}
                            to="/Signup"
                            className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800"
                            >Signup
                            </NavDropdown.Item>
                            <NavDropdown.Item
                            as={NavLink}
                            to="ForgotPassword"
                            className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800"
                            >Forgot Password
                            </NavDropdown.Item>
                            <NavDropdown.Item
                            as={NavLink}
                            to="#"
                            className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800"
                            >Logout
                            </NavDropdown.Item>
                        </NavDropdown>
                    </div>   
                    
                </div>
            </nav>
        </header>
    );
}

