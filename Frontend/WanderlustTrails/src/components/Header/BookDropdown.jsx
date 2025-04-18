//path: Frontend/WanderlustTrails/src/components/Header/BookDropdown.jsx
import React, { useState } from "react";
import { NavDropdown, NavLink } from "react-bootstrap";

export default function BookDropdown() {
    const [isBookOpen, setIsBookOpen] = useState(false);

    return (
        <NavDropdown
            title={<span className="text-gray-100 hover:text-orange-700">Book</span>}
            menuVariant="dark"
            show={isBookOpen}
            onToggle={() => setIsBookOpen(!isBookOpen)}
        >
            <NavDropdown.Item as={NavLink} to="/FlightAndHotel" className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200">Flight & Hotel</NavDropdown.Item>
            <NavDropdown.Item as={NavLink} to="/TravelPackages" className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200">Travel Packages</NavDropdown.Item>
            <NavDropdown.Item as={NavLink} to="/service3" className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200">Service 3</NavDropdown.Item>
        </NavDropdown>
    );
}
