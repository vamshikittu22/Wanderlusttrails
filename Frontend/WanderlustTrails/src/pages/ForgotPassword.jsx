import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleIdentifierChange = (e) => {
    setEmailOrPhone(e.target.value);
  };

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmitIdentifier = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await axios.post('http://localhost/WanderlustTrails/backend/forgot_password.php', { identifier: emailOrPhone });
      if (response.data.success) {
        setMessage(response.data.message); 
        setShowVerification(true);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      // const response = await axios.post('http://localhost/WanderlustTrails/backend/verify_otp.php', {
      //   identifier: emailOrPhone,
      //   otp: otp,
      //   newPassword: newPassword,
      //   confirmPassword: confirmPassword,
      // });

      if (response.data.success) {
        setMessage(response.data.message); 
        setEmailOrPhone('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setShowVerification(false);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
        {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{message}</div>}

        {!showVerification ? (
          <form onSubmit={handleSubmitIdentifier} noValidate>
            <div className="mb-4">
              <label htmlFor="emailOrPhone" className="block text-gray-700 font-bold mb-2">Email or Phone:</label>
              <input
                type="text"
                id="emailOrPhone"
                name="emailOrPhone"
                value={emailOrPhone}
                onChange={handleIdentifierChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Send OTP
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} noValidate>
            <div className="mb-4">
              <label htmlFor="otp" className="block text-gray-700 font-bold mb-2">Enter OTP:</label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={otp}
                onChange={handleOtpChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-gray-700 font-bold mb-2">New Password:</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={handleNewPasswordChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-gray-700 font-bold mb-2">Confirm Password:</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Reset Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;