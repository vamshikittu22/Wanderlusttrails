
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import FormWrapper from './FormWrapper';
import { Link } from 'react-router-dom'; // Import Link for navigation

//BookingDetailsForm component
const BookingDetailsForm = ({ package: initialPackage, isEditMode, initialData = {}, onSubmit, onCancel }) => {
  const [packageId, setPackageId] = useState(initialData.package_id || (JSON.parse(sessionStorage.getItem('selectedPackage')) || {}).id || ''); //state for package ID
  const [persons, setPersons] = useState(initialData.persons || 1); //state for number of persons
  const [startDate, setStartDate] = useState(initialData.start_date ? new Date(initialData.start_date) : null); //state for start date
  const [endDate, setEndDate] = useState(initialData.end_date ? new Date(initialData.end_date) : null); //state for end date
  const [insurance, setInsurance] = useState(initialData.insurance || 'none');  //state for insurance type
  const [totalPrice, setTotalPrice] = useState(initialData.totalPrice || 0); //state for total price

  const selectedPackage = JSON.parse(sessionStorage.getItem('selectedPackage')) || {}; // Retrieve the selected package from session storage
  const pricePerPerson = isEditMode && initialPackage?.price 
    ? parseFloat(initialPackage.price)
    : selectedPackage.price
    ? parseFloat(selectedPackage.price) 
    : 100; // Default price per person if not available
 
  const calculateTotalPrice = () => {
    const days = startDate && endDate
      ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
      : 1; // Calculate the number of days between start and end dates

    let total = days * pricePerPerson * persons;

    // Add insurance cost based on the selected option
    if (insurance === 'basic') {
      total += 30;
    } else if (insurance === 'premium') {
      total += 50;
    } else if (insurance === 'elite') {
      total += 75; // $75 for Elite Coverage
    }

    return total.toFixed(2);
  }; // Function to calculate total price based on selected options

  useEffect(() => {
    const price = calculateTotalPrice();
    setTotalPrice(price);
  }, [startDate, endDate, persons, insurance, pricePerPerson]); // Recalculate total price whenever the relevant state changes
  // Function to validate the form inputs
  const validateForm = () => {
    const errors = {};
    if (!packageId) errors.packageId = 'Please select a package';
    if (!startDate) errors.startDate = 'Start date is required';
    if (!endDate) errors.endDate = 'End date is required';
    if (persons < 1) errors.persons = 'Number of travelers must be at least 1';
    if (startDate && endDate && startDate >= endDate) {
      errors.endDate = 'End date must be after start date';
    }
    const validInsuranceTypes = ['none', 'basic', 'premium', 'elite'];
    if (!validInsuranceTypes.includes(insurance)) {
      errors.insurance = 'Please select a valid insurance option';
    }
    return errors;
  };
// Function to generate a summary of the booking details
  const summary = {
    packageId: packageId,
    persons: persons,
    startDate: startDate ? startDate.toLocaleDateString() : 'N/A',
    endDate: endDate ? endDate.toLocaleDateString() : 'N/A',
    insurance: insurance === 'none' ? 'No Insurance' : insurance === 'basic' ? 'Basic Coverage ($30)' : insurance === 'premium' ? 'Premium Coverage ($50)' : 'Elite Coverage ($75)',
    totalPrice: totalPrice,
  };
  
// Function to handle form submission
  const handleSubmit = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      alert('Please fix the errors in the form.');
      return;
    } 
  
    // Additional safety check for dates to prevent toISOString() error
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }
  
    // Ensure insurance is valid
    const validInsuranceTypes = ['none', 'basic', 'premium', 'elite'];
    const safeInsurance = validInsuranceTypes.includes(insurance) ? insurance : 'none';
  
    // Prepare the form data for submission
    const formData = {
      package_id: packageId,
      persons,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      insurance: safeInsurance,
      total_price: totalPrice,
    };
    onSubmit(formData);
  };
  
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  }; // Function to handle date change for the date picker

  return (
    <FormWrapper
      onSubmit={handleSubmit}
      onCancel={onCancel}
      summary={summary}
      isEditMode={isEditMode}
      bookingType="package"
    >
      <h2 className="text-3xl font-bold text-indigo-800 mb-4 text-center">
        {isEditMode ? 'Edit Booking' : 'Booking Details'}
      </h2>
      <div className="flex items-center bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
        <span className="text-2xl mr-3">📅</span>
        <p className="text-blue-700 text-sm">
          <strong>Note:</strong> Your trip must start tomorrow or later, and the end date must be after the start date.
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-indigo-700 font-semibold mb-2">Package ID:</label>
        <input
          type="text"
          value={packageId}
          disabled
          className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 bg-gray-100 cursor-not-allowed"
        />
      </div>

      <div className="mb-6">
        <label className="block text-indigo-700 font-semibold mb-2">Number of Travelers:</label>
        <input
          type="number"
          value={persons}
          onChange={(e) => setPersons(Number(e.target.value))}
          min="1"
          max="10"
          className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div className="mb-6">
        <label className="block text-indigo-700 font-semibold mb-2">Select Date Range:</label>
        <DatePicker
          selectsRange
          startDate={startDate}
          endDate={endDate}
          minDate={new Date()}
          onChange={handleDateChange}
          isClearable
          dateFormat="MMM d, yyyy"
          className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div className="mb-6">
        <label className="block text-indigo-700 font-semibold mb-2">Insurance Option:</label>
        <select
          value={insurance}
          onChange={(e) => setInsurance(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400"
        >
          <option value="none">No Insurance</option>
          <option value="basic">Basic Coverage (+$30)</option>
          <option value="premium">Premium Coverage (+$50)</option>
          <option value="elite">Elite Coverage (+$75)</option>
        </select>
        <p className="mt-2 text-sm text-indigo-600">
          <Link to="/travelinsurance" className="hover:underline">
            Learn more about our insurance plans
          </Link>
        </p>
      </div>
    </FormWrapper>
  );
};

export default BookingDetailsForm;