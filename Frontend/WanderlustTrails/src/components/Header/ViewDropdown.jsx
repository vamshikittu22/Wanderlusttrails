import React, { useState } from "react";
import { NavDropdown, NavLink } from "react-bootstrap";

export default function PlanDropdown() {
    const [isPlanOpen, setIsPlanOpen] = useState(false);

    return (
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
    );
}
