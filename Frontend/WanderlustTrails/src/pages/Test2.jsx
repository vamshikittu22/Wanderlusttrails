import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserForm from "./../components/forms/UserForm.jsx";
import { Link } from "react-router-dom";
import background from "../assets/Images/travel1.jpg";

function Signup() {
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
    dob: "", gender: "", nationality: "", phone: "", street: "", city: "", state: "", zip: ""
  });
  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get("https://restcountries.com/v3.1/all");
        setCountries(response.data.sort((a, b) => a.name.common.localeCompare(b.name.common)));
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountries();
  }, []);

  const validate = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9]{10}$/;

    if (!formData.firstName) newErrors.firstName = "*First Name is required";
    if (!formData.lastName) newErrors.lastName = "*Last Name is required";
    if (!emailPattern.test(formData.email)) newErrors.email = "*Invalid email format";
    if (formData.password.length < 6) newErrors.password = "*Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "*Passwords do not match";
    if (!formData.dob) newErrors.dob = "*Date of Birth is required";
    if (!formData.gender) newErrors.gender = "*Gender is required";
    if (!formData.nationality) newErrors.nationality = "*Nationality is required";
    if (!phonePattern.test(formData.phone)) newErrors.phone = "*Invalid phone number (10 digits)";
    if (!formData.street || !formData.city || !formData.state || !formData.zip) newErrors.address = "*Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await axios.post(
        "http://localhost/WanderlustTrails/backend/config/auth/signupUser.php",
        formData
      );
      toast.success(response.data.message || "Signup successful! You can log in now.", {
        position: "top-center",
        autoClose: 1000,
      });
      setFormData({
        firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
        dob: "", gender: "", nationality: "", phone: "", street: "", city: "", state: "", zip: ""
      });
      setErrors({});
    } catch (error) {
      toast.error("Error during signup: " + (error.response?.data?.error || error.message), {
        position: "top-center",
        autoClose: 1000,
      });
    }
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
            errors={errors}
            countries={countries}
            submitLabel="Sign Up"
          />
          <p className="mt-4 text-center">
            Already have an account? <a href="/login" className="text-orange-500">Login Now</a>
          </p>
        </div>
        <div className="hidden sm:block sm:w-2/3 relative">
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