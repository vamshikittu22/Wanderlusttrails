// BookingDetailsForm.jsx
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import FormWrapper from './FormWrapper';

const BookingDetailsForm = ({ package: initialPackage, isEditMode, initialData = {}, onSubmit, onCancel }) => {
  const [packageId, setPackageId] = useState(initialData.package_id || (JSON.parse(sessionStorage.getItem('selectedPackage')) || {}).id || '');
  const [persons, setPersons] = useState(initialData.persons || 1);
  const [startDate, setStartDate] = useState(initialData.start_date ? new Date(initialData.start_date) : null);
  const [endDate, setEndDate] = useState(initialData.end_date ? new Date(initialData.end_date) : null);
  const [totalPrice, setTotalPrice] = useState(initialData.totalPrice || 0);

  const selectedPackage = JSON.parse(sessionStorage.getItem('selectedPackage')) || {};
  const pricePerPerson = isEditMode && initialPackage?.price
    ? parseFloat(initialPackage.price)
    : selectedPackage.price
    ? parseFloat(selectedPackage.price)
    : 100;

  const calculateTotalPrice = () => {
    const days = startDate && endDate
      ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
      : 1;
    const total = (days * pricePerPerson * persons).toFixed(2);
    return total;
  };

  // Recalculate total price whenever dependencies change
  useEffect(() => {
    const price = calculateTotalPrice();
    setTotalPrice(price);
  }, [startDate, endDate, persons, pricePerPerson]);

  const validateForm = () => {
    const errors = {};
    if (!packageId) errors.packageId = 'Package ID is required';
    if (!startDate) errors.startDate = 'Start date is required';
    if (!endDate) errors.endDate = 'End date is required';
    if (persons < 1) errors.persons = 'Number of travelers must be at least 1';
    if (startDate && endDate && startDate >= endDate) {
      errors.endDate = 'End date must be after start date';
    }
    return errors;
  };

  const summary = {
    packageId: packageId,
    persons: persons,
    startDate: startDate ? startDate.toLocaleDateString() : 'N/A',
    endDate: endDate ? endDate.toLocaleDateString() : 'N/A',
    totalPrice: totalPrice,
  };

  const handleSubmit = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      alert('Please fix the errors in the form.');
      return;
    }
    const formData = {
      package_id: packageId,
      persons,
      startDate,
      endDate,
      totalPrice,
    };
    onSubmit(formData);
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

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
    </FormWrapper>
  );
};

export default BookingDetailsForm;