import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showVerification, setShowVerification] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmitIdentifier = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log('Sending OTP request for:', emailOrPhone); // Debug

        try {
            const response = await axios.post(
                'http://localhost/WanderlustTrails/Backend/config/auth/forgotPassword.php',
                { identifier: emailOrPhone },
                { headers: { 'Content-Type': 'application/json' } }
            );
            console.log('Response:', response.data); // Debug
            if (response.data.success) {
                toast.success(response.data.message);
                console.log('ShowVerification set to:', true); // Debug
                setShowVerification(true);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Axios error:', error); // Debug
            toast.error('Error: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            setLoading(false);
            return;
        }
        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            setLoading(false);
            return;
        }
        if (otp.length !== 6) {
            toast.error('OTP must be 6 digits');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost/WanderlustTrails/Backend/config/auth/verifyOtp.php',
                { identifier: emailOrPhone, otp, newPassword },
                { headers: { 'Content-Type': 'application/json' } }
            );
            console.log('Verify response:', response.data); // Debug
            if (response.data.success) {
                toast.success(response.data.message);
                setEmailOrPhone('');
                setOtp('');
                setNewPassword('');
                setConfirmPassword('');
                setShowVerification(false);
                navigate('/login');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Verify error:', error); // Debug
            toast.error('Error: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-transparent">
            <div className="w-full max-w-md bg-gray-600 p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-orange-600">Forgot Password</h2>

                {!showVerification ? (
                    <form onSubmit={handleSubmitIdentifier} noValidate>
                        <div className="mb-4">
                            <label htmlFor="emailOrPhone" className="block text-gray-700 font-bold mb-2">
                                Email or Phone
                            </label>
                            <input
                                type="text"
                                id="emailOrPhone"
                                name="emailOrPhone"
                                value={emailOrPhone}
                                onChange={(e) => setEmailOrPhone(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                                disabled={loading}
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
                ) : (
                    <form onSubmit={handleVerifyOtp} noValidate>
                        <div className="mb-4">
                            <label htmlFor="otp" className="block text-gray-700 font-bold mb-2">
                                Enter OTP
                            </label>
                            <input
                                type="text"
                                id="otp"
                                name="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                                maxLength="6"
                                disabled={loading}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="newPassword" className="block text-gray-700 font-bold mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="confirmPassword" className="block text-gray-700 font-bold mb-2">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="text-center">
                            <button
                                type="submit"
                                disabled={loading}
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