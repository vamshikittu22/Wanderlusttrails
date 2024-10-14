import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import background from '../assets/Images/travel1.jpg';
import useUser  from '../context/UserContext'; 

function TravelPackages() {
  const [loginData, setLoginData] = useState({
    identifier: '', 
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const { setUser } = useUser(); // Get the setUser function from context

  const validate = () => {
    const newErrors = {};

    if (!loginData.identifier) {
      newErrors.identifier = 'Please enter your email or phone number.';
    }

    if (!loginData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange   
 = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();   


    if (!validate()) return;

    try {
      const response = await axios.post('http://localhost/WanderlustTrails/backend/login.php', loginData);
      setMessage(response.data.message || 'Login successful!');
      setLoginData({ identifier: '', password: '' });
      setErrors({});

      // Update user context
      setUser(response.data.user); 

      navigate('/'); 
    } catch (error) {
      setMessage('Error during login: ' + (error.response?.data?.error || error.message));
    }
  };

return (
  <>
  <div className="relative min-h-screen flex ">
    <div className="flex flex-col sm:flex-row-reverse items-center justify-center sm:justify-around w-full sm:w-3/4 mx-auto p-8">
      <div className="bg-transparent p-8 rounded-lg  border border-black-300 shadow-md w-full sm:w-1/2 relative z-10">
       
      <div >
      <div >
        <h2 className="text-2xl font-bold text-center mb-6">Login to your Account</h2>

        {Object.keys(errors).length > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Please correct the following errors:</strong>
            <ul className="mt-2 list-disc list-inside">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {message && <p className="text-green-500 text-center mb-4">{message}</p>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="identifier" className="block text-sky-300 font-bold mb-2">Email or Phone:</label>
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
            <label htmlFor="password" className="block text-sky-300 font-bold mb-2">Password:</label>
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
          <div className="text-center">
            <button
              type="submit"
              className="py-2 px-3 rounded-md text-white bg-gradient-to-r from-orange-500 to-red-700"
            >Login
            </button>
          </div>
        </form>
        
      </div>
    </div>

      </div>

      <div className="hidden sm:block sm:w-2/3 ">
        <img
          src={background}
          alt="Signup Background"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-gray-500 opacity-50"></div>
        <div className="relative z-10 p-8 text-white text-center">
            <div className='flex items-center justify-center'>
                <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 2048 2048"><path fill="black" d="M1728 1152q26 0 45 19t19 45q0 26-19 45t-45 19q-26 0-45-19t-19-45q0-26 19-45t45-19zm-603-19q-79-54-170-81t-187-28q-88 0-170 23t-153 64t-129 100t-100 130t-65 153t-23 170H0q0-117 35-229t101-207t157-169t203-113q-56-36-100-83t-76-103t-47-118t-17-130q0-106 40-199t109-163T568 40T768 0q106 0 199 40t163 109t110 163t40 200q0 67-16 129t-48 119t-75 103t-101 83q81 29 156 80l-71 107zM384 512q0 80 30 149t82 122t122 83t150 30q79 0 149-30t122-82t83-122t30-150q0-79-30-149t-82-122t-123-83t-149-30q-80 0-149 30t-122 82t-83 123t-30 149zm1280 384q79 0 149 30t122 82t83 123t30 149q0 80-30 149t-82 122t-123 83t-149 30q-65 0-128-23v151h-128v128h-128v128H896v-282l395-396q-11-46-11-90q0-79 30-149t82-122t122-83t150-30zm0 640q53 0 99-20t82-55t55-81t20-100q0-53-20-99t-55-82t-81-55t-100-20q-53 0-99 20t-82 55t-55 81t-20 100q0 35 9 64t21 61l-414 413v102h128v-128h128v-128h128v-91l93-92q40 23 77 39t86 16z"/></svg>
            </div>
          <h2 className="text-3xl font-bold mb-4">Welcome back to Wanderlust Trails!</h2>
          <p className="text-lg">Login to explore the world with us.</p>
          <div>
              <p className="mt-4 text-center">
              Don't have an account? <a href="/signup" className="py-2 px-3 rounded-md bg-gradient-to-r from-orange-500 to-red-700">Sign Up Now</a>
              </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</>
);
}

export default TravelPackages