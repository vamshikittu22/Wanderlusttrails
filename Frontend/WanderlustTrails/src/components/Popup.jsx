import React from 'react';
import PropTypes from 'prop-types';

const Popup = ({ isOpen, onClose, children, showCloseButton = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl mt-10 max-h-[80vh] overflow-y-auto relative">
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl font-bold"
            aria-label="Close"
          >
            ×
          </button>
        )}
        <div className="pt-6">{children}</div>
      </div>
    </div>
  );
};

Popup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  showCloseButton: PropTypes.bool,
};

export default Popup;