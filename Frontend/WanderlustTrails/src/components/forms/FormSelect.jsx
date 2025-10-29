// Path: Frontend/WanderlustTrails/src/components/forms/FormSelect.jsx

import React from 'react';

/**
 * Reusable Form Select Component
 * 
 * Purpose: Generic dropdown with consistent styling
 * Used for: Flight class, airlines, insurance, travelers, hotel stars, etc.
 * 
 * @param {Object} props
 * @param {string} props.label - Label text
 * @param {Object} props.icon - React icon component (optional)
 * @param {any} props.value - Current selected value
 * @param {Function} props.onChange - Change handler
 * @param {Array} props.options - Array of {value, label} objects
 * @param {string} props.error - Error message
 * @param {boolean} props.disabled - Disabled state
 * @param {React.Node} props.helperText - Additional helper text/component below select
 */
const FormSelect = ({
  label,
  icon: Icon,
  name,
  value,
  onChange,
  options,
  error,
  disabled = false,
  helperText
}) => {
  return (
    <div>
      {/* Label with optional icon */}
      <label className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
        {Icon && <Icon className="text-blue-300"/>}
        <span>{label}</span>
      </label>
      
      {/* Select dropdown */}
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${error ? 'border-red-500' : 'border-gray-300'}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Error message */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      
      {/* Optional helper text (for insurance total, etc.) */}
      {helperText && <div className="mt-2">{helperText}</div>}
    </div>
  );
};

export default FormSelect;
