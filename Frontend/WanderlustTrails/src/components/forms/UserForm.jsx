//path: Frontend/WanderlustTrails/src/components/forms/UserForm.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import { PasswordInput, ConfirmPasswordInput } from '../PasswordValidator';
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaVenusMars, FaGlobe, FaMapMarkerAlt } from 'react-icons/fa';

/**
 * UserForm Component - Reusable form for user registration and profile editing
 * 
 * Purpose: Handles form validation, password strength checking, and submission
 * Used for: Signup, Profile editing, Admin user management
 * 
 * Features:
 * - Dynamic form fields (password fields conditional)
 * - Real-time validation
 * - Password strength indicator
 * - Country selection from REST API
 * - Field-level error display
 * - Restricted fields support (for editing certain fields)
 * 
 * @param {Object} formData - Initial form data
 * @param {Function} setFormData - Function to update parent form data
 * @param {Function} handleSubmit - Parent submit handler
 * @param {Object} errors - Initial validation errors
 * @param {Boolean} isEditing - Whether form is in edit mode
 * @param {String} submitLabel - Label for submit button
 * @param {Function} cancelAction - Optional cancel button handler
 * @param {Boolean} includePassword - Whether to show password fields (for signup)
 * @param {Boolean} includeChangePassword - Whether to show password change fields (for profile)
 * @param {Array} restrictedFields - Fields that cannot be edited
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
  // ============================================
  // STATE DECLARATIONS
  // ============================================
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState(initialErrors);
  const [countries, setCountries] = useState([]);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  // ============================================
  // FETCH COUNTRIES ON MOUNT
  // ============================================
  /**
   * Fetch countries from REST API for nationality dropdown
   * Sorts alphabetically for better UX
   */
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(
          "https://restcountries.com/v2/all?fields=name,alpha2Code", 
          { timeout: 3000 }
        );
        
        if (response.data && Array.isArray(response.data)) {
          const sortedCountries = response.data
            .map(country => ({
              name: country.name,
              code: country.alpha2Code
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
          setCountries(sortedCountries);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
        setCountries([]);
      }
    };

    fetchCountries();
  }, []);

  /**
   * Sync with parent form data changes
   */
  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  // ============================================
  // EVENT HANDLERS
  // ============================================
  /**
   * Handle input changes for all form fields
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);
    setParentFormData(updatedFormData);
  };

  /**
   * Check if passwords match
   */
  const passwordsMatch = formData.password && formData.confirmPassword && 
                         formData.password === formData.confirmPassword;

  // ============================================
  // VALIDATION FUNCTION
  // ============================================
  const validate = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9]{10}$/;

    if (!formData.firstName) newErrors.firstName = "*First Name is required";
    if (!formData.lastName) newErrors.lastName = "*Last Name is required";
    if (!formData.username) newErrors.username = "*User Name is required";
    if (!emailPattern.test(formData.email)) newErrors.email = "*Invalid email format";
    
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
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    parentHandleSubmit(e, formData);
  };

  // ============================================
  // DROPDOWN OPTIONS
  // ============================================
  const genderOptions = [
    { value: '', label: 'Select Gender' },
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ];

  const nationalityOptions = [
    { value: '', label: 'Select Nationality' },
    ...countries.map(country => ({
      value: country.name,
      label: country.name
    }))
  ];

  // ============================================
  // JSX RETURN
  // ============================================
  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ✅ NAME FIELDS - USING FormInput */}
      <div className="flex mb-4">
        <div className="w-1/2 mr-2">
          <FormInput
            label="First Name"
            icon={FaUser}
            name="firstName"
            value={formData.firstName || ""}
            onChange={handleChange}
            placeholder="First Name"
            disabled={!isEditing}
            error={errors.firstName}
          />
        </div>
        <div className="w-1/2 mr-2">
          <FormInput
            label="Last Name"
            icon={FaUser}
            name="lastName"
            value={formData.lastName || ""}
            onChange={handleChange}
            placeholder="Last Name"
            disabled={!isEditing}
            error={errors.lastName}
          />
        </div>
      </div>

      {/* ✅ USERNAME - USING FormInput */}
      <div className="mb-4">
        <FormInput
          label="User Name"
          icon={FaUser}
          name="username"
          value={formData.username || ""}
          onChange={handleChange}
          placeholder="User Name"
          disabled={!isEditing || restrictedFields.includes('username')}
          error={errors.username}
        />
      </div>

      {/* ✅ EMAIL AND PHONE - USING FormInput */}
      <div className="flex mb-4">
        <div className="w-1/2 mr-2">
          <FormInput
            label="Email"
            icon={FaEnvelope}
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            placeholder="XXXX@label.com"
            disabled={!isEditing}
            error={errors.email}
          />
        </div>
        <div className="w-1/2 mr-2">
          <FormInput
            label="Phone"
            icon={FaPhone}
            type="tel"
            name="phone"
            value={formData.phone || ""}
            onChange={handleChange}
            placeholder="XXXXXXXXXX"
            disabled={!isEditing}
            error={errors.phone}
          />
        </div>
      </div>

      {/* PASSWORD FIELDS - CONDITIONAL */}
      {(includePassword || (includeChangePassword && isEditing)) && (
        <>
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

      {/* ✅ DOB AND GENDER */}
      <div className="flex mb-4">
        <div className="w-1/2 mr-2">
          <FormInput
            label="Date of Birth"
            icon={FaCalendarAlt}
            type="date"
            name="dob"
            value={formData.dob || ""}
            onChange={handleChange}
            max={new Date().toISOString().split("T")[0]}
            disabled={!isEditing || restrictedFields.includes('dob')}
            error={errors.dob}
          />
        </div>
        <div className="w-1/2 mr-2">
          <FormSelect
            label="Gender"
            icon={FaVenusMars}
            name="gender"
            value={formData.gender || ""}
            onChange={handleChange}
            options={genderOptions}
            disabled={!isEditing}
            error={errors.gender}
          />
        </div>
      </div>

      {/* ✅ NATIONALITY - USING FormSelect */}
      <div className="w-full mb-4">
        <FormSelect
          label="Nationality"
          icon={FaGlobe}
          name="nationality"
          value={formData.nationality || ""}
          onChange={handleChange}
          options={nationalityOptions}
          disabled={!isEditing}
          error={errors.nationality}
        />
      </div>

      {/* ✅ ADDRESS FIELDS - USING FormInput */}
      <div className="flex flex-col mb-4">
        <label className="block text-sm text-gray-900 font-bold mb-2 flex items-center gap-2">
          <FaMapMarkerAlt className="text-blue-300" />
          <span>Address:</span>
        </label>
        <div className="flex mb-2 gap-2">
          <FormInput
            name="street"
            value={formData.street || ""}
            onChange={handleChange}
            placeholder="Street Address"
            disabled={!isEditing}
          />
          <div className="w-4"></div>
          <FormInput
            name="city"
            value={formData.city || ""}
            onChange={handleChange}
            placeholder="City"
            disabled={!isEditing}
          />
        </div>
        <div className="flex mb-2 gap-2">
          <FormInput
            name="state"
            value={formData.state || ""}
            onChange={handleChange}
            placeholder="State/Province"
            disabled={!isEditing}
          />
          <div className="w-4"></div>
          <FormInput
            name="zip"
            value={formData.zip || ""}
            onChange={handleChange}
            placeholder="Zip/Postal Code"
            disabled={!isEditing}
          />
        </div>
        {errors.address && <p className="text-red-500 text-xs italic font-bold">{errors.address}</p>}
      </div>

      {/* SUBMIT AND CANCEL BUTTONS */}
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
