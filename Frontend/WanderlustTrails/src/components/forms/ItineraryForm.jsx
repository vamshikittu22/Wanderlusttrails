// Path: Frontend/WanderlustTrails/src/components/forms/ItineraryForm.jsx

import React, { useState, useEffect } from 'react';
import mockData from '../../data/mockData.js';
import FormWrapper from './FormWrapper.jsx';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormDatePicker from './FormDatePicker.jsx';
import { Link } from 'react-router-dom';
import { 
  FaBox, FaCalendarAlt, FaUsers, FaShieldAlt, FaCheckCircle, 
  FaHiking, FaLandmark, FaSpa, FaUtensils, FaWater 
} from 'react-icons/fa';

// Import your existing components
import Pagination from '../Pagination.jsx';
import FilterSortBar from '../FilterSortBar.jsx';

/**
 * ItineraryForm Component with Tab Filtering and Pagination
 * 
 * Purpose: Plan custom itineraries by selecting package and activities
 * Uses existing Pagination and FilterSortBar components
 * Activities are organized by categories (tabs) with 6 items per page
 * 
 * Features:
 * - Package selection dropdown
 * - Activity selection with categories
 * - Date range (start and end dates)
 * - Number of travelers
 * - Optional travel insurance (per person)
 * - Real-time price calculation
 * 
 * PRICING MODEL:
 * - Package: Per person per day
 * - Activities: ONE-TIME per person (not daily)
 * - Insurance: Per person (Basic $30, Premium $50, Elite $75)
 * 
 * Props:
 * @param {Object} initialData - Pre-filled form data for editing
 * @param {Function} onSubmit - Callback when form submitted
 * @param {Function} onCancel - Callback when form cancelled
 * @param {Array} packages - List of available packages
 * @param {boolean} loading - Loading state for packages
 * @param {string} error - Error message for packages
 */
