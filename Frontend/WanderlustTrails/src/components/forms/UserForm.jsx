//path: Frontend/WanderlustTrails/src/components/forms/UserForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const UserForm = ({
  formData: initialFormData,
  setFormData: setParentFormData,
  handleSubmit: parentHandleSubmit,
  errors: initialErrors = {},
  isEditing = true,
  submitLabel = "Submit",
  cancelAction = null,
  includePassword = false,
  includeChangePassword = false, // New prop for UserProfile
}) => {
  const [formData, setFormData] = useState(initialFormData); //state to hold form data
  const [errors, setErrors] = useState(initialErrors); //state to hold validation errors
  const [countries, setCountries] = useState([]); //state to hold country data
  const [showPassword, setShowPassword] = useState(false); //state to toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); //state to toggle confirm password visibility
 
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
  }, []); // Fetch countries on component mount

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]); // Update form data when initialFormData changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    setParentFormData(updatedFormData);
  }; // Update parent form data on change

  // Validation function to check for errors in the form data
  const validate = () => {
    const newErrors = {}; // Object to hold validation errors
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex for email validation
    const phonePattern = /^[0-9]{10}$/; // Regex for phone number validation

    if (!formData.firstName) newErrors.firstName = "*First Name is required";
    if (!formData.lastName) newErrors.lastName = "*Last Name is required";
    if (!formData.userName) newErrors.userName = "*User Name is required";
    if (!emailPattern.test(formData.email)) newErrors.email = "*Invalid email format correct Email required";
    if ((includePassword || includeChangePassword) && formData.password && formData.password.length < 8)
      newErrors.password = "*Password must be at least 8 characters";
    if ((includePassword || includeChangePassword) && formData.password && formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "*Passwords do not match";
    if (!formData.dob) newErrors.dob = "*Date of Birth is required";
    if (!formData.gender) newErrors.gender = "*Gender is required";
    if (!formData.nationality) newErrors.nationality = "*Nationality is required";
    if (!phonePattern.test(formData.phone)) newErrors.phone = "*Invalid phone number format 10digits required";
    if (!formData.street || !formData.city || !formData.state || !formData.zip) newErrors.address = "*Address is required";

    setErrors(newErrors); // Update errors state with new errors
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    parentHandleSubmit(e, formData);
  }; // Handle form submission and validation

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex mb-4">
        <div className="w-1/2 mr-2">
          <label htmlFor="firstName" className="block text-sm text-sky-300 font-bold mb-2">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName || ""}
            onChange={handleChange}
            disabled
            className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {errors.firstName && <p className="text-red-500 text-xs italic font-bold">{errors.firstName}</p>}
        </div>
        <div className="w-1/2 mr-2">
          <label htmlFor="lastName" className="block text-sm text-sky-300 font-bold mb-2">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName || ""}
            onChange={handleChange}
            disabled
            className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {errors.lastName && <p className="text-red-500 text-xs italic font-bold">{errors.lastName}</p>}
        </div>
      </div>
      <div className="w-1/2 mr-2">
          <label htmlFor="firstName" className="block text-sm text-sky-300 font-bold mb-2">User Name</label>
          <input
            type="text"
            id="userName"
            name="userName"
            placeholder="User Name"
            value={formData.userName || ""}
            onChange={handleChange}
            disabled={!isEditing}
            className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {errors.userName && <p className="text-red-500 text-xs italic font-bold">{errors.userName}</p>}
        </div>

      <div className="flex mb-4">
        <div className="w-1/2 mr-2">
          <label htmlFor="email" className="block text-sm text-sky-300 font-bold mb-2">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="XXXX@label.com"
            value={formData.email || ""}
            onChange={handleChange}
            disabled={!isEditing}
            className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {errors.email && <p className="text-red-500 text-xs italic font-bold">{errors.email}</p>}
        </div>
        <div className="w-1/2 mr-2">
          <label htmlFor="phone" className="block text-sm text-sky-300 font-bold mb-2">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="XXXXXXXXXX"
            value={formData.phone || ""}
            onChange={handleChange}
            disabled={!isEditing}
            className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {errors.phone && <p className="text-red-500 text-xs italic font-bold">{errors.phone}</p>}
        </div>
      </div>

      {(includePassword || (includeChangePassword && isEditing)) && (
        <>
          <div className="mb-4 relative">
            <label htmlFor="password" className="block text-sm text-sky-300 font-bold mb-2">New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="*******"
              value={formData.password || ""}
              onChange={handleChange}
              className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-8 text-gray-400 hover:text-orange-500"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542-7z"></path>
                </svg>
              )}
            </button>
            {errors.password && <p className="text-red-500 text-xs italic font-bold">{errors.password}</p>}
          </div>
          <div className="mb-4 relative">
            <label htmlFor="confirmPassword" className="block text-sm text-sky-300 font-bold mb-2">Confirm New Password</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="*******"
              value={formData.confirmPassword || ""}
              onChange={handleChange}
              className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-8 text-gray-400 hover:text-orange-500"
            >
              {showConfirmPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542-7z"></path>
                </svg>
              )}
            </button>
            {errors.confirmPassword && <p className="text-red-500 text-xs italic font-bold">{errors.confirmPassword}</p>}
          </div>
        </>
      )}

      <div className="flex mb-4">
        <div className="w-1/2 mr-2">
          <label htmlFor="dob" className="block text-sm text-sky-300 font-bold mb-2">Date of Birth</label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={formData.dob || ""}
            onChange={handleChange}
            disabled={!isEditing}
            max={new Date().toISOString().split("T")[0]}
            className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {errors.dob && <p className="text-red-500 text-xs italic font-bold">{errors.dob}</p>}
        </div>
        <div className="w-1/2 mr-2">
          <label htmlFor="gender" className="block text-sm text-sky-300 font-bold mb-2">Gender</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender || ""}
            onChange={handleChange}
            disabled={!isEditing}
            className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && <p className="text-red-500 text-xs italic font-bold">{errors.gender}</p>}
        </div>
      </div>

      <div className="w-full mb-4">
        <label htmlFor="nationality" className="block text-sm text-sky-300 font-bold mb-2">Nationality</label>
        <select
          id="nationality"
          name="nationality"
          value={formData.nationality || ""}
          onChange={handleChange}
          disabled={!isEditing}
          className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Select Nationality</option>
          {countries.map((country) => (
            <option key={country.cca2} value={country.name.common}>
              {country.name.common}
            </option>
          ))}
        </select>
        {errors.nationality && <p className="text-red-500 text-xs italic font-bold">{errors.nationality}</p>}
      </div>

      <div className="flex flex-col mb-4">
        <label htmlFor="address" className="block text-sm text-sky-300 font-bold mb-2">Address:</label>
        <div className="flex mb-2">
          <input
            type="text"
            id="street"
            name="street"
            placeholder="Street Address"
            value={formData.street || ""}
            onChange={handleChange}
            disabled={!isEditing}
            className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="text"
            id="city"
            name="city"
            placeholder="City"
            value={formData.city || ""}
            onChange={handleChange}
            disabled={!isEditing}
            className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {errors.address && <p className="text-red-500 text-xs italic font-bold">{errors.address}</p>}
        </div>
        <div className="flex mb-2">
          <input
            type="text"
            id="state"
            name="state"
            placeholder="State/Province"
            value={formData.state || ""}
            onChange={handleChange}
            disabled={!isEditing}
            className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="text"
            id="zip"
            name="zip"
            placeholder="Zip/Postal Code"
            value={formData.zip || ""}
            onChange={handleChange}
            disabled={!isEditing}
            className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {isEditing && (
        <div className="text-center mt-4">
          {cancelAction && (
            <button
              type="button"
              onClick={cancelAction}
              className="py-2 px-4 rounded-lg text-white bg-blue-500 hover:bg-blue-600 mr-2"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="py-2 px-4 rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-700 hover:bg-green-600"
          >
            {submitLabel}
          </button>
        </div>
      )}
    </form>
  );
};

export default UserForm;