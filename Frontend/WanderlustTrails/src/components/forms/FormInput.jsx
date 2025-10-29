// Path: Frontend/WanderlustTrails/src/components/forms/FormInput.jsx

import React from 'react';

/**
 * Reusable Form Input Component
 * 
 * @param {Object} props
 * @param {string} props.label - Label text
 * @param {Object} props.icon - React icon component
 * @param {string} props.type - Input type (text, number, etc.)
 * @param {any} props.value - Current value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.error - Error message
 * @param {string} props.placeholder - Placeholder text
 * @param {Object} props.inputProps - Additional input props
 */
const FormInput = ({
  label,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  ...inputProps
}) => {
  return (
    <div>
      <label className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
        {Icon && <Icon className="text-blue-300" />}
        <span>{label}</span>
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...inputProps}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;
