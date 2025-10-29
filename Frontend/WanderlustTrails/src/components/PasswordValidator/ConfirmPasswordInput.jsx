// path: src/components/PasswordValidator/ConfirmPasswordInput.jsx
import React, { useState } from 'react';

/**
 * ConfirmPasswordInput - Password confirmation field with match indicator
 * Shows visual feedback when passwords match
 * @param {Object} props - Component props
 * @param {string} props.value - Confirm password value
 * @param {function} props.onChange - Change handler
 * @param {string} props.originalPassword - Original password to compare against
 * @param {string} props.label - Input label
 * @param {string} props.placeholder - Input placeholder
 * @param {boolean} props.disabled - Whether input is disabled
 */
const ConfirmPasswordInput = ({ 
    value, 
    onChange, 
    originalPassword,
    label = "Confirm Password", 
    placeholder = "Re-enter password",
    disabled = false
}) => {
    const [showPassword, setShowPassword] = useState(false);

    // Check if passwords match
    const passwordsMatch = value && originalPassword && value === originalPassword;
    const passwordsDontMatch = value && originalPassword && value !== originalPassword;

    // Calculate match percentage (how much of confirm password matches original)
    const calculateMatchPercentage = () => {
        if (!value || !originalPassword) return 0;
        
        let matchCount = 0;
        const minLength = Math.min(value.length, originalPassword.length);
        
        for (let i = 0; i < minLength; i++) {
            if (value[i] === originalPassword[i]) {
                matchCount++;
            }
        }
        
        // If lengths are equal and all match, 100%
        if (value === originalPassword) return 100;
        
        // Otherwise calculate percentage based on matching characters
        return Math.round((matchCount / originalPassword.length) * 100);
    };

    const matchPercentage = calculateMatchPercentage();

    // Get color based on match status
    const getMatchColor = () => {
        if (!value) return 'bg-gray-300';
        if (passwordsMatch) return 'bg-green-500';
        if (matchPercentage >= 75) return 'bg-yellow-500';
        if (matchPercentage >= 50) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getTextColor = () => {
        if (!value) return 'text-gray-400';
        if (passwordsMatch) return 'text-green-400';
        if (matchPercentage >= 75) return 'text-yellow-400';
        if (matchPercentage >= 50) return 'text-orange-400';
        return 'text-red-400';
    };

    const getMatchLabel = () => {
        if (!value) return '';
        if (passwordsMatch) return 'Passwords Match ✓';
        if (matchPercentage >= 75) return 'Almost there...';
        if (matchPercentage >= 50) return 'Keep typing...';
        return 'Passwords do not match';
    };

    return (
        <div className="mb-4">
            {/* Label */}
            <label className="block text-gray-900 font-bold mb-2">
                {label}
            </label>

            {/* Password Input with Toggle Visibility */}
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    className={`shadow appearance-none border rounded w-full py-2 px-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                        passwordsDontMatch ? 'border-red-500' : ''
                    } ${passwordsMatch ? 'border-green-500' : ''}`}
                    placeholder={placeholder}
                    disabled={disabled}
                />
                {/* Show/Hide Password Button */}
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
                    tabIndex="-1"
                >
                    {showPassword ? '🙈' : '👁️'}
                </button>
            </div>

            {/* Match Indicator Bar */}
            {value && originalPassword && (
                <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-300">Password Match:</span>
                        <span className={`text-sm font-semibold ${getTextColor()}`}>
                            {getMatchLabel()}
                        </span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-2">
                        <div 
                            className={`${getMatchColor()} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${matchPercentage}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Match/Mismatch Message */}
            {value && originalPassword && (
                <div className="mt-2">
                    {passwordsMatch ? (
                        <div className="flex items-center text-green-400 text-sm">
                            <span className="mr-2">✓</span>
                            <span>Passwords match perfectly!</span>
                        </div>
                    ) : (
                        <div className="flex items-center text-red-400 text-sm">
                            <span className="mr-2">✗</span>
                            <span>Passwords do not match</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ConfirmPasswordInput;
