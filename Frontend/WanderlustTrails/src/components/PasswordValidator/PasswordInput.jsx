import React, { useState, useEffect } from 'react';

/**
 * PasswordInput - Reusable password input with validation and strength meter
 * Shows real-time feedback on password requirements
 * @param {Object} props - Component props
 * @param {string} props.value - Password value
 * @param {function} props.onChange - Change handler
 * @param {string} props.label - Input label
 * @param {string} props.placeholder - Input placeholder
 * @param {boolean} props.showStrength - Whether to show strength meter
 * @param {boolean} props.showRequirements - Whether to show requirement checklist
 * @param {function} props.onValidationChange - Callback when validation state changes
 */
const PasswordInput = ({ 
    value, 
    onChange, 
    label = "Password", 
    placeholder = "Enter password",
    showStrength = true,
    showRequirements = true,
    onValidationChange = null,
    disabled = false
}) => {
    // Track which requirements are met
    const [validation, setValidation] = useState({
        length: false,        // At least 8 characters
        lowercase: false,     // At least one lowercase letter
        uppercase: false,     // At least one uppercase letter
        number: false,        // At least one number
        special: false        // At least one special character
    });

    // Track if password is visible
    const [showPassword, setShowPassword] = useState(false);
    
    // Track caps lock state
    const [capsLockOn, setCapsLockOn] = useState(false);

    // Calculate password strength (0-5)
    const [strength, setStrength] = useState(0);

    /**
     * Check password against all requirements
     */
    useEffect(() => {
        if (!value) {
            setValidation({
                length: false,
                lowercase: false,
                uppercase: false,
                number: false,
                special: false
            });
            setStrength(0);
            if (onValidationChange) onValidationChange(false);
            return;
        }

        const newValidation = {
            length: value.length >= 8,
            lowercase: /[a-z]/.test(value),
            uppercase: /[A-Z]/.test(value),
            number: /[0-9]/.test(value),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
        };

        setValidation(newValidation);

        // Calculate strength (count how many requirements are met)
        const strengthCount = Object.values(newValidation).filter(Boolean).length;
        setStrength(strengthCount);

        // Check if all requirements are met
        const isValid = Object.values(newValidation).every(Boolean);
        if (onValidationChange) onValidationChange(isValid);
    }, [value, onValidationChange]);

    /**
     * Detect caps lock state
     */
    const handleKeyDown = (e) => {
        setCapsLockOn(e.getModifierState('CapsLock'));
    };

    const handleKeyUp = (e) => {
        setCapsLockOn(e.getModifierState('CapsLock'));
    };

    /**
     * Get strength color and label
     */
    const getStrengthInfo = () => {
        switch (strength) {
            case 0:
            case 1:
                return { color: 'bg-red-500', label: 'Very Weak', width: '20%' };
            case 2:
                return { color: 'bg-orange-500', label: 'Weak', width: '40%' };
            case 3:
                return { color: 'bg-yellow-500', label: 'Fair', width: '60%' };
            case 4:
                return { color: 'bg-blue-500', label: 'Good', width: '80%' };
            case 5:
                return { color: 'bg-green-500', label: 'Strong', width: '100%' };
            default:
                return { color: 'bg-gray-300', label: '', width: '0%' };
        }
    };

    const strengthInfo = getStrengthInfo();

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
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                    className="shadow appearance-none border rounded w-full py-2 px-3 pr-10 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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

            {/* Caps Lock Warning */}
            {capsLockOn && (
                <div className="mt-2 text-yellow-400 text-sm flex items-center">
                    <span className="mr-2">⚠️</span>
                    Caps Lock is ON
                </div>
            )}

            {/* Strength Meter */}
            {showStrength && value && (
                <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-300">Password Strength:</span>
                        <span className={`text-sm font-semibold ${strengthInfo.color.replace('bg-', 'text-')}`}>
                            {strengthInfo.label}
                        </span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-2">
                        <div 
                            className={`${strengthInfo.color} h-2 rounded-full transition-all duration-300`}
                            style={{ width: strengthInfo.width }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Requirements Checklist */}
            {showRequirements && value && (
                <div className="mt-3 space-y-1">
                    <p className="text-sm text-gray-300 mb-2">Password must contain:</p>
                    
                    <RequirementItem 
                        met={validation.length} 
                        text="At least 8 characters" 
                    />
                    <RequirementItem 
                        met={validation.lowercase} 
                        text="One lowercase letter (a-z)" 
                    />
                    <RequirementItem 
                        met={validation.uppercase} 
                        text="One uppercase letter (A-Z)" 
                    />
                    <RequirementItem 
                        met={validation.number} 
                        text="One number (0-9)" 
                    />
                    <RequirementItem 
                        met={validation.special} 
                        text="One special character (!@#$%^&*)" 
                    />
                </div>
            )}
        </div>
    );
};

/**
 * RequirementItem - Individual requirement line with check/cross icon
 */
const RequirementItem = ({ met, text }) => (
    <div className={`flex items-center text-sm ${met ? 'text-green-400' : 'text-gray-400'}`}>
        <span className="mr-2 font-bold">
            {met ? '✓' : '✗'}
        </span>
        <span>{text}</span>
    </div>
);

export default PasswordInput;