const ItineraryForm = ({ initialData, onSubmit, onCancel, packages, loading, error }) => {
  
  // ============================================
  // STATE DECLARATIONS
  // ============================================
  const [packageId, setPackageId] = useState(initialData?.package_id || '');
  const [selectedPackage, setSelectedPackage] = useState(initialData?.selectedPackage || null);
  const [activities, setActivities] = useState(initialData?.itinerary_details || []);
  const [startDate, setStartDate] = useState( 
    initialData?.start_date instanceof Date
      ? initialData.start_date.toISOString().split('T')[0]
      : initialData?.start_date || ''
  );
  const [endDate, setEndDate] = useState(
    initialData?.end_date instanceof Date
      ? initialData.end_date.toISOString().split('T')[0]
      : initialData?.end_date || ''  );
  const [persons, setPersons] = useState(initialData?.persons || 1);
  const [insurance, setInsurance] = useState(initialData?.insurance || 'none');
  const [totalPrice, setTotalPrice] = useState(initialData?.totalPrice || 0);
  const [errors, setErrors] = useState({});

  // ============================================
  // ACTIVITIES FILTERING AND PAGINATION STATES
  // ============================================
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // ============================================
  // DATE CALCULATIONS
  // ============================================
  const today = new Date();
  const minStartDate = new Date(today);
  minStartDate.setDate(today.getDate() + 7);
  const minStartDateString = minStartDate.toISOString().split('T')[0];
  const [minEndDate, setMinEndDate] = useState('');

  // ============================================
  // AVAILABLE ACTIVITIES DATA
  // ============================================
  const availableActivities = mockData.itinerary.activities;

  // ============================================
  // CATEGORY CONFIGURATION
  // ============================================
  const categories = [
    { key: 'all', label: 'All Activities', icon: FaCheckCircle, color: 'text-indigo-600' },
    { key: 'adventure', label: 'Adventure', icon: FaHiking, color: 'text-green-600' },
    { key: 'cultural', label: 'Cultural', icon: FaLandmark, color: 'text-purple-600' },
    { key: 'relaxation', label: 'Relaxation', icon: FaSpa, color: 'text-pink-600' },
    { key: 'dining', label: 'Dining', icon: FaUtensils, color: 'text-orange-600' },
    { key: 'water', label: 'Water Sports', icon: FaWater, color: 'text-blue-600' },
  ];

  // ============================================
  // FILTER AND SORT OPTIONS FOR FilterSortBar
  // ============================================
  const filterOptions = categories.map(cat => ({
    key: cat.key,
    label: cat.label,
    filterFunction: (activity) => cat.key === 'all' || activity.category === cat.key
  }));

  const sortOptions = [
    {
      key: 'name',
      label: 'Name (A-Z)',
      sortFunction: (a, b) => a.name.localeCompare(b.name)
    },
    {
      key: 'price-low',
      label: 'Price (Low-High)',
      sortFunction: (a, b) => parseFloat(a.price) - parseFloat(b.price)
    },
    {
      key: 'price-high',
      label: 'Price (High-Low)',
      sortFunction: (a, b) => parseFloat(b.price) - parseFloat(a.price)
    },
    {
      key: 'duration',
      label: 'Duration',
      sortFunction: (a, b) => {
        const getDurationValue = (dur) => parseInt(dur.match(/\d+/)?.[0] || 0);
        return getDurationValue(a.duration) - getDurationValue(b.duration);
      }
    }
  ];

  // ============================================
  // PAGINATION CALCULATIONS
  // ============================================
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentActivities = filteredActivities.slice(startIndex, endIndex);

  const getSelectedCount = (categoryKey) => {
    if (categoryKey === 'all') return activities.length;
    return activities.filter(act => act.category === categoryKey).length;
  };

  // ============================================
  // OPTIONS FOR DROPDOWNS
  // ============================================
  
  // Package options from props
  const packageOptions = packages.map(pkg => ({
    value: pkg.id,
    label: `${pkg.name} - $${pkg.price}/day per person`
  }));

  // Travelers options (1-10)
  const travelerOptions = Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} ${i === 0 ? 'Traveler' : 'Travelers'}`
  }));

  // Insurance options
  const insuranceOptions = [
    { value: 'none', label: 'No Insurance' },
    { value: 'basic', label: 'Basic Coverage ($30/person)' },
    { value: 'premium', label: 'Premium Coverage ($50/person)' },
    { value: 'elite', label: 'Elite Coverage ($75/person)' }
  ];

  // ============================================
  // SIDE EFFECTS
  // ============================================
  
  useEffect(() => {
    setFilteredActivities(availableActivities);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredActivities]);

  useEffect(() => {
    if (packages.length > 0) {
      let pkg = selectedPackage;
      
      if (!pkg && packageId) {
        pkg = packages.find((p) => p.id == packageId);
        if (pkg) setSelectedPackage(pkg);
      }
      
      if (!packageId) {
        pkg = packages[0];
        setPackageId(pkg.id);
        setSelectedPackage(pkg);
      }
    }
  }, [packages, packageId, selectedPackage]);

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
  }, [startDate]);

  // ============================================
  // PRICE CALCULATION FUNCTION
  // ============================================
  const calculateTotalPrice = () => {
    const basePrice = selectedPackage ? parseFloat(selectedPackage.price) || 0 : 0;
    const activitiesPrice = activities.reduce(
      (sum, activity) => sum + (parseFloat(activity.price) || 0), 
      0
    );
    
    let numberOfDays = 1;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }
    
    const packageCost = basePrice * numberOfDays * persons;
    const activitiesCost = activitiesPrice * persons;
    let total = packageCost + activitiesCost;

    const insuranceRates = { none: 0, basic: 30, premium: 50, elite: 75 };
    total += insuranceRates[insurance] * persons;
    
    return total.toFixed(2);
  };

  useEffect(() => {
    if (selectedPackage) {
      setTotalPrice(calculateTotalPrice());
    }
  }, [selectedPackage, activities, persons, insurance, startDate, endDate]);

  // ============================================
  // EVENT HANDLERS
  // ============================================
  const handlePackageChange = (e) => {
    const id = e.target.value;
    const pkg = packages.find((p) => p.id == id);
    setPackageId(id);
    setSelectedPackage(pkg);
    if (errors.packageId) {
      setErrors({ ...errors, packageId: '' });
    }
  };

  const handleActivityToggle = (activity) => {
    const isSelected = activities.some((act) => act.id === activity.id);
    
    if (isSelected) {
      setActivities(activities.filter((act) => act.id !== activity.id));
    } else {
      setActivities([...activities, activity]);
    }
  };

  // ============================================
  // VALIDATION FUNCTION
  // ============================================
  const validateForm = () => {
    const errors = {};
    if (!packageId) errors.packageId = "Please select a package";
    if (!startDate) errors.startDate = "Start date is required";
    if (!endDate) errors.endDate = "End date is required";
    if (persons < 1) errors.persons = "At least 1 traveler required";
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      errors.endDate = "End date must be after start date";
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
      alert("Please fix the errors in the form.");
      return;
    }
    
    const formData = {
      package_id: packageId,
      selectedPackage,
      itinerary_details: activities,
      start_date: startDate,
      end_date: endDate,
      persons,
      insurance,
      total_price: totalPrice,
    };
    
    onSubmit(formData);
  };

  // ============================================
  // HELPER COMPONENT - INSURANCE TOTAL DISPLAY
  // ============================================
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
  // SUMMARY OBJECT
  // ============================================
  const summary = {
    packageName: selectedPackage?.name || 'N/A',
    location: selectedPackage?.location || 'N/A',
    activities: activities.map((act) => act.name).join(', ') || 'None',
    startDate,
    endDate,
    persons,
    insurance: insurance === 'none' ? 'No Insurance' : `${insurance} ($${insurance === 'basic' ? 30 : insurance === 'premium' ? 50 : 75} × ${persons})`,
    totalPrice,
  };

  // ============================================
  // LOADING AND ERROR STATES
  // ============================================
  if (loading) {
    return <p className="text-white text-center">Loading packages...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center">Error: {error}</p>;
  }

  // ============================================
  // JSX RETURN - COMPONENT UI RENDERING
  // ============================================
  return (
    <FormWrapper
      onSubmit={handleSubmit}
      onCancel={onCancel}
      summary={summary}
      isEditMode={!!initialData}
      bookingType="itinerary"
    >
      {/* FORM HEADER */}
      <h2 className="text-3xl font-bold text-indigo-800 mb-4 text-center">
        {initialData ? 'Edit Your Itinerary' : 'Plan Your Itinerary'}
      </h2>

      {/* INFORMATION BANNER */}
      <div className="flex items-center bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
        <span className="text-2xl mr-3">📅</span>
        <p className="text-blue-700 text-sm">
          <strong>Note:</strong> Your trip must start at least 7 days from today and last at least 2 days.
        </p>
      </div>

      {/* ✅ PACKAGE SELECTION - USING FormSelect */}
      <div className="mb-6">
        <FormSelect
          label="Choose a Package"
          icon={FaBox}
          value={packageId}
          onChange={handlePackageChange}
          options={packageOptions}
          error={errors.packageId}
        />
      </div>

      {/* SELECTED PACKAGE DETAILS */}
      {selectedPackage && (
        <div className="mb-6 p-4 bg-indigo-50 rounded-lg shadow-sm border border-indigo-200">
          <h3 className="text-xl font-semibold text-indigo-800 mb-2">
            {selectedPackage.name} - {selectedPackage.location}
          </h3>
          <p className="text-gray-600">{selectedPackage.description || 'No description available.'}</p>
          <p className="text-indigo-700 font-medium mt-2">
            Price: ${selectedPackage.price} per person per day
          </p>
        </div>
      )}

      {/* ACTIVITIES SECTION */}
      <div className="mb-6">
        <h3 className="flex items-center gap-2 text-xl font-semibold text-indigo-800 mb-3">
          <FaCheckCircle className="text-green-500" />
          <span>Pick Activities (One-time per person)</span>
        </h3>
        
        {/* Pricing Note */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
          <p className="text-sm text-yellow-800">
            💡 <strong>Pricing Note:</strong> Each activity is a one-time experience per person during your trip, not charged daily.
          </p>
        </div>

        {/* Selected Activities Summary */}
        {activities.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-green-800 font-semibold mb-2">
              ✅ {activities.length} {activities.length === 1 ? 'activity' : 'activities'} selected
            </p>
            <div className="flex flex-wrap gap-2">
              {activities.map((act) => (
                <span 
                  key={act.id} 
                  className="inline-flex items-center gap-1 bg-white border border-green-300 rounded-full px-3 py-1 text-xs text-green-700"
                >
                  {act.name}
                  <button
                    onClick={() => handleActivityToggle(act)}
                    className="text-red-500 hover:text-red-700 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* FILTER AND SORT BAR */}
        <div className="mb-4 bg-indigo-300 rounded-lg p-4 border border-indigo-200">
          <FilterSortBar
            items={availableActivities}
            setFilteredItems={setFilteredActivities}
            filterOptions={filterOptions}
            sortOptions={sortOptions}
          />
        </div>

        {/* ACTIVITIES GRID */}
        {currentActivities.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {currentActivities.map((activity) => {
                const isSelected = activities.some((act) => act.id === activity.id);
                
                return (
                  <div
                    key={activity.id}
                    role="button"
                    aria-selected={isSelected}
                    tabIndex={0}
                    data-testid={`activity-card-${activity.id}`}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 shadow-md'
                        : 'border-gray-200 hover:border-indigo-400 hover:shadow-sm'
                    }`}
                    onClick={() => handleActivityToggle(activity)}
                  >
                    {isSelected && (
                      <div className="flex justify-end mb-2">
                        <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                          ✓ Selected
                        </span>
                      </div>
                    )}
                    
                    <p className="text-indigo-700 font-semibold">{activity.name}</p>
                    <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
                    <p className="text-gray-600 text-sm mt-1">Duration: {activity.duration}</p>
                    <p className="text-indigo-600 text-sm font-medium mt-1">
                      ${activity.price} per person (one-time)
                    </p>
                    
                    {activity.category && (
                      <p className="text-xs text-gray-500 mt-2 capitalize">
                        📁 {activity.category}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}
            <Pagination
              totalItems={filteredActivities.length}
              itemsPerPage={ITEMS_PER_PAGE}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">No activities match your current filter.</p>
            <p className="text-gray-400 text-sm mt-2">Try selecting a different category or sort option.</p>
          </div>
        )}
      </div>

