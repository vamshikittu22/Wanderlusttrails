
import React, { useState, useEffect } from 'react';
import mockData from '../../data/mockData.js';
import FormWrapper from './FormWrapper.jsx';
import { Link } from 'react-router-dom'; // Import Link for navigation

// ItineraryForm component
const ItineraryForm = ({ initialData, onSubmit, onCancel, packages, loading, error }) => {
  const [packageId, setPackageId] = useState(initialData?.package_id || ''); // state for package ID
  const [selectedPackage, setSelectedPackage] = useState(initialData?.selectedPackage || null); // state for selected package
  const [activities, setActivities] = useState(initialData?.itinerary_details || []); // state for selected activities
  const [startDate, setStartDate] = useState( 
    initialData?.start_date instanceof Date
      ? initialData.start_date.toISOString().split('T')[0]
      : initialData?.start_date || ''
  ); // state for start date
  const [endDate, setEndDate] = useState(
    initialData?.end_date instanceof Date
      ? initialData.end_date.toISOString().split('T')[0]
      : initialData?.end_date || ''
  ); // state for end date
  const [persons, setPersons] = useState(initialData?.persons || 1); // state for number of persons
  const [insurance, setInsurance] = useState(initialData?.insurance || 'none'); // state for insurance type
  const [totalPrice, setTotalPrice] = useState(initialData?.totalPrice || 0); // state for total price

  const today = new Date(); // Get today's date
  const minStartDate = new Date(today); // Create a new date object for minStartDate
  minStartDate.setDate(today.getDate() + 7); // Set minStartDate to 7 days from today 
  const minStartDateString = minStartDate.toISOString().split('T')[0]; // Format minStartDate to YYYY-MM-DD
  const [minEndDate, setMinEndDate] = useState(''); // state for minimum end date

  const availableActivities = mockData.itinerary.activities; // Mock data for available activities

  useEffect(() => {
    console.log('ItineraryForm initialData:', initialData);
    console.log('Initial selectedPackage:', selectedPackage);
    console.log('Initial packageId:', packageId);
    console.log('Packages available:', packages);
  }, [initialData, packages]); // Log initial data and packages for debugging

  useEffect(() => {
    if (packages.length > 0) {
      let pkg = selectedPackage;
      if (!pkg && packageId) {
        pkg = packages.find((p) => p.id == packageId);
        if (pkg) {
          console.log('Setting selectedPackage in edit mode:', pkg);
          setSelectedPackage(pkg);
        }
      }
      if (!packageId) {
        pkg = packages[0];
        setPackageId(pkg.id);
        setSelectedPackage(pkg);
        console.log('Setting default package:', pkg);
      }
    }
  }, [packages, packageId, selectedPackage]); // Set default package if none is selected
 
  useEffect(() => {
    if (startDate) {
      const start = new Date(startDate);
      const newMinEnd = new Date(start);
      newMinEnd.setDate(start.getDate() + 2);
      const newMinEndString = newMinEnd.toISOString().split('T')[0];
      setMinEndDate(newMinEndString);

      if (!endDate || new Date(endDate) < new Date(newMinEndString)) {
        setEndDate(newMinEndString);
      }
    } 
  }, [startDate]); // Update minimum end date based on start date

  const calculateTotalPrice = () => {
    const basePrice = selectedPackage ? parseFloat(selectedPackage.price) || 0 : 0;
    const activitiesPrice = activities.reduce((sum, activity) => sum + (parseFloat(activity.price) || 0), 0);
    let total = (basePrice + activitiesPrice) * persons;

    // Add insurance cost
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
    if (selectedPackage) {
      const price = calculateTotalPrice();
      setTotalPrice(price);
    } else {
      const activitiesPrice = activities.reduce((sum, activity) => sum + (parseFloat(activity.price) || 0), 0);
      const total = activitiesPrice * persons;
      setTotalPrice(total.toFixed(2));
    }
  }, [selectedPackage, activities, persons, insurance]); // Recalculate total price whenever the relevant state changes

  const handlePackageChange = (e) => {
    const id = e.target.value;
    const pkg = packages.find((p) => p.id == id);
    setPackageId(id);
    setSelectedPackage(pkg);
    console.log('Package changed:', pkg);
  }; // Function to handle package selection change

  const handleActivityToggle = (activity) => {
    const isSelected = activities.some((act) => act.id === activity.id);
    if (isSelected) {
      const newActivities = activities.filter((act) => act.id !== activity.id);
      setActivities(newActivities);
      console.log('Activity removed:', newActivities);
    } else {
      const newActivities = [...activities, activity];
      setActivities(newActivities);
      console.log('Activity added:', newActivities);
    } 
  }; // Function to handle activity selection toggle

  const validateForm = () => {
    const errors = {};
    if (!packageId) errors.packageId = "Please select a package";
    if (!startDate) errors.startDate = "Start date is required";
    if (!endDate) errors.endDate = "End date is required";
    if (persons < 1) errors.persons = "Number of travelers must be at least 1";
    return errors;
  }; // Function to validate the form inputs

  const summary = {
    packageName: selectedPackage?.name || 'N/A',
    location: selectedPackage?.location || 'N/A',
    activities: activities.map((act) => act.name).join(', ') || 'None',
    startDate: startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate || 'N/A',
    endDate: endDate instanceof Date ? endDate.toISOString().split('T')[0] : endDate || 'N/A',
    persons: persons,
    insurance: insurance === 'none' ? 'No Insurance' : insurance === 'basic' ? 'Basic Coverage ($30)' : insurance === 'premium' ? 'Premium Coverage ($50)' : 'Elite Coverage ($75)',
    totalPrice: totalPrice,
  }; // Function to generate a summary of the booking details

  const handleSubmit = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      alert("Please fix the errors in the form.");
      return;
    }
    const formData = {
      package_id: packageId,
      selectedPackage: selectedPackage,
      itinerary_details: activities,
      start_date: startDate,
      end_date: endDate,
      persons: persons,
      insurance: insurance, // Log this value
      total_price: totalPrice,
    };
    console.log('Form Data Submitted:', formData); // Add this line
    onSubmit(formData);
  }; // Function to handle form submission

  if (loading) {
    return <p className="text-white text-center">Loading packages...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center">Error: {error}</p>;
  }

  return (
    <FormWrapper
      onSubmit={handleSubmit}
      onCancel={onCancel}
      summary={summary}
      isEditMode={!!initialData}
      bookingType="itinerary"
    >
      <h2 className="text-3xl font-bold text-indigo-800 mb-4 text-center">
        {initialData ? 'Edit Your Itinerary' : 'Plan Your Itinerary'}
      </h2>
      <div className="flex items-center bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
        <span className="text-2xl mr-3">📅</span>
        <p className="text-blue-700 text-sm">
          <strong>Note:</strong> Your trip must start at least 7 days from today and last at least 2 days.
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-indigo-700 font-semibold mb-2">Choose a Package</label>
        <select
          value={packageId}
          onChange={handlePackageChange}
          className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400"
        >
          {packages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.name} - ${pkg.price}
            </option>
          ))}
        </select>
      </div>

      {selectedPackage && (
        <div className="mb-6 p-4 bg-indigo-50 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold text-indigo-800 mb-2">
            {selectedPackage.name} - {selectedPackage.location}
          </h3>
          <p className="text-gray-600">{selectedPackage.description || 'No description available.'}</p>
          <p className="text-indigo-700 font-medium mt-2">Price: ${selectedPackage.price}</p>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-indigo-800 mb-3">Pick Activities</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {availableActivities.map((activity) => (
            <div
              key={activity.id}
              className={`p-4 border rounded-lg cursor-pointer ${
                activities.some((act) => act.id === activity.id)
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-400'
              }`}
              onClick={() => handleActivityToggle(activity)}
            >
              <p className="text-indigo-700 font-semibold">{activity.name}</p>
              <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
              <p className="text-gray-600 text-sm mt-1">Duration: {activity.duration}</p>
              <p className="text-indigo-600 text-sm font-medium mt-1">Price: ${activity.price}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-indigo-700 font-semibold mb-2">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          min={minStartDateString}
          className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400"
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-indigo-700 font-semibold mb-2">End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          min={minEndDate}
          className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400"
          required
        />
      </div>

      <div className="mb-6">
        <label className="block text-indigo-700 font-semibold mb-2">Number of Travelers</label>
        <input
          type="number"
          value={persons}
          onChange={(e) => setPersons(Number(e.target.value))}
          min="1"
          className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400"
          required
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

export default ItineraryForm;