import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import background from '../assets/Images/travel1.jpg'
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function Signup() {

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dob: '',
    gender: '',
    nationality: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all');

        setCountries(response.data.sort((a, b) => a.name.common.localeCompare(b.name.common)));
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    fetchCountries(); 
  }, []);

  const validate = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9]{10}$/;

    if (!formData.firstName) newErrors.firstName = '*First Name is required';
    if (!formData.lastName) newErrors.lastName = '*Last Name is required';
    if (!emailPattern.test(formData.email)) newErrors.email = '*Invalid email format correct Email required';
    if (formData.password.length < 6) newErrors.password = '*Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = '*Passwords do not match';
    if (!formData.dob) newErrors.dob = '*Date of Birth is required';
    if (!formData.gender) newErrors.gender = '*Gender is required';
    if (!formData.nationality) newErrors.nationality = '*Nationality is required';
    if (!phonePattern.test(formData.phone)) newErrors.phone = '*Invalid phone number format 10digits required';
    if (!formData.street||!formData.city||!formData.state||!formData.zip) newErrors.address = '*Address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const response = await axios.post('http://localhost/WanderlustTrails/backend/config/auth/signupUser.php', formData);
      toast.success(response.data.message || 'Signup successful! You can log in to your account now.', {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
    });
      setFormData({
        firstName: '', lastName: '', email: '', password: '', confirmPassword: '', dob: '', gender: '', nationality: '', phone: '', address: '',
      });
      setErrors({});
    } catch (error) {
      toast.error('Error during signup: ' + (error.response?.data?.error || error.message), {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
    });
    }
  };


return (
  <>
  <div className="relative min-h-screen flex ">
    <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-around w-full sm:w-3/4 mx-auto p-8">
      <div className="bg-transparent p-8 rounded-lg  border border-black-300 shadow-md w-full sm:w-1/2 relative z-10">
       
        <div >
          <div >
            <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>

            {/* Error Summary */}
           

            {message && <p className="text-green-500 text-center mb-4">{message}</p>}

            <form onSubmit={handleSubmit} noValidate>
                <div className="flex mb-4">
                    <div className="w-1/2 mr-2 ">
                        <label htmlFor="firstName" className="block text-sky-300 font-bold mb-2">First Name:</label>
                        <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        placeholder="first name"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                        />
                        {errors.firstName && <p className="text-red-500 text-xs italic font-bold">{errors.firstName}</p>}
                    </div>
                    <div className="w-1/2 ">
                        <label htmlFor="lastName" className="block text-sky-300 font-bold mb-2">Last Name:</label>
                        <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        placeholder="last name"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                        />
                        {errors.lastName && <p className="text-red-500 text-xs italic font-bold">{errors.lastName}</p>}
                    </div>
                </div>
                
                <div className="flex mb-4">
                <div className="w-1/2 mr-2">
                    <label htmlFor="email" className="block text-sky-300 font-bold mb-2">Email:</label>
                    <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="XXXX@label.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    />
                    {errors.email && <p className="text-red-500 text-xs italic font-bold">{errors.email}</p>}
                </div>
                <div className="w-1/2 ">
                    <label htmlFor="phone" className="block text-sky-300 font-bold mb-2">Phone:</label>
                    <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="XXXXXXXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    />
                    {errors.phone && <p className="text-red-500 text-xs italic font-bold">{errors.phone}</p>}
                </div>
                </div>

                <div className="flex mb-4">
                <div className="w-1/2 mr-2">
                    <label htmlFor="password" className="block text-sky-300 font-bold mb-2">Password:</label>
                    <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="*******"
                    value={formData.password}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    />
                    {errors.password && <p className="text-red-500 text-xs italic font-bold">{errors.password}</p>}
                </div>
                <div className="w-1/2 ">
                    <label htmlFor="confirmPassword" className="block text-sky-300 font-bold mb-2">Confirm Password:</label>
                    <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="*******"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-xs italic font-bold">{errors.confirmPassword}</p>}
                </div>
                </div>

                <div className="flex mb-4">
                <div className="w-1/2 mr-2">
                    <label htmlFor="dob" className="block text-sky-300 font-bold mb-2">Date of Birth:</label>
                    <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]} 
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    />
                    {errors.dob && <p className="text-red-500 text-xs italic font-bold">{errors.dob}</p>}
                </div>
                <div className="w-1/2">
                    <label htmlFor="gender" className="block text-sky-300 font-bold mb-2">Gender:</label>
                    <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-xs italic font-bold">{errors.gender}</p>}
                </div>
                </div>
              
                <div className="w-1/2">
                    <label htmlFor="nationality" className="block text-sky-300 font-bold mb-2">Nationality:</label>
                    <select
                        id="nationality"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    >
                        <option value=""
                        >Select Nationality</option>
                        {countries.map((country) => (
                        <option key={country.cca2} value={country.name.common}>
                            {country.name.common}
                        </option>
                        ))}
                    </select>
                    {errors.nationality && <p className="text-red-500 text-xs italic font-bold">{errors.nationality}</p>}
                </div>
              
                <div className="flex flex-col mb-4"> 
                <label htmlFor="address" className="block text-sky-300 font-bold mb-2">Address:</label>

                <div className="flex mb-2">
                    <input
                    type="text"
                    id="street"
                    name="street"
                    placeholder="Street Address"
                    value={formData.street || ''} 
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                    required
                    />
                    <input
                    type="text"
                    id="city"
                    name="city"
                    placeholder="City"
                    value={formData.city || ''} 
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    />
                </div>

                <div className="flex">
                    <input
                    type="text"
                    id="state"
                    name="state"
                    placeholder="State/Province"
                    value={formData.state || ''} 
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                    required
                    />
                    <input
                    type="text"
                    id="zip"
                    name="zip"
                    placeholder="Zip/Postal Code"
                    value={formData.zip || ''} 
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    />
                </div>
                {errors.address && <p className="text-red-500 text-xs italic font-bold  ">{errors.address}</p>}
                </div>

                <div className="text-center">
                    <button
                    type="submit"
                    className="py-2 px-3 rounded-md text-white bg-gradient-to-r from-orange-500 to-red-700"
                    >Sign Up
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
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 472 384"><path fill="black" d="M298.5 192q-35.5 0-60.5-25t-25-60.5T238 46t60.5-25T359 46t25 60.5t-25 60.5t-60.5 25zM107 149h64v43h-64v64H64v-64H0v-43h64V85h43v64zm191.5 86q31.5 0 69.5 9t69.5 29.5T469 320v43H128v-43q0-26 31.5-46.5T229 244t69.5-9z"/></svg>            </div>
          <h2 className="text-3xl font-bold mb-4 ">Welcome to Wanderlust Trails!</h2>
          <p className="text-lg">Sign up to start your adventure.</p>
          <div>
            <p className="mt-4 text-center">
                Already have an account ..? <a href="/login" className="py-2 px-3 rounded-md bg-gradient-to-r from-orange-500 to-red-700">Login Now</a>
            </p>
        </div>  
        </div>
      </div>
    </div>
  </div>
</>
);
}

export default Signup

