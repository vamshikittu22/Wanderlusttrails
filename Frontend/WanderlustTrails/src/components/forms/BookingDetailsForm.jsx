// ============================================
// IMPORTS SECTION
// ============================================
// Import React core library and hooks
import React, { useState, useEffect } from 'react';

// Import DatePicker component for date range selection
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Import FormWrapper component for form layout and submission
import FormWrapper from './FormWrapper';

// Import Link for navigation
import { Link } from 'react-router-dom';

// Import icons for visual enhancement
import { FaBox, FaUsers, FaCalendarAlt, FaShieldAlt } from 'react-icons/fa';


// ============================================
// MAIN COMPONENT DEFINITION
// ============================================
/**
 * BookingDetailsForm Component
 * 
 * Purpose: Form for booking pre-defined travel packages
 * Simpler than custom itinerary - package details are pre-set
 * 
 * Features:
 * - Pre-selected package from session storage
 * - Date range selection
 * - Number of travelers
 * - Optional travel insurance (PER PERSON)
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
  /**
   * Package ID state - ID of selected package
   * Priority: initialData > sessionStorage > empty
   */
  const [packageId, setPackageId] = useState(
    initialData.package_id || 
    (JSON.parse(sessionStorage.getItem('selectedPackage')) || {}).id || 
    ''
  );
  
  /**
   * Number of persons state - how many travelers
   * Default: 1 (minimum required)
   */
  const [persons, setPersons] = useState(initialData.persons || 1);
  
  /**
   * Start date state - trip beginning date
   */
  const [startDate, setStartDate] = useState(
    initialData.start_date ? new Date(initialData.start_date) : null
  );
  
  /**
   * End date state - trip ending date
   */
  const [endDate, setEndDate] = useState(
    initialData.end_date ? new Date(initialData.end_date) : null
  );
  
  /**
   * Insurance state - type of coverage
   * Options: 'none', 'basic', 'premium', 'elite'
   */
  const [insurance, setInsurance] = useState(initialData.insurance || 'none');
  
  /**
   * Total price state - calculated total cost
   */
  const [totalPrice, setTotalPrice] = useState(initialData.totalPrice || 0);

  /**
   * Error state - stores validation error messages
   */
  const [errors, setErrors] = useState({});


  // ============================================
  // PACKAGE DATA RETRIEVAL
  // ============================================
  /**
   * Retrieve selected package from session storage
   * Session storage persists during browser session
   */
  const selectedPackage = JSON.parse(sessionStorage.getItem('selectedPackage')) || {};
  
  /**
   * Determine price per person
   * Priority:
   * 1. Edit mode: use initialPackage price
   * 2. New booking: use sessionStorage price
   * 3. Fallback: $100 default
   */
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
   * *** FIXED: INSURANCE IS NOW PER PERSON ***
   * 
   * PRICING FORMULA:
   * totalPrice = (days × pricePerPerson × numberOfPersons) + (insuranceCost × numberOfPersons)
   * 
   * Components:
   * 1. Days: Number of days in trip (end - start + 1)
   *    - Includes both start and end dates
   *    - Example: Jan 1 to Jan 5 = 5 days
   * 
   * 2. Price Per Person: Package daily rate
   *    - Retrieved from package data
   *    - Example: $100/day per person
   * 
   * 3. Number of Persons: How many travelers
   *    - Minimum: 1
   *    - Example: 2 people
   * 
   * 4. Insurance Cost: PER PERSON
   *    - Basic: $30 per person
   *    - Premium: $50 per person
   *    - Elite: $75 per person
   *    - Multiplied by number of persons
   * 
   * Example Calculation:
   * - Package: $100/day per person
   * - Days: 5 (Jan 1-5)
   * - Persons: 2
   * - Insurance: Premium ($50 per person)
   * 
   * Calculation:
   * Base: 5 days × $100 × 2 persons = $1,000
   * Insurance: $50 × 2 persons = $100
   * Total: $1,100
   * 
   * Returns: Price as string with 2 decimal places
   */
  const calculateTotalPrice = () => {
    // Calculate number of days (add 1 to include both start and end date)
    const days = startDate && endDate
      ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
      : 1;

    // Base calculation: days × price × persons
    let total = days * pricePerPerson * persons;

    // *** FIXED: Insurance cost is now PER PERSON ***
    let insuranceCost = 0;
    if (insurance === 'basic') {
      insuranceCost = 30 * persons; // $30 per person
    } else if (insurance === 'premium') {
      insuranceCost = 50 * persons; // $50 per person
    } else if (insurance === 'elite') {
      insuranceCost = 75 * persons; // $75 per person
    }
    
    total += insuranceCost;

    console.log(`💰 Price Breakdown:
      Days: ${days}
      Price per person per day: $${pricePerPerson}
      Number of persons: ${persons}
      Base cost: ${days} × $${pricePerPerson} × ${persons} = $${days * pricePerPerson * persons}
      Insurance (${insurance}): $${insuranceCost} (${persons} person${persons > 1 ? 's' : ''})
      TOTAL: $${total.toFixed(2)}
    `);

    return total.toFixed(2);
  };


  // ============================================
  // SIDE EFFECT - AUTO PRICE RECALCULATION
  // ============================================
  /**
   * useEffect hook - Recalculate price when dependencies change
   * 
   * Dependencies: startDate, endDate, persons, insurance, pricePerPerson
   * When any of these change, total price is recalculated
   */
  useEffect(() => {
    const price = calculateTotalPrice();
    setTotalPrice(price);
  }, [startDate, endDate, persons, insurance, pricePerPerson]);


  // ============================================
  // VALIDATION FUNCTION
  // ============================================
  /**
   * Validate all form inputs before submission
   * 
   * Validation Rules:
   * 1. Package ID must exist
   * 2. Start date is required
   * 3. End date is required
   * 4. At least 1 traveler required
   * 5. End date must be after start date
   * 6. Insurance must be a valid option (security check)
   * 
   * Returns: Object with error messages
   */
  const validateForm = () => {
    const errors = {};
    
    if (!packageId) errors.packageId = 'Please select a package';
    if (!startDate) errors.startDate = 'Start date is required';
    if (!endDate) errors.endDate = 'End date is required';
    if (persons < 1) errors.persons = 'Number of travelers must be at least 1';
    if (startDate && endDate && startDate >= endDate) {
      errors.endDate = 'End date must be after start date';
    }
    
    // Security check: ensure insurance value is valid
    const validInsuranceTypes = ['none', 'basic', 'premium', 'elite'];
    if (!validInsuranceTypes.includes(insurance)) {
      errors.insurance = 'Please select a valid insurance option';
    }
    
    return errors;
  };


  // ============================================
  // BOOKING SUMMARY OBJECT
  // ============================================
  /**
   * Summary object for display in FormWrapper
   * Shows preview of booking before confirmation
   * *** UPDATED: Shows total insurance cost for multiple travelers ***
   */
  const summary = {
    packageId: packageId,
    persons: persons,
    startDate: startDate ? startDate.toLocaleDateString() : 'N/A',
    endDate: endDate ? endDate.toLocaleDateString() : 'N/A',
    insurance: insurance === 'none' 
      ? 'No Insurance' 
      : insurance === 'basic' 
        ? `Basic Coverage ($${30 * persons} total)` 
        : insurance === 'premium' 
          ? `Premium Coverage ($${50 * persons} total)` 
          : `Elite Coverage ($${75 * persons} total)`,
    totalPrice: totalPrice,
  };


  // ============================================
  // FORM SUBMISSION HANDLER
  // ============================================
  /**
   * Handle form submission with comprehensive validation
   * 
   * Process:
   * 1. Run validation
   * 2. Update errors state for display
   * 3. If errors exist, show alert and stop
   * 4. Additional safety checks for dates
   * 5. Sanitize insurance value
   * 6. Create formData object
   * 7. Call onSubmit callback
   */
  const handleSubmit = () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      alert('Please fix the errors in the form.');
      return;
    } 
  
    // Safety check to prevent toISOString() errors
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }
  
    // Security: ensure insurance value is valid
    const validInsuranceTypes = ['none', 'basic', 'premium', 'elite'];
    const safeInsurance = validInsuranceTypes.includes(insurance) ? insurance : 'none';
  
    // Prepare API-ready data object
    const formData = {
      package_id: packageId,
      persons,
      start_date: startDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
      end_date: endDate.toISOString().split('T')[0],
      insurance: safeInsurance,
      total_price: totalPrice,
    };
    
    onSubmit(formData);
  };


  // ============================================
  // DATE CHANGE HANDLER
  // ============================================
  /**
   * Handle date range selection from DatePicker
   * 
   * DatePicker with selectsRange returns array: [startDate, endDate]
   * - First selection: [date, null]
   * - Second selection: [startDate, endDate]
   * 
   * Also clears date errors when user makes selection
   */
  const handleDateChange = (dates) => {
    const [start, end] = dates; // Destructure array
    setStartDate(start);
    setEndDate(end);
    
    // Clear errors when dates are selected
    if (start && errors.startDate) {
      setErrors({ ...errors, startDate: '' });
    }
    if (end && errors.endDate) {
      setErrors({ ...errors, endDate: '' });
    }
  };


  // ============================================
  // JSX RETURN - COMPONENT UI RENDERING
  // ============================================
  return (
    <FormWrapper
      onSubmit={handleSubmit}
      onCancel={onCancel}
      summary={summary}
      isEditMode={isEditMode}
      bookingType="package"
    >
      {/* ============================================ */}
      {/* FORM HEADER */}
      {/* ============================================ */}
      <h2 className="text-3xl font-bold text-indigo-800 mb-4 text-center">
        {isEditMode ? 'Edit Booking' : 'Booking Details'}
      </h2>

      {/* ============================================ */}
      {/* INFORMATION BANNER */}
      {/* ============================================ */}
      <div className="flex items-center bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
        <span className="text-2xl mr-3">📅</span>
        <p className="text-blue-700 text-sm">
          <strong>Note:</strong> Your trip must start tomorrow or later, and the end date must be after the start date.
        </p>
      </div>


      {/* ============================================ */}
      {/* PACKAGE ID FIELD (READ-ONLY) - WITH ICON */}
      {/* ============================================ */}
      <div className="mb-6">
        {/* Label with icon OUTSIDE */}
        <label className="flex items-center gap-2 text-indigo-700 font-semibold mb-2">
          <FaBox className="text-yellow-500" />
          <span>Package ID:</span>
        </label>
        
        {/* 
          Disabled input showing selected package ID
          Read-only to prevent changes (user must go back to change package)
        */}
        <input
          type="text"
          value={packageId}
          disabled
          className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 bg-gray-100 cursor-not-allowed"
        />
        
        {/* Error message if package ID missing */}
        {errors.packageId && (
          <p className="text-red-500 text-sm mt-1">{errors.packageId}</p>
        )}
      </div>


      {/* ============================================ */}
      {/* NUMBER OF TRAVELERS INPUT - WITH ICON */}
      {/* ============================================ */}
      <div className="mb-6">
        {/* Label with icon OUTSIDE */}
        <label className="flex items-center gap-2 text-indigo-700 font-semibold mb-2">
          <FaUsers className="text-blue-500" />
          <span>Number of Travelers:</span>
        </label>
        
        {/* 
          Number input for traveler count
          - min="1": At least 1 traveler required
          - max="10": Reasonable upper limit
          - Affects total price (per person pricing)
        */}
        <input
          type="number"
          value={persons}
          onChange={(e) => {
            setPersons(Number(e.target.value));
            // Clear error when valid number entered
            if (errors.persons && Number(e.target.value) >= 1) {
              setErrors({ ...errors, persons: '' });
            }
          }}
          min="1"
          max="10"
          className={`w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400 ${
            errors.persons ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        
        {/* Error message */}
        {errors.persons && (
          <p className="text-red-500 text-sm mt-1">{errors.persons}</p>
        )}
      </div>


      {/* ============================================ */}
      {/* DATE RANGE PICKER - WITH ICON */}
      {/* ============================================ */}
      <div className="mb-6">
        {/* Label with icon OUTSIDE */}
        <label className="flex items-center gap-2 text-indigo-700 font-semibold mb-2">
          <FaCalendarAlt className="text-red-500" />
          <span>Select Date Range:</span>
        </label>
        
        {/* 
          DatePicker component with range selection
          
          Features:
          - selectsRange: Allows selecting start and end dates
          - minDate: Prevents selecting past dates
          - isClearable: Shows X button to clear selection
          - dateFormat: Display format (e.g., "Jan 15, 2025")
          
          User Experience:
          1. Click to open calendar
          2. Select start date
          3. Select end date
          4. Both dates highlighted in calendar
        */}
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          minDate={new Date()}
          onChange={handleDateChange}
          isClearable
          dateFormat="MMM d, yyyy"
          className={`w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400 ${
            errors.startDate || errors.endDate ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholderText="Select your travel dates"
        />
        
        {/* Error messages for dates */}
        {errors.startDate && (
          <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
        )}
        {errors.endDate && (
          <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
        )}
      </div>


      {/* ============================================ */}
      {/* INSURANCE OPTION DROPDOWN - WITH ICON */}
      {/* ============================================ */}
      <div className="mb-6">
        {/* Label with icon OUTSIDE */}
        <label className="flex items-center gap-2 text-indigo-700 font-semibold mb-2">
          <FaShieldAlt className="text-green-600" />
          <span>Insurance Option (Per Person):</span>
        </label>
        
        {/* Show total insurance cost for multiple travelers */}
        {persons > 1 && insurance !== 'none' && (
          <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-3 rounded">
            <p className="text-sm text-green-800">
              💡 <strong>Total Insurance Cost:</strong> {
                insurance === 'basic' ? `$30 × ${persons} = $${30 * persons}` :
                insurance === 'premium' ? `$50 × ${persons} = $${50 * persons}` :
                `$75 × ${persons} = $${75 * persons}`
              }
            </p>
          </div>
        )}
        
        {/* 
          Insurance dropdown
          
          Options:
          - None: No coverage ($0)
          - Basic: $30 per person
          - Premium: $50 per person
          - Elite: $75 per person
          
          Important: Price is PER PERSON, not per booking
          Example: 2 travelers with Premium = $50 × 2 = $100
        */}
        <select
          value={insurance}
          onChange={(e) => {
            setInsurance(e.target.value);
            // Clear error when valid option selected
            if (errors.insurance) {
              setErrors({ ...errors, insurance: '' });
            }
          }}
          className={`w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400 ${
            errors.insurance ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="none">No Insurance</option>
          <option value="basic">Basic Coverage ($30 per person)</option>
          <option value="premium">Premium Coverage ($50 per person)</option>
          <option value="elite">Elite Coverage ($75 per person)</option>
        </select>
        
        {/* Error message */}
        {errors.insurance && (
          <p className="text-red-500 text-sm mt-1">{errors.insurance}</p>
        )}
        
        {/* Link to insurance information page */}
        <p className="mt-2 text-sm text-indigo-600">
          <Link to="/travelinsurance" className="hover:underline">
            Learn more about our insurance plans
          </Link>
        </p>
      </div>
    </FormWrapper>
  );
};


// ============================================
// EXPORT COMPONENT
// ============================================
export default BookingDetailsForm;
