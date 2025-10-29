// Path: Frontend/WanderlustTrails/src/components/forms/FormCheckbox.jsx

import React from 'react';

/**
 * Reusable Checkbox Component
 * 
 * Purpose: Consistent checkbox styling with icon
 * Used for: Amenities (pool, wifi), car rental, round-trip toggle
 * 
 * @param {Object} props
 * @param {string} props.label - Checkbox label text
 * @param {Object} props.icon - React icon component (optional)
 * @param {boolean} props.checked - Checked state
 * @param {Function} props.onChange - Change handler
 * @param {string} props.description - Optional description (e.g., "$20")
 * @param {boolean} props.disabled - Disabled state
 */
const FormCheckbox = ({
  label,
  icon: Icon,
  checked,
  onChange,
  description,
  disabled = false
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* Optional icon */}
      {Icon && <Icon />}
      
      {/* Label with optional description */}
      <label className="text-gray-900 font-semibold flex-1">
        {label}
        {description && <span className="text-sm text-gray-600 ml-1">({description})</span>}
      </label>
      
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-5 w-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
      />
    </div>
  );
};

export default FormCheckbox;