<div className="grid gap-4 mb-6 md:grid-cols-2"> 
  {/* ✅ START DATE - USING FormDatePicker */}
  <div>
    <FormDatePicker
      label="Start Date"
      icon={FaCalendarAlt}
      value={startDate ? new Date(startDate) : null}
      onChange={(date) => {
        if (date) {
          setStartDate(date.toISOString().split('T')[0]);
        } else {
          setStartDate('');
        }
        if (errors.startDate) {
          setErrors({ ...errors, startDate: '' });
        }
      }}
      minDate={new Date(minStartDateString)}
      error={errors.startDate}
      placeholder="Select start date"
    />
  </div>

  {/* ✅ END DATE - USING FormDatePicker */}
  <div>
    <FormDatePicker
      label="End Date"
      icon={FaCalendarAlt}
      value={endDate ? new Date(endDate) : null}
      onChange={(date) => {
        if (date) {
          setEndDate(date.toISOString().split('T')[0]);
        } else {
          setEndDate('');
        }
        if (errors.endDate) {
          setErrors({ ...errors, endDate: '' });
        }
      }}
      minDate={minEndDate ? new Date(minEndDate) : new Date()}
      error={errors.endDate}
      placeholder="Select end date"
    />
  </div>
</div>

      
<div className="grid gap-4 mb-6 md:grid-cols-2"> 
      {/* ✅ TRAVELERS - USING FormSelect */}
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

      {/* ✅ INSURANCE - USING FormSelect */}
      <div className="mb-6">
        <FormSelect
          label="Insurance Option (Per Person)"
          icon={FaShieldAlt}
          value={insurance}
          onChange={(e) => setInsurance(e.target.value)}
          options={insuranceOptions}
          helperText={
            <>
              <InsuranceTotalDisplay />
              <p className="text-sm text-indigo-600 mt-2">
                <Link to="/travelinsurance" className="hover:underline">
                  Learn more about our insurance plans
                </Link>
              </p>
            </>
          }
        />
      </div>
</div>
    </FormWrapper>
  );
};

export default ItineraryForm;
