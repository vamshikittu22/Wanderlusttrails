// Path: Frontend/WanderlustTrails/src/components/forms/FormDatePicker.jsx

import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

/**
 * Reusable DatePicker Component
 * 
 * Purpose: Consistent date selection with validation
 * Used for: Start dates, end dates, DOB, etc.
 * 
 * @param {Object} props
 * @param {string} props.label - Field label
 * @param {Object} props.icon - React icon component (optional)
 * @param {Date} props.value - Selected date
 * @param {Function} props.onChange - Change handler
 * @param {Date} props.minDate - Minimum selectable date
 * @param {Date} props.maxDate - Maximum selectable date
 * @param {string} props.error - Error message
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.placeholder - Placeholder text
 */
const FormDatePicker = ({
  label,
  icon: Icon,
  value,
  onChange,
  minDate,
  maxDate,
  error,
  disabled = false,
  placeholder = "Select date"
}) => {
  return (
    <div>
      {/* Label with optional icon */}
      <label className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
        {Icon && <Icon />}
        <span>{label}</span>
      </label>
      
      {/* DatePicker */}
      <DatePicker
        selected={value}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        dateFormat="yyyy-MM-dd"
        placeholderText={placeholder}
        className={`w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${error ? 'border-red-500' : 'border-gray-300'}`}
      />
      
      {/* Error message */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default FormDatePicker;
