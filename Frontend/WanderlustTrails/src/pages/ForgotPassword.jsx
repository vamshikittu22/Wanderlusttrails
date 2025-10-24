// path: Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import $ from 'jquery';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { PasswordInput, ConfirmPasswordInput } from '../components/PasswordValidator';

const ForgotPassword = () => {
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [selectedUsername, setSelectedUsername] = useState('');
    const [availableAccounts, setAvailableAccounts] = useState([]);
    const [showUsernameSelector, setShowUsernameSelector] = useState(false);
    const [verificationIdentifier, setVerificationIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showVerification, setShowVerification] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);

    const navigate = useNavigate();

    // Check if passwords match
    const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

    const handleSubmitIdentifier = (e) => {
        e.preventDefault();
        setLoading(true);

        $.ajax({
            url: 'http://localhost/WanderlustTrails/Backend/config/auth/forgotPassword.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ identifier: emailOrPhone }),
            dataType: 'json',
            success: function (response) {
                if (response.requiresUsername) {
                    toast.info(response.message);
                    setAvailableAccounts(response.accounts);
                    setShowUsernameSelector(true);
                } else if (response.success) {
                    toast.success(response.message);
                    setVerificationIdentifier(response.identifier || emailOrPhone);
                    setShowVerification(true);
                } else {
                    toast.error(response.message);
                }
            },
            error: function (xhr, status, error) {
                console.error('AJAX error:', xhr, status, error);
                toast.error('Error during OTP request');
            },
            complete: function () {
                setLoading(false);
            }
        });
    };

    const handleSelectUsername = (e) => {
        e.preventDefault();
        
        if (!selectedUsername) {
            toast.error('Please select a username');
            return;
        }
        
        setLoading(true);

        $.ajax({
            url: 'http://localhost/WanderlustTrails/Backend/config/auth/forgotPassword.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ identifier: emailOrPhone, username: selectedUsername }),
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    toast.success(response.message);
                    setVerificationIdentifier(response.identifier || selectedUsername);
                    setShowUsernameSelector(false);
                    setShowVerification(true);
                } else {
                    toast.error(response.message);
                }
            },
            error: function (xhr, status, error) {
                console.error('Username selection error:', xhr, status, error);
                toast.error('Error sending OTP');
            },
            complete: function () {
                setLoading(false);
            }
        });
    };

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        setLoading(true);

        // Validation
        if (!isPasswordValid) {
            toast.error('Please meet all password requirements');
            setLoading(false);
            return;
        }
        if (!passwordsMatch) {
            toast.error('Passwords do not match');
            setLoading(false);
            return;
        }
        if (otp.length !== 6) {
            toast.error('OTP must be 6 digits');
            setLoading(false);
            return;
        }

        $.ajax({
            url: 'http://localhost/WanderlustTrails/Backend/config/auth/verifyOtp.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ 
                identifier: verificationIdentifier, 
                otp, 
                newPassword 
            }),
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    toast.success(response.message);
                    if (response.mailSuccess) {
                        toast.info('A confirmation email has been sent to your inbox');
                    }
                    // Reset state
                    setEmailOrPhone('');
                    setSelectedUsername('');
                    setAvailableAccounts([]);
                    setShowUsernameSelector(false);
                    setOtp('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setShowVerification(false);
                    navigate('/login');
                } else {
                    toast.error(response.message);
                }
            },
            error: function (xhr, status, error) {
                console.error('Verify error:', xhr, status, error);
                toast.error('Error during OTP verification');
            },
            complete: function () {
                setLoading(false);
            }
        });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-transparent">
            <div className="w-full max-w-md bg-gray-600 p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-orange-600">Forgot Password</h2>

                {!showUsernameSelector && !showVerification ? (
                    // Step 1: Enter email or phone
                    <form onSubmit={handleSubmitIdentifier} noValidate>
                        <div className="mb-4">
                            <label htmlFor="emailOrPhone" className="block text-white font-bold mb-2">
                                Email or Phone
                            </label>
                            <input
                                type="text"
                                id="emailOrPhone"
                                value={emailOrPhone}
                                onChange={(e) => setEmailOrPhone(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                                disabled={loading}
                                placeholder="Enter email or phone number"
                            />
                        </div>
                        <div className="text-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-orange-400"
                            >
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </div>
                        <p className="mt-4 text-center">
                            <Link to="/login" className="text-orange-600 hover:underline">Back to Login</Link>
                        </p>
                    </form>
                ) : showUsernameSelector ? (
                    // Step 2: Select username
                    <form onSubmit={handleSelectUsername} noValidate>
                        <div className="mb-4">
                            <label className="block text-white font-bold mb-2">
                                Select Your Account
                            </label>
                            <p className="text-sm text-gray-300 mb-3">
                                Multiple accounts found. Please select which account you want to reset:
                            </p>
                            <div className="space-y-2">
                                {availableAccounts.map((account, index) => (
                                    <label 
                                        key={index}
                                        className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-500 transition"
                                    >
                                        <input
                                            type="radio"
                                            name="username"
                                            value={account.username}
                                            checked={selectedUsername === account.username}
                                            onChange={(e) => setSelectedUsername(e.target.value)}
                                            className="mr-3"
                                        />
                                        <div>
                                            <div className="font-semibold text-white">{account.displayName}</div>
                                            <div className="text-sm text-gray-300">@{account.username}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="text-center">
                            <button
                                type="submit"
                                disabled={loading || !selectedUsername}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-orange-400"
                            >
                                {loading ? 'Sending...' : 'Continue'}
                            </button>
                        </div>
                        <p className="mt-4 text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowUsernameSelector(false);
                                    setSelectedUsername('');
                                    setAvailableAccounts([]);
                                }}
                                className="text-orange-600 hover:underline"
                            >
                                Back
                            </button>
                        </p>
                    </form>
                ) : (
                    // Step 3: Enter OTP and new password
                    <form onSubmit={handleVerifyOtp} noValidate>
                        <div className="mb-4">
                            <label htmlFor="otp" className="block text-white font-bold mb-2">
                                Enter OTP
                            </label>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                                maxLength="6"
                                disabled={loading}
                                placeholder="Enter 6-digit OTP"
                            />
                        </div>

                        {/* Password Input with Validation */}
                        <PasswordInput
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            label="New Password"
                            placeholder="Create a strong password"
                            showStrength={true}
                            showRequirements={true}
                            onValidationChange={setIsPasswordValid}
                            disabled={loading}
                        />

                        {/* Confirm Password with Match Indicator */}
                        <ConfirmPasswordInput
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            originalPassword={newPassword}
                            label="Confirm Password"
                            placeholder="Re-enter password"
                            disabled={loading}
                        />

                        <div className="text-center">
                            <button
                                type="submit"
                                disabled={loading || !isPasswordValid || !passwordsMatch}
                                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-orange-400"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
