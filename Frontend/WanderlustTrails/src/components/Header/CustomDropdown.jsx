//path: Frontend/WanderlustTrails/src/components/Header/CustomDropdown.jsx
import React, { useState } from 'react';
import { NavDropdown } from 'react-bootstrap';
import { NavLink as RouterNavLink } from 'react-router-dom'; // Import NavLink from react-router-dom

const CustomDropdown = ({ title, items, titleClassName = "text-gray-100 hover:text-orange-700", containerClassName = "" }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <NavDropdown
      title={<span className={titleClassName}>{title}</span>}
      menuVariant="dark"
      show={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
      className={containerClassName}
    >
      {items.map((item, index) => (
        <NavDropdown.Item
          key={index}
          as={RouterNavLink} // Use react-router-dom's NavLink
          to={item.path}
          onClick={item.onClick || undefined}
          className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200"
        >
          {item.label}
        </NavDropdown.Item>
      ))}
    </NavDropdown>
  );
};

export default CustomDropdown;