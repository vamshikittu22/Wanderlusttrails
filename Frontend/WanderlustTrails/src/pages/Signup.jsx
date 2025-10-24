// Path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/Signup.jsx

import React, { useState } from 'react';
import $ from 'jquery';
import background from '../assets/Images/travel1.jpg';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserForm from './../components/forms/UserForm.jsx';
import { Link } from 'react-router-dom';

function Signup() {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: '', dob: '',
    gender: '', nationality: '', phone: '', street: '', city: '', state: '', zip: ''
  });

  const handleSubmit = (e, updatedFormData) => {
    e.preventDefault();

    // ✅ LOG: Form data being sent
    console.log("=== SIGNUP STARTED ===");
    console.log("Form data:", updatedFormData);

    $.ajax({
      url: 'http://localhost/WanderlustTrails/Backend/config/auth/signupuser.php',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(updatedFormData),
      dataType: 'json',
      
      // ✅ LOG: Before send
      beforeSend: function(xhr) {
        console.log("Sending AJAX request...");
        console.log("Request URL:", 'http://localhost/WanderlustTrails/Backend/config/auth/signupuser.php');
        console.log("Request Method:", 'POST');
        console.log("Content-Type:", 'application/json');
      },
      
      success: function (response) {
        // ✅ LOG: Success response
        console.log("✅ AJAX SUCCESS");
        console.log("Response:", response);
        console.log("Response type:", typeof response);
        console.log("Response.success:", response.success);
        console.log("Response.message:", response.message);

        if (response.success) {
          // ✅ FIXED: Use only custom message, not concatenated
          toast.success('Signup successful! You can log in to your account now.', {
            position: "top-center",
            autoClose: 3000,  // ✅ Increased from 1000ms
            hideProgressBar: false,  // ✅ Show progress bar
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          });
          
          // Clear form fields after successful signup
          setFormData({
            firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: '', dob: '',
            gender: '', nationality: '', phone: '', street: '', city: '', state: '', zip: ''
          });
        } else {
          // ✅ LOG: Success callback but response.success is false
          console.log("❌ Response indicates failure");
          toast.error(response.message || 'Signup failed. Please try again.', {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          });
        }
      },
      
      error: function (xhr, status, error) {
        // ✅ LOG: Complete error details
        console.log("❌ AJAX ERROR");
        console.log("XHR object:", xhr);
        console.log("XHR status:", xhr.status);
        console.log("XHR statusText:", xhr.statusText);
        console.log("XHR responseText:", xhr.responseText);
        console.log("XHR responseJSON:", xhr.responseJSON);
        console.log("Status:", status);
        console.log("Error:", error);
        console.log("All XHR properties:", {
          readyState: xhr.readyState,
          status: xhr.status,
          statusText: xhr.statusText,
          responseText: xhr.responseText,
          responseJSON: xhr.responseJSON
        });

        // ✅ IMPROVED: Better error message extraction
        let errorMessage = "Error during signup";
        
        // Try to parse responseText as JSON first
        if (xhr.responseText) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log("Parsed error response:", response);
            errorMessage = response.message || response.error || errorMessage;
          } catch (e) {
            console.log("Failed to parse responseText as JSON:", e);
            // Use responseText directly if it's not JSON
            errorMessage = xhr.responseText.length < 100 ? xhr.responseText : errorMessage;
          }
        }
        
        // If no responseText, check statusText (but avoid generic messages)
        if (!xhr.responseText && xhr.statusText && xhr.statusText !== 'error' && xhr.statusText !== 'OK') {
          errorMessage = `Request failed: ${xhr.statusText}`;
        }

        console.log("Final error message to display:", errorMessage);

        toast.error(errorMessage, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
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
            Already have an account..? <Link to="/login" className="py-2 px-3 rounded-md bg-gradient-to-r from-orange-500 to-red-700 text-white">Login Now</Link>
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
