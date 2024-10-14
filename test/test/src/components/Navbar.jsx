// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (

        <li className="relative">
        <button 
            className="text-white hover:text-gray-300 focus:outline-none" 
            onClick={toggleDropdown}
        >
            Explore
        </button>
        <ul 
            className={`absolute left-0 mt-2 w-48 bg-white rounded shadow-lg transition-all duration-300 ease-in-out 
            ${dropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
        >
            <li><NavLink className="block px-4 py-2 text-gray-800 hover:bg-gray-200" to="/search">Search</NavLink></li>
            <li><NavLink className="block px-4 py-2 text-gray-800 hover:bg-gray-200" to="/travel-packages">Travel Packages</NavLink></li>
            <li><NavLink className="block px-4 py-2 text-gray-800 hover:bg-gray-200" to="/culture-history">Culture & History</NavLink></li>
        </ul>
    </li>
        
    );
};

export default Navbar;


                       
                    