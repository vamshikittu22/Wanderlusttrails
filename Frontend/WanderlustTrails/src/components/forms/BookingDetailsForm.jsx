// Path: Frontend/WanderlustTrails/src/components/forms/BookingDetailsForm.jsx

import React, { useState, useEffect } from 'react';
import FormWrapper from './FormWrapper';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormDatePicker from './FormDatePicker';
import { FaBox, FaUsers, FaCalendarAlt, FaShieldAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

/**
 * BookingDetailsForm Component
 * 
 * Purpose: Form for booking pre-defined travel packages
 * Simpler than custom itinerary - package details are pre-set
 * 
 * Features:
 * - Pre-selected package from session storage
 * - Two separate date pickers (start and end)
 * - Number of travelers dropdown (using FormSelect)
 * - Optional travel insurance dropdown (using FormSelect)
 * - Real-time price calculation
 * - Form validation with error display
 * 
 * PRICING MODEL:
 * - Package Price: Per person per day
 * - Formula: days × pricePerPerson × numberOfPersons + insurance
 * - Insurance: PER PERSON (Basic $30, Premium $50, Elite $75)
 * 
 * Props:
 * @param {Object} package - Initial package data (when editing)
 * @param {boolean} isEditMode - Whether editing existing booking
 * @param {Object} initialData - Pre-filled form data
 * @param {Function} onSubmit - Callback when form submitted
 * @param {Function} onCancel - Callback when form cancelled
 */
const BookingDetailsForm = ({ 
  package: initialPackage, 
  isEditMode, 
  initialData = {}, 
  onSubmit, 
  onCancel 
}) => {
  
  // ============================================
  // STATE DECLARATIONS
  // ============================================
  const [packageId, setPackageId] = useState(
    initialData.package_id || 
    (JSON.parse(sessionStorage.getItem('selectedPackage')) || {}).id || 
    ''
  );
  const [persons, setPersons] = useState(initialData.persons || 1);
  const [startDate, setStartDate] = useState(
    initialData.start_date ? new Date(initialData.start_date) : null
  );
  const [endDate, setEndDate] = useState(
    initialData.end_date ? new Date(initialData.end_date) : null
  );
  const [insurance, setInsurance] = useState(initialData.insurance || 'none');
  const [totalPrice, setTotalPrice] = useState(initialData.totalPrice || 0);
  const [errors, setErrors] = useState({});

  // ============================================
  // PACKAGE DATA RETRIEVAL
  // ============================================
  const selectedPackage = JSON.parse(sessionStorage.getItem('selectedPackage')) || {};
  const pricePerPerson = isEditMode && initialPackage?.price 
    ? parseFloat(initialPackage.price)
    : selectedPackage.price
    ? parseFloat(selectedPackage.price) 
    : 100;

  // ============================================
  // PRICE CALCULATION FUNCTION
  // ============================================
  /**
   * Calculate total price for the booking
   * 
   * *** INSURANCE IS PER PERSON ***
   * 
   * PRICING FORMULA:
   * totalPrice = (days × pricePerPerson × numberOfPersons) + (insuranceCost × numberOfPersons)
   */
  const calculateTotalPrice = () => {
    const days = startDate && endDate
      ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
      : 1;

    let total = days * pricePerPerson * persons;

    // Insurance cost per person
    const insuranceRates = { none: 0, basic: 30, premium: 50, elite: 75 };
    total += insuranceRates[insurance] * persons;

    return total.toFixed(2);
  };

  // ============================================
  // SIDE EFFECT - AUTO PRICE RECALCULATION
  // ============================================
  useEffect(() => {
    setTotalPrice(calculateTotalPrice());
  }, [startDate, endDate, persons, insurance, pricePerPerson]);

  // ============================================
  // VALIDATION FUNCTION
  // ============================================
  const validateForm = () => {
    const errors = {};
    if (!packageId) errors.packageId = 'Please select a package';
    if (!startDate) errors.startDate = 'Start date is required';
    if (!endDate) errors.endDate = 'End date is required';
    if (persons < 1) errors.persons = 'At least 1 traveler required';
    if (startDate && endDate && startDate >= endDate) {
      errors.endDate = 'End date must be after start date';
    }
    return errors;
  };

  // ============================================
  // FORM SUBMISSION HANDLER
  // ============================================
  const handleSubmit = () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      alert('Please fix the errors in the form.');
      return;
    }
    
    const formData = {
      package_id: packageId,
      persons,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      insurance,
      total_price: totalPrice,
    };
    
    onSubmit(formData);
  };

  // ============================================
  // OPTIONS FOR DROPDOWNS
  // ============================================
  
  // Number of travelers options (1-10)
  const travelerOptions = Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} ${i === 0 ? 'Traveler' : 'Travelers'}`
  }));

  // Insurance options with per-person pricing
  const insuranceOptions = [
    { value: 'none', label: 'No Insurance' },
    { value: 'basic', label: 'Basic Coverage ($30 per person)' },
    { value: 'premium', label: 'Premium Coverage ($50 per person)' },
    { value: 'elite', label: 'Elite Coverage ($75 per person)' }
  ];

  // ============================================
  // HELPER COMPONENT - INSURANCE TOTAL DISPLAY
  // ============================================
  /**
   * Shows total insurance cost for multiple travelers
   * Only displays when persons > 1 and insurance is selected
   */
  const InsuranceTotalDisplay = () => {
    if (persons <= 1 || insurance === 'none') return null;
    
    const rates = { basic: 30, premium: 50, elite: 75 };
    const total = rates[insurance] * persons;
    
    return (
      <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
        <p className="text-sm text-green-800">
          💡 <strong>Total Insurance:</strong> ${rates[insurance]} × {persons} = ${total}
        </p>
      </div>
    );
  };

  // ============================================
  // SUMMARY FOR DISPLAY
  // ============================================
  const summary = {
    packageId,
    persons,
    startDate: startDate ? startDate.toLocaleDateString() : 'N/A',
    endDate: endDate ? endDate.toLocaleDateString() : 'N/A',
    insurance: insurance === 'none' 
      ? 'No Insurance' 
      : `${insurance.charAt(0).toUpperCase() + insurance.slice(1)} ($${insurance === 'basic' ? 30 : insurance === 'premium' ? 50 : 75} × ${persons})`,
    totalPrice,
  };

  // ============================================
  // JSX RETURN
  // ============================================
  return (
    <FormWrapper
      onSubmit={handleSubmit}
      onCancel={onCancel}
      summary={summary}
      isEditMode={isEditMode}
      bookingType="package"
    >
      {/* FORM HEADER */}
      <h2 className="text-3xl font-bold text-indigo-800 mb-4 text-center">
        {isEditMode ? 'Edit Booking' : 'Booking Details'}
      </h2>

      {/* INFORMATION BANNER */}
      <div className="flex items-center bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
        <span className="text-2xl mr-3">📅</span>
        <p className="text-blue-700 text-sm">
          <strong>Note:</strong> Your trip must start tomorrow or later, and the end date must be after the start date.
        </p>
      </div>

      {/* PACKAGE ID (READ-ONLY) */}
      <div className="mb-6">
        <FormInput
          label="Package ID"
          icon={FaBox}
          value={packageId}
          onChange={() => {}} // No-op since it's disabled
          error={errors.packageId}
          disabled
        />
      </div>

      {/* ✅ TRAVELERS DROPDOWN - USING FormSelect */}
      <div className="mb-6">
        <FormSelect
          label="Number of Travelers"
          icon={FaUsers}
          value={persons}
          onChange={(e) => {
            setPersons(Number(e.target.value));
            if (errors.persons) setErrors({ ...errors, persons: '' });
          }}
          options={travelerOptions}
          error={errors.persons}
        />
      </div>

      {/* ✅ TWO SEPARATE DATE PICKERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* START DATE */}
        <FormDatePicker
          label="Start Date"
          icon={FaCalendarAlt}
          value={startDate}
          onChange={(date) => {
            setStartDate(date);
            if (errors.startDate) setErrors({ ...errors, startDate: '' });
          }}
          minDate={new Date()}
          error={errors.startDate}
          placeholder="Select start date"
        />

        {/* END DATE */}
        <FormDatePicker
          label="End Date"
          icon={FaCalendarAlt}
          value={endDate}
          onChange={(date) => {
            setEndDate(date);
            if (errors.endDate) setErrors({ ...errors, endDate: '' });
          }}
          minDate={startDate || new Date()}
          error={errors.endDate}
          placeholder="Select end date"
        />
      </div>

      {/* ✅ INSURANCE DROPDOWN - USING FormSelect */}
      <div className="mb-6">
        <FormSelect
          label="Insurance Option (Per Person)"
          icon={FaShieldAlt}
          value={insurance}
          onChange={(e) => {
            setInsurance(e.target.value);
            if (errors.insurance) setErrors({ ...errors, insurance: '' });
          }}
          options={insuranceOptions}
          error={errors.insurance}
          helperText={
            <>
              {/* Show insurance total for multiple travelers */}
              <InsuranceTotalDisplay />
              
              {/* Link to insurance info page */}
              <p className="text-sm text-indigo-600 mt-2">
                <Link to="/travelinsurance" className="hover:underline">
                  Learn more about our insurance plans
                </Link>
              </p>
            </>
          }
        />
      </div>
    </FormWrapper>
  );
};

export default BookingDetailsForm;
