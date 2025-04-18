//path: Wanderlusttrails/Frontend/WanderlustTrails/src/components/Header/DestinationDropdown.jsx
import React, { useState } from "react";
import { NavDropdown, NavLink } from "react-bootstrap";

export default function DestinationsDropdown() {
    const [isDestinationOpen, setIsDestinationOpen] = useState(false);

    return (
        <NavDropdown
            title={<span className="text-gray-100 hover:text-orange-700">Destinations</span>}
            menuVariant="dark"
            show={isDestinationOpen}
            onToggle={() => setIsDestinationOpen(!isDestinationOpen)}
            >
                <NavDropdown.Item as={NavLink} to="/service1" className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200">Service 1</NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/service2" className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200">Service 2</NavDropdown.Item>
                <NavDropdown.Item as={NavLink} to="/Review" className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200">Review</NavDropdown.Item>
        </NavDropdown>
    );
}
