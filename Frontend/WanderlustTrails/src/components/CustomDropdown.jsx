// path: Frontend/WanderlustTrails/src/components/CustomDropdown.jsx

// Import React and useState hook for managing component state
import React, { useState } from 'react';
// Import NavDropdown component from react-bootstrap
import { NavDropdown } from 'react-bootstrap';
// Import NavLink from react-router-dom and alias it as RouterNavLink
import { NavLink as RouterNavLink } from 'react-router-dom';

// CustomDropdown component that renders a styled dropdown using react-bootstrap
const CustomDropdown = ({
  title,                        // Dropdown title text (displayed as button)
  items,                        // Array of menu items: each item has { label, path, optional onClick }
  titleClassName = "text-gray-100 hover:text-orange-700", // Custom class for title text
  containerClassName = ""      // Additional class for NavDropdown container
}) => {
  const [isOpen, setIsOpen] = useState(false); // State to control dropdown visibility

  return (
    <NavDropdown
      title={<span className={titleClassName}>{title}</span>} // Render title with given class
      menuVariant="dark" // Use dark theme for dropdown menu
      show={isOpen} // Controls whether dropdown is shown
      onToggle={() => setIsOpen(!isOpen)} // Toggle dropdown open/close
      className={containerClassName} // Apply container styling
    >
      {/* Render each dropdown item */}
      {items.map((item, index) => (
        <NavDropdown.Item
          key={index} // Unique key for each item
          as={RouterNavLink} // Use RouterNavLink to enable client-side navigation
          to={item.path} // Navigation path for the item
          onClick={item.onClick || undefined} // Optional onClick handler
          className="block px-4 py-2 hover:bg-orange-300 hover:text-red-800 transition-all duration-200" // Styling with hover effects
        >
          {item.label} {/* Display the label of the item */}
        </NavDropdown.Item>
      ))}
    </NavDropdown>
  );
};

// Export the CustomDropdown component for use in other parts of the app
export default CustomDropdown;
