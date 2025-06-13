//path: Frontend/WanderlustTrails/src/components/Popup.jsx
import React from 'react';
import PropTypes from 'prop-types';

// Popup component to display modal dialogs or overlays
const Popup = ({ isOpen, onClose, children, showCloseButton = true }) => {
  // If the popup is not open, render nothing
  if (!isOpen) return null;

  return (
    // Overlay background with semi-transparent black
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      {/* Popup content container with white background, padding, rounded corners */}
      <div className="bg-white rounded-lg p-6 w-full max-w-xl mt-10 max-h-[80vh] overflow-y-auto relative">
        {/* Close button in top-right corner if showCloseButton is true */}
        {showCloseButton && (
          <button
            onClick={onClose} // Call onClose callback when clicked
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl font-bold"
            aria-label="Close" // Accessibility label
          >
            ×
          </button>
        )}
        {/* Content inside the popup */}
        <div className="pt-6">{children}</div>
      </div>
    </div>
  );
};

// PropTypes for type checking and required props
Popup.propTypes = {
  isOpen: PropTypes.bool.isRequired,          // Controls whether popup is visible
  onClose: PropTypes.func.isRequired,         // Callback to close the popup
  children: PropTypes.node.isRequired,        // Content to display inside popup
  showCloseButton: PropTypes.bool,             // Optionally show/hide close button
};

export default Popup;
