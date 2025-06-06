import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import $ from 'jquery';
import background from '../assets/Images/travel1.jpg';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import CaptchaBox from '../components/CaptchaBox';

//login component
function Login() {
    const [loginData, setLoginData] = useState({
        identifier: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
    const { login, logout, token, isAuthenticated, user } = useUser();
    const navigate = useNavigate();

    // Validate login data
    const validate = () => {
        const newErrors = {};
        if (!loginData.identifier) newErrors.identifier = 'Please enter your username.';
        if (!loginData.password) newErrors.password = 'Password is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData({ ...loginData, [name]: value });
    };

    // Handle CAPTCHA verification status
    const handleCaptchaVerification = (isVerified) => {
        setIsCaptchaVerified(isVerified);
        if (isVerified) {
            toast.success('CAPTCHA verified successfully!');
        } else if (isVerified === false) {
            toast.error('CAPTCHA verification failed.');
        }
    };

    // Handle login submission
    const handleLogin = (e) => {
        e.preventDefault();
        setMessage('');
        setErrors({});

        // Check if CAPTCHA is verified
        if (!isCaptchaVerified) {
            toast.error('Please verify the CAPTCHA before logging in.');
            return;
        }

        // Validate login data
        if (!validate()) return;

        // Prepare login data
        console.log('[Login] Submitting:', loginData);

        // Check if token exists and is valid
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const currentTime = Math.floor(Date.now() / 1000);
                console.log('[Login] Existing token check:', {
                    exp: decoded.exp,
                    currentTime,
                    isExpired: decoded.exp < currentTime,
                });
                if (decoded.exp < currentTime) {
                    console.log('[Login] Token expired, logging out');
                    logout();
                }
            } catch (error) {
                console.log('[Login] Invalid existing token, logging out');
                logout();
            }
        }

        // Send login request to backend
        $.ajax({
            url: 'http://localhost/WanderlustTrails/Backend/config/auth/login.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(loginData),
            dataType: 'json',
            success: function (response) {
                console.log('[Login] Backend response:', response);
                if (response.success) {
                    try {
                        const requiredFields = ['token', 'role', 'firstname', 'lastname', 'userName', 'id', 'email'];
                        const missingFields = requiredFields.filter(field => !response[field]);
                        if (missingFields.length > 0) {
                            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
                        }

                        const { token, role, firstname, lastname, userName, id, email, phone, dob, gender, nationality, street, city, state, zip } = response;
                        console.log('[Login] Calling login with:', { id, firstname, userName, role, token });
                        login({ firstname, lastname, userName, role, id, email, phone, dob, gender, nationality, street, city, state, zip }, token);

                        setMessage(response.message || 'Login successful!');
                        setLoginData({ identifier: '', password: '' });
                        setIsCaptchaVerified(false); // Reset CAPTCHA verification after login

                        localStorage.setItem("userId", id);
                        localStorage.setItem("userName", userName);
                        toast.success('Login successful!');
                        navigate('/');
                    } catch (error) {
                        console.error('[Login] Error processing response:', error);
                        setMessage('Login failed: ' + error.message);
                        toast.error(error.message || 'Login failed due to invalid user data.');
                    }
                } else {
                    console.log('[Login] Login failed:', response.message);
                    setMessage(response.message || 'Login failed.');
                    toast.error(response.message || 'Login failed. Please check your credentials.');
                }
            },
            // Handle AJAX error
            error: function (xhr, status, error) {
                console.error('[Login] AJAX error:', { xhr, status, error });
                let errorMessage = 'Error during login';
                try {
                    const response = JSON.parse(xhr.responseText);
                    errorMessage = response.error || response.message || errorMessage;
                } catch (e) {
                    errorMessage = xhr.statusText || error;
                }
                setMessage('Error during login: ' + errorMessage);
                toast.error("Error during login. Please try again.");
            },
        });
    };

    // Check if user is already authenticated and redirect if necessary
    useEffect(() => {
        console.log('[Login] isAuthenticated changed:', { isAuthenticated, userId: user?.id });
        if (isAuthenticated && user?.id) {
            console.log('[Login] Navigating to /');
            navigate('/');
        } else {
            console.log('[Login] Staying on /login: Invalid user state');
        }
    }, [isAuthenticated, user, navigate]);

    return (
        <div className="relative min-h-screen flex">
            <div className="flex flex-col sm:flex-row-reverse items-center justify-center sm:justify-around w-full sm:w-3/4 mx-auto p-8">
                <div className="bg-transparent p-8 rounded-lg border border-black-300 shadow-md w-full sm:w-1/2 relative z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-center mb-6">Login to your Account</h2>
                        {Object.keys(errors).length > 0 && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                                <strong className="font-bold">Please correct the following errors:</strong>
                                <ul className="mt-2 list-disc list-inside">
                                    {Object.values(errors).map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {message && <p className="text-green-500 text-center mb-4">{message}</p>}
                        <form onSubmit={handleLogin} noValidate>
                            <div className="mb-4">
                                <label htmlFor="identifier" className="block text-sky-300 font-bold mb-2">Username</label>
                                <input
                                    type="text"
                                    id="identifier"
                                    name="identifier"
                                    value={loginData.identifier}
                                    onChange={handleChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                                {errors.identifier && <p className="text-red-500 text-xs italic">{errors.identifier}</p>}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="password" className="block text-sky-300 font-bold mb-2">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={loginData.password}
                                    onChange={handleChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                                {errors.password && <p className="text-red-500 text-xs italic">{errors.password}</p>}
                            </div>
                            <div className="mb-4">
                                <CaptchaBox onVerify={handleCaptchaVerification} />
                            </div>
                            <div className="text-center">
                                <button
                                    type="submit"
                                    disabled={!isCaptchaVerified}
                                    className={`py-2 px-3 rounded-md text-white bg-gradient-to-r from-orange-500 to-red-700 ${!isCaptchaVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    Login
                                </button>
                            </div>
                            <div>
                                <p className="mt-2 text-center">
                                    <Link to="/forgotpassword" className="text-orange-600 hover:underline">Forgot Password?</Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="hidden sm:block sm:w-2/3">
                    <img
                        src={background}
                        alt="Signup Background"
                        className="absolute inset-0 h-full w-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-gray-500 opacity-50"></div>
                    <div className="relative z-10 p-8 text-white text-center">
                        <div className='flex items-center justify-center'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 24 24">
                                <path
                                    fill="black"
                                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Welcome back to Wanderlust Trails!</h2>
                        <p className="text-lg">Login to explore the world with us.</p>
                        <div>
                            <p className="mt-4 text-center">
                                Don't have an account? <Link to="/Signup" className="py-2 px-3 rounded-md bg-gradient-to-r from-orange-500 to-red-700">Sign Up Now</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;