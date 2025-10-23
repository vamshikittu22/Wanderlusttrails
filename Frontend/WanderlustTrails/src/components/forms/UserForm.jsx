//path: Frontend/WanderlustTrails/src/components/forms/UserForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { PasswordInput, ConfirmPasswordInput } from '../PasswordValidator'; // Import validators

/**
 * UserForm Component - Reusable form for user registration and profile editing
 * Handles form validation, password strength checking, and submission
 * @param {Object} formData - Initial form data
 * @param {Function} setFormData - Function to update parent form data
 * @param {Function} handleSubmit - Parent submit handler
 * @param {Object} errors - Initial validation errors
 * @param {Boolean} isEditing - Whether form is in edit mode
 * @param {String} submitLabel - Label for submit button
 * @param {Function} cancelAction - Optional cancel button handler
 * @param {Boolean} includePassword - Whether to show password fields (for signup)
 * @param {Boolean} includeChangePassword - Whether to show password change fields (for profile)
 */
const UserForm = ({
  formData: initialFormData,
  setFormData: setParentFormData,
  handleSubmit: parentHandleSubmit,
  errors: initialErrors = {},
  isEditing = true,
  submitLabel = "Submit",
  cancelAction = null,
  includePassword = false,
  includeChangePassword = false, 
  restrictedFields = [],
}) => {
  // State to hold form data locally
  const [formData, setFormData] = useState(initialFormData);
  
  // State to hold validation errors
  const [errors, setErrors] = useState(initialErrors);
  
  // State to hold list of countries for nationality dropdown
  const [countries, setCountries] = useState([]);
  
  // State to track if password meets all requirements
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  
  /**
   * Fetch countries from REST API on component mount
   * Used to populate the nationality dropdown
   */
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get("https://restcountries.com/v2/all?fields=name,alpha2Code", {
          timeout: 3000
        });
        
        if (response.data && Array.isArray(response.data)) {
          // Sort countries alphabetically by name
          const sortedCountries = response.data
            .map(country => ({
              name: country.name,
              code: country.alpha2Code
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
          setCountries(sortedCountries);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
        setCountries([]); // Set empty array if fetch fails
      }
    };

    fetchCountries();
  }, []);

  /**
   * Update form data when parent passes new initial data
   * This ensures form stays in sync with parent component
   */
  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  /**
   * Handle input changes for all form fields
   * Updates both local and parent form state
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    setParentFormData(updatedFormData); // Keep parent in sync
  };

  /**
   * Check if passwords match
   * Used for submit button disable state and validation
   */
  const passwordsMatch = formData.password && formData.confirmPassword && 
                         formData.password === formData.confirmPassword;

  /**
   * Validate all form fields
   * Returns true if all validations pass, false otherwise
   */
  const validate = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9]{10}$/;

    // Required field validations
    if (!formData.firstName) newErrors.firstName = "*First Name is required";
    if (!formData.lastName) newErrors.lastName = "*Last Name is required";
    if (!formData.username) newErrors.username = "*User Name is required";
    if (!emailPattern.test(formData.email)) newErrors.email = "*Invalid email format";
    
    // Password validations (only if password fields are shown)
    if ((includePassword || includeChangePassword) && formData.password) {
      if (!isPasswordValid) {
        newErrors.password = "*Password does not meet all requirements";
      }
      if (!passwordsMatch) {
        newErrors.confirmPassword = "*Passwords do not match";
      }
    }
    
    if (!formData.dob) newErrors.dob = "*Date of Birth is required";
    if (!formData.gender) newErrors.gender = "*Gender is required";
    if (!formData.nationality) newErrors.nationality = "*Nationality is required";
    if (!phonePattern.test(formData.phone)) newErrors.phone = "*Invalid phone number (10 digits required)";
    if (!formData.street || !formData.city || !formData.state || !formData.zip) {
      newErrors.address = "*Complete address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   * Validates form and calls parent submit handler if valid
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    parentHandleSubmit(e, formData);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* First Name and Last Name Row */}
      <div className="flex mb-4">
        <div className="w-1/2 mr-2">
          <label htmlFor="firstName" className="block text-sm text-sky-300 font-bold mb-2">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName || ""}
            onChange={handleChange}
            disabled={!isEditing}
            className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {errors.firstName && <p className="text-red-500 text-xs italic font-bold">{errors.firstName}</p>}
        </div>
        <div className="w-1/2 mr-2">
          <label htmlFor="lastName" className="block text-sm text-sky-300 font-bold mb-2">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName || ""}
            onChange={handleChange}
            disabled={!isEditing}
            className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {errors.lastName && <p className="text-red-500 text-xs italic font-bold">{errors.lastName}</p>}
        </div>
      </div>

      {/* Username Field */}
      <div className="mb-4">
        <label htmlFor="username" className="block text-sm text-sky-300 font-bold mb-2">
          User Name
        </label>
        <input
          type="text"
          id="username"
          name="username"
          placeholder="User Name"
          value={formData.username || ""}
          onChange={handleChange}
          disabled={!isEditing ||  restrictedFields.includes('username')}
          className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        {errors.username && <p className="text-red-500 text-xs italic font-bold">{errors.username}</p>}
      </div>

      {/* Email and Phone Row */}
      <div className="flex mb-4">
        <div className="w-1/2 mr-2">
          <label htmlFor="email" className="block text-sm text-sky-300 font-bold mb-2">
            Email
          </label>
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
          <label htmlFor="phone" className="block text-sm text-sky-300 font-bold mb-2">
            Phone
          </label>
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

      {/* Password Fields - Only show if includePassword or includeChangePassword is true */}
      {(includePassword || (includeChangePassword && isEditing)) && (
        <>
          {/* New Password with Validation Component */}
          <div className="mb-4">
            <PasswordInput
              value={formData.password || ""}
              onChange={(e) => {
                const updatedFormData = { ...formData, password: e.target.value };
                setFormData(updatedFormData);
                setParentFormData(updatedFormData);
              }}
              label="Password"
              placeholder="Create a strong password"
              showStrength={true}
              showRequirements={true}
              onValidationChange={setIsPasswordValid}
              disabled={!isEditing}
            />
            {errors.password && <p className="text-red-500 text-xs italic font-bold">{errors.password}</p>}
          </div>

          {/* Confirm Password with Match Indicator Component */}
          <div className="mb-4">
            <ConfirmPasswordInput
              value={formData.confirmPassword || ""}
              onChange={(e) => {
                const updatedFormData = { ...formData, confirmPassword: e.target.value };
                setFormData(updatedFormData);
                setParentFormData(updatedFormData);
              }}
              originalPassword={formData.password || ""}
              label="Confirm Password"
              placeholder="Re-enter password"
              disabled={!isEditing}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs italic font-bold">{errors.confirmPassword}</p>}
          </div>
        </>
      )}

      {/* Date of Birth and Gender Row */}
      <div className="flex mb-4">
        <div className="w-1/2 mr-2">
          <label htmlFor="dob" className="block text-sm text-sky-300 font-bold mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={formData.dob || ""}
            onChange={handleChange}
            disabled={!isEditing || restrictedFields.includes('dob')}
            max={new Date().toISOString().split("T")[0]}
            className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          {errors.dob && <p className="text-red-500 text-xs italic font-bold">{errors.dob}</p>}
        </div>
        <div className="w-1/2 mr-2">
          <label htmlFor="gender" className="block text-sm text-sky-300 font-bold mb-2">
            Gender
          </label>
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

      {/* Nationality Field */}
      <div className="w-full mb-4">
        <label htmlFor="nationality" className="block text-sm text-sky-300 font-bold mb-2">
          Nationality
        </label>
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
            <option key={country.code} value={country.name}>
              {country.name}
            </option>
          ))}
        </select>
        {errors.nationality && <p className="text-red-500 text-xs italic font-bold">{errors.nationality}</p>}
      </div>

      {/* Address Fields */}
      <div className="flex flex-col mb-4">
        <label htmlFor="address" className="block text-sm text-sky-300 font-bold mb-2">
          Address:
        </label>
        <div className="flex mb-2">
          <input
            type="text"
            id="street"
            name="street"
            placeholder="Street Address"
            value={formData.street || ""}
            onChange={handleChange}
            disabled={!isEditing}
            className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 mr-2"
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
            className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 mr-2"
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
        {errors.address && <p className="text-red-500 text-xs italic font-bold">{errors.address}</p>}
      </div>

      {/* Submit and Cancel Buttons - Only show when editing */}
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
            disabled={(includePassword || includeChangePassword) && (!isPasswordValid || !passwordsMatch)}
            className="py-2 px-4 rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-700 hover:from-orange-600 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitLabel}
          </button>
        </div>
      )}
    </form>
  );
};

export default UserForm;
