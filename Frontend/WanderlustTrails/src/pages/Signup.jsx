//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/Signup.jsx

import React, { useState } from 'react';
import $ from 'jquery'; // Import jQuery
import background from '../assets/Images/travel1.jpg';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserForm from './../components/forms/UserForm.jsx';
import { Link } from 'react-router-dom';


function Signup() {
  // State to manage form data
  const [formData, setFormData] = useState({
    firstName: '', lastName: '',userName: '', email: '', password: '', confirmPassword: '', dob: '',
    gender: '', nationality: '', phone: '', street: '', city: '', state: '', zip: ''
  });

  // Function to handle form submission
  const handleSubmit = (e, updatedFormData) => {
    e.preventDefault(); // Prevent default form submission
    $.ajax({
      url: 'http://localhost/WanderlustTrails/Backend/config/auth/signupuser.php',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(updatedFormData),
      dataType: 'json',
      success: function (response) {
        if (response.success) {
          toast.success(response.message || 'Signup successful! You can log in to your account now.', {
            position: "top-center",
            autoClose: 1000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          });
          setFormData({
            firstName: '', lastName: '',userName: '', email: '', password: '', confirmPassword: '', dob: '',
            gender: '', nationality: '', phone: '', street: '', city: '', state: '', zip: ''
          });
        } else {
          toast.error(response.message || 'Signup failed. Please try again.', {
            position: "top-center",
            autoClose: 1000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          });
        }
      },
      // Handle error response
      error: function (xhr, status, error) {
        let errorMessage = 'Error during signup';
        try {
          const response = JSON.parse(xhr.responseText);
          errorMessage = response.message || response.error || errorMessage;
        } catch (e) {
          errorMessage = xhr.statusText || error;
        }
        toast.error('Error during signup: ' + errorMessage, {
          position: "top-center",
          autoClose: 1000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      }
    });
  };

  return (
    <div className="relative min-h-screen flex">
      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-around w-full sm:w-3/4 mx-auto p-8">
        <div className="bg-transparent p-8 rounded-lg border border-black-300 shadow-md w-full sm:w-1/2 relative z-10">
          <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>
          <UserForm
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            includePassword={true}
            submitLabel="Sign Up"
          />
          <p className="mt-4 text-center">
            Already have an account ..? <Link to="/login" className="py-2 px-3 rounded-md bg-gradient-to-r from-orange-500 to-red-700 text-white">Login Now</Link>
          </p>
        </div>
        <div className="hidden sm:block sm:w-2/3">
          <img src={background} alt="Signup Background" className="absolute inset-0 h-full w-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-gray-500 opacity-50"></div>
          <div className="relative z-10 p-8 text-white text-center">
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 472 384">
                <path fill="black" d="M298.5 192q-35.5 0-60.5-25t-25-60.5T238 46t60.5-25T359 46t25 60.5t-25 60.5t-60.5 25zM107 149h64v43h-64v64H64v-64H0v-43h64V85h43v64zm191.5 86q31.5 0 69.5 9t69.5 29.5T469 320v43H128v-43q0-26 31.5-46.5T229 244t69.5-9z"/>
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4">Welcome to Wanderlust Trails!</h2>
            <p className="text-lg">Sign up to start your adventure.</p>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Signup;