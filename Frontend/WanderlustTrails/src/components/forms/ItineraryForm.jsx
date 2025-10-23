// ============================================
// IMPORTS SECTION
// ============================================
import React, { useState, useEffect } from 'react';
import mockData from '../../data/mockData.js';
import FormWrapper from './FormWrapper.jsx';
import { Link } from 'react-router-dom';
import { FaBox, FaCalendarAlt, FaUsers, FaShieldAlt, FaCheckCircle, FaHiking, FaLandmark, FaSpa, FaUtensils, FaWater } from 'react-icons/fa';

// Import your existing components
import Pagination from '../Pagination.jsx';
import FilterSortBar from '../FilterSortBar.jsx';


// ============================================
// MAIN COMPONENT DEFINITION
// ============================================
/**
 * ItineraryForm Component with Tab Filtering and Pagination
 * 
 * Uses existing Pagination and FilterSortBar components
 * Activities are organized by categories (tabs) with 6 items per page
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
      : initialData?.end_date || ''
  );
  const [persons, setPersons] = useState(initialData?.persons || 1);
  const [insurance, setInsurance] = useState(initialData?.insurance || 'none');
  const [totalPrice, setTotalPrice] = useState(initialData?.totalPrice || 0);
  const [errors, setErrors] = useState({});

  // ============================================
  // ACTIVITIES FILTERING AND PAGINATION STATES
  // ============================================
  /**
   * Active category - tracks which category tab is selected
   */
  const [activeCategory, setActiveCategory] = useState('all');
  
  /**
   * Filtered activities - activities after applying category filter
   * This is what gets paginated
   */
  const [filteredActivities, setFilteredActivities] = useState([]);
  
  /**
   * Current page - tracks pagination state
   */
  const [currentPage, setCurrentPage] = useState(1);
  
  /**
   * Items per page constant
   */
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
  /**
   * Category definitions with icons and colors
   */
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
  /**
   * Filter options for categories
   * Each option filters activities by category
   */
  const filterOptions = categories.map(cat => ({
    key: cat.key,
    label: cat.label,
    filterFunction: (activity) => cat.key === 'all' || activity.category === cat.key
  }));

  /**
   * Sort options for activities
   * Users can sort by name, price, or duration
   */
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
        // Extract numeric value from duration string (e.g., "2 hours" -> 2)
        const getDurationValue = (dur) => parseInt(dur.match(/\d+/)?.[0] || 0);
        return getDurationValue(a.duration) - getDurationValue(b.duration);
      }
    }
  ];


  // ============================================
  // PAGINATION CALCULATIONS
  // ============================================
  /**
   * Calculate which activities to display on current page
   */
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentActivities = filteredActivities.slice(startIndex, endIndex);


  /**
   * Get count of activities in each category
   */
  const getCategoryCount = (categoryKey) => {
    if (categoryKey === 'all') return availableActivities.length;
    return availableActivities.filter(act => act.category === categoryKey).length;
  };

  /**
   * Get count of SELECTED activities in each category
   */
  const getSelectedCount = (categoryKey) => {
    if (categoryKey === 'all') return activities.length;
    return activities.filter(act => act.category === categoryKey).length;
  };


  // ============================================
  // SIDE EFFECTS
  // ============================================
  
  /**
   * Initialize filteredActivities with all activities
   * FilterSortBar will handle the filtering
   */
  useEffect(() => {
    setFilteredActivities(availableActivities);
  }, []);

  /**
   * Reset to page 1 when filtered activities change
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredActivities]);

  useEffect(() => {
    console.log('ItineraryForm initialData:', initialData);
  }, [initialData, packages]);

  useEffect(() => {
    if (packages.length > 0) {
      let pkg = selectedPackage;
      
      if (!pkg && packageId) {
        pkg = packages.find((p) => p.id == packageId);
        if (pkg) {
          setSelectedPackage(pkg);
        }
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

    let insuranceCost = 0;
    if (insurance === 'basic') {
      insuranceCost = 30 * persons;
    } else if (insurance === 'premium') {
      insuranceCost = 50 * persons;
    } else if (insurance === 'elite') {
      insuranceCost = 75 * persons;
    }
    
    total += insuranceCost;
    return total.toFixed(2);
  };

  useEffect(() => {
    if (selectedPackage) {
      const price = calculateTotalPrice();
      setTotalPrice(price);
    } else {
      const activitiesPrice = activities.reduce(
        (sum, activity) => sum + (parseFloat(activity.price) || 0), 
        0
      );
      const total = activitiesPrice * persons;
      setTotalPrice(total.toFixed(2));
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
      const newActivities = activities.filter((act) => act.id !== activity.id);
      setActivities(newActivities);
      console.log('🎯 Activity removed:', activity.name);
    } else {
      const newActivities = [...activities, activity];
      setActivities(newActivities);
      console.log('🎯 Activity added:', activity.name);
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
    if (persons < 1) errors.persons = "Number of travelers must be at least 1";
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      errors.endDate = "End date must be after start date";
    }
    return errors;
  };


  // ============================================
  // SUMMARY OBJECT
  // ============================================
  const summary = {
    packageName: selectedPackage?.name || 'N/A',
    location: selectedPackage?.location || 'N/A',
    activities: activities.map((act) => act.name).join(', ') || 'None',
    startDate: startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate || 'N/A',
    endDate: endDate instanceof Date ? endDate.toISOString().split('T')[0] : endDate || 'N/A',
    persons: persons,
    insurance: insurance === 'none' 
      ? 'No Insurance' 
      : insurance === 'basic' 
        ? `Basic Coverage ($${30 * persons})` 
        : insurance === 'premium' 
          ? `Premium Coverage ($${50 * persons})` 
          : `Elite Coverage ($${75 * persons})`,
    totalPrice: totalPrice,
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
      selectedPackage: selectedPackage,
      itinerary_details: activities,
      start_date: startDate,
      end_date: endDate,
      persons: persons,
      insurance: insurance,
      total_price: totalPrice,
    };
    
    console.log('✅ Form Data Submitted:', formData);
    onSubmit(formData);
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


      {/* PACKAGE SELECTION */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-indigo-700 font-semibold mb-2">
          <FaBox className="text-purple-500" />
          <span>Choose a Package</span>
        </label>
        
        <select
          value={packageId}
          onChange={handlePackageChange}
          className={`w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400 ${
            errors.packageId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          {packages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.name} - ${pkg.price}/day per person
            </option>
          ))}
        </select>
        
        {errors.packageId && (
          <p className="text-red-500 text-sm mt-1">{errors.packageId}</p>
        )}
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


      {/* ============================================ */}
      {/* ACTIVITIES SECTION WITH FILTER, SORT & PAGINATION */}
      {/* ============================================ */}
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

        {/* ============================================ */}
        {/* FILTER AND SORT BAR - Using Your Component */}
        {/* ============================================ */}
        <div className="mb-4 bg-indigo-300 rounded-lg p-4 border border-indigo-200">
          <FilterSortBar
            items={availableActivities}
            setFilteredItems={setFilteredActivities}
            filterOptions={filterOptions}
            sortOptions={sortOptions}
          />
        </div>

        {/* Category Counts Display
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const count = getCategoryCount(cat.key);
            const selectedCount = getSelectedCount(cat.key);
            
            return (
              <div
                key={cat.key}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm"
              >
                <Icon className={cat.color} />
                <span className="font-medium">{cat.label}:</span>
                <span className="text-gray-600">{count} available</span>
                {selectedCount > 0 && (
                  <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    ✓ {selectedCount}
                  </span>
                )}
              </div>
            );
          })}
        </div> */}

        {/* ============================================ */}
        {/* ACTIVITIES GRID */}
        {/* ============================================ */}
        {currentActivities.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {currentActivities.map((activity) => {
                const isSelected = activities.some((act) => act.id === activity.id);
                
                return (
                  <div
                    key={activity.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 shadow-md'
                        : 'border-gray-200 hover:border-indigo-400 hover:shadow-sm'
                    }`}
                    onClick={() => handleActivityToggle(activity)}
                  >
                    {/* Selected Indicator */}
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
                    
                    {/* Category Badge */}
                    {activity.category && (
                      <p className="text-xs text-gray-500 mt-2 capitalize">
                        📁 {activity.category}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ============================================ */}
            {/* PAGINATION - Using Your Component */}
            {/* ============================================ */}
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


      {/* START DATE INPUT */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-indigo-700 font-semibold mb-2">
          <FaCalendarAlt className="text-green-500" />
          <span>Start Date</span>
        </label>
        
        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            if (errors.startDate) {
              setErrors({ ...errors, startDate: '' });
            }
          }}
          min={minStartDateString}
          className={`w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400 ${
            errors.startDate ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        
        {errors.startDate && (
          <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
        )}
      </div>


      {/* END DATE INPUT */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-indigo-700 font-semibold mb-2">
          <FaCalendarAlt className="text-red-500" />
          <span>End Date</span>
        </label>
        
        <input
          type="date"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            if (errors.endDate) {
              setErrors({ ...errors, endDate: '' });
            }
          }}
          min={minEndDate}
          className={`w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400 ${
            errors.endDate ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        
        {errors.endDate && (
          <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
        )}
      </div>


      {/* NUMBER OF TRAVELERS */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-indigo-700 font-semibold mb-2">
          <FaUsers className="text-indigo-500" />
          <span>Number of Travelers</span>
        </label>
        
        <input
          type="number"
          value={persons}
          onChange={(e) => {
            setPersons(Number(e.target.value));
            if (errors.persons && Number(e.target.value) >= 1) {
              setErrors({ ...errors, persons: '' });
            }
          }}
          min="1"
          className={`w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400 ${
            errors.persons ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        
        {errors.persons && (
          <p className="text-red-500 text-sm mt-1">{errors.persons}</p>
        )}
      </div>


      {/* INSURANCE OPTION */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-indigo-700 font-semibold mb-2">
          <FaShieldAlt className="text-green-600" />
          <span>Insurance Option (Per Person):</span>
        </label>
        
        {persons > 1 && insurance !== 'none' && (
          <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-3">
            <p className="text-sm text-green-800">
              💡 <strong>Total Insurance:</strong> {
                insurance === 'basic' ? `$30 × ${persons} = $${30 * persons}` :
                insurance === 'premium' ? `$50 × ${persons} = $${50 * persons}` :
                `$75 × ${persons} = $${75 * persons}`
              }
            </p>
          </div>
        )}
        
        <select
          value={insurance}
          onChange={(e) => setInsurance(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400"
        >
          <option value="none">No Insurance</option>
          <option value="basic">Basic Coverage ($30 per person)</option>
          <option value="premium">Premium Coverage ($50 per person)</option>
          <option value="elite">Elite Coverage ($75 per person)</option>
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
