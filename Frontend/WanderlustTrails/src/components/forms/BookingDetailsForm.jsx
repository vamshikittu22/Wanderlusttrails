// ============================================
// IMPORTS SECTION
// ============================================
// Import React core library and essential hooks
import React, { useState, useEffect } from 'react';

// Import DatePicker component for date selection with calendar interface
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Import airport data JSON file with worldwide airport information
import airportData from '../airports.json';

// Import FormWrapper component that handles submission and displays summary
import FormWrapper from './FormWrapper';

// Import icon components for visual enhancement
import { FaPlaneDeparture, FaPlaneArrival, FaUsers, FaStar, FaCar, FaShieldAlt, FaSwimmingPool, FaWifi } from 'react-icons/fa';

// Import Link for client-side navigation
import { Link } from 'react-router-dom';


// ============================================
// MAIN COMPONENT DEFINITION
// ============================================
/**
 * FlightAndHotelForm Component
 * 
 * Purpose: Comprehensive form for booking combined flight and hotel packages
 * 
 * Features:
 * - Round-trip or one-way flight options
 * - City autocomplete with airport codes
 * - Multiple flight classes and airlines
 * - Hotel star ratings (3-5 stars)
 * - Optional amenities (pool, wifi)
 * - Car rental option
 * - Travel insurance (per person pricing)
 * - Real-time price calculation
 * - Form validation with error messages
 * 
 * PRICING MODEL:
 * - Flight: Based on distance × class multiplier × persons × nights
 * - Hotel: Included in base price, adjusted by star rating
 * - Insurance: PER PERSON (not per booking)
 * - Car Rental: Per night
 * - Amenities: One-time fees
 * 
 * Props:
 * @param {Object} initialData - Pre-filled data for editing
 * @param {boolean} isEditMode - Whether editing existing booking
 * @param {Function} onSubmit - Callback when form is submitted
 * @param {Function} onCancel - Callback when form is cancelled
 */
const FlightAndHotelForm = ({ initialData = {}, isEditMode = false, onSubmit, onCancel }) => {
  
  // ============================================
  // STATE DECLARATIONS
  // ============================================
  /**
   * All form field states with initial values from initialData or defaults
   * Each state manages a specific piece of the booking data
   */
  
  // Departure city with airport code (e.g., "London, UK (LHR)")
  const [from, setFrom] = useState(initialData.from || '');
  
  // Destination city with airport code (e.g., "New York, USA (JFK)")
  const [to, setTo] = useState(initialData.to || '');
  
  // Trip start date (Date object)
  const [startDate, setStartDate] = useState(initialData.startDate ? new Date(initialData.startDate) : null);
  
  // Trip end date (Date object, only for round trips)
  const [endDate, setEndDate] = useState(initialData.endDate ? new Date(initialData.endDate) : null);
  
  // Round trip toggle (true = round trip, false = one-way)
  const [roundTrip, setRoundTrip] = useState(initialData.roundTrip !== undefined ? initialData.roundTrip : true);
  
  // Number of travelers (minimum 1)
  const [persons, setPersons] = useState(initialData.persons || 1);
  
  // Flight class selection (economy, premium_economy, business, first)
  const [flightClass, setFlightClass] = useState(initialData.flightClass || 'economy');
  
  // Hotel star rating (3, 4, or 5 stars)
  const [hotelStars, setHotelStars] = useState(initialData.hotelStars || '3');
  
  // Airline preference (specific airline or 'any')
  const [airline, setAirline] = useState(initialData.airline || 'any');
  
  // Preferred flight departure time (morning, afternoon, evening, or any)
  const [flightTime, setFlightTime] = useState(initialData.flightTime || 'any');
  
  // Travel insurance type (none, basic, premium, elite)
  const [insurance, setInsurance] = useState(initialData.insurance || 'none');
  
  // Car rental option (boolean)
  const [carRental, setCarRental] = useState(initialData.carRental || false);
  
  // Hotel pool amenity (boolean)
  const [pool, setPool] = useState(initialData.amenities?.pool || false);
  
  // Hotel wifi amenity (boolean)
  const [wifi, setWifi] = useState(initialData.amenities?.wifi || false);
  
  // Autocomplete suggestion arrays for city search
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  
  // Visibility flags for autocomplete dropdowns
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  
  // Calculated total price (updated automatically)
  const [totalPrice, setTotalPrice] = useState(initialData.totalPrice || 0);

  // ============================================
  // ERROR STATE MANAGEMENT
  // ============================================
  /**
   * Errors object stores validation error messages
   * Structure: { fieldName: 'error message' }
   * Displayed in red text below each field
   */
  const [errors, setErrors] = useState({});

  // ============================================
  // DATA PROCESSING
  // ============================================
  /**
   * Process airport data to create city search list
   * 
   * Filters:
   * - Only large and medium airports (major hubs with commercial flights)
   * - Only airports with IATA codes (3-letter codes like JFK, LHR)
   * 
   * Output format: "City, Country (CODE)"
   * Example: "London, UK (LHR)"
   * 
   * Also extracts latitude and longitude for distance calculations
   */
  const cityData = airportData
    .filter(airport => ['large_airport', 'medium_airport'].includes(airport.type) && airport.iata_code)
    .map(airport => ({
      name: `${airport.municipality}, ${airport.iso_country} (${airport.iata_code})`,
      lat: parseFloat(airport.latitude_deg),
      lon: parseFloat(airport.longitude_deg),
    }));

  /**
   * Available airlines list
   * Used to populate the airline dropdown
   * First option "Any Airline" allows flexibility
   */
  const airlines = [
    'Any Airline', 'Delta', 'American Airlines', 'United', 'British Airways',
    'Emirates', 'Qantas', 'Air France', 'Japan Airlines', 'Lufthansa',
  ];

  // ============================================
  // CALCULATION FUNCTIONS
  // ============================================
  
  /**
   * Calculate distance between two cities using Haversine formula
   * 
   * The Haversine formula determines the great-circle distance between
   * two points on a sphere given their longitudes and latitudes
   * 
   * Formula components:
   * - R: Earth's radius in miles (3958.8 mi)
   * - dLat: Difference in latitude (in radians)
   * - dLon: Difference in longitude (in radians)
   * - a: Square of half the chord length between points
   * - c: Angular distance in radians
   * 
   * Returns: Distance in miles, or 0 if cities not found
   */
  const distance = () => {
    const fromCity = cityData.find(city => city.name === from);
    const toCity = cityData.find(city => city.name === to);
    
    if (fromCity && toCity) {
      const R = 3958.8; // Earth's radius in miles
      
      // Convert latitude and longitude differences to radians
      const dLat = (toCity.lat - fromCity.lat) * Math.PI / 180;
      const dLon = (toCity.lon - fromCity.lon) * Math.PI / 180;
      
      // Apply Haversine formula
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(fromCity.lat * Math.PI / 180) * Math.cos(toCity.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      
      return R * c; // Distance in miles
    }
    return 0;
  };

  /**
   * Calculate estimated flight duration based on distance
   * 
   * Assumptions:
   * - Average commercial aircraft speed: 550 mph
   * - Does not account for taxi, takeoff, landing time
   * - Does not account for wind or weather conditions
   * 
   * Process:
   * 1. Get distance in miles
   * 2. Divide by average speed to get hours
   * 3. Convert to total minutes
   * 4. Extract hours and remaining minutes
   * 
   * Returns: Formatted string like "5h 30m" or "N/A"
   */
  const flightDuration = () => {
    const dist = distance();
    
    if (dist) {
      const avgSpeed = 550; // mph
      const hours = dist / avgSpeed;
      const minutes = Math.round(hours * 60);
      const durationHours = Math.floor(minutes / 60);
      const durationMinutes = minutes % 60;
      
      return `${durationHours}h ${durationMinutes}m`;
    }
    return 'N/A';
  };

  /**
   * Calculate total price of the booking
   * 
   * *** FIXED: INSURANCE IS NOW PER PERSON ***
   * 
   * PRICING FORMULA:
   * 
   * Base Calculation:
   * price = (basePrice + distanceCost) × persons × nights × classMultiplier × hotelStarFactor
   * 
   * Components:
   * 1. Base Price: $100 (starting flight cost)
   * 
   * 2. Distance Cost: $0.10 per mile
   *    - Example: 1000 miles = $100 added to base
   * 
   * 3. Flight Class Multipliers:
   *    - Economy: 1x (no extra charge)
   *    - Premium Economy: 1.5x
   *    - Business: 2.5x
   *    - First Class: 4x
   * 
   * 4. Number of Nights:
   *    - Round trip: Days between start and end
   *    - One-way: 1 night minimum
   * 
   * 5. Hotel Star Factor: (stars / 3)
   *    - 3 stars: 1x
   *    - 4 stars: 1.33x
   *    - 5 stars: 1.67x
   * 
   * Add-ons (added AFTER base calculation):
   * - Car Rental: $30 per night
   * - Pool: $20 one-time
   * - WiFi: $10 one-time
   * - Insurance: PER PERSON (multiplied by number of travelers)
   *   - Basic: $30 per person
   *   - Premium: $50 per person
   *   - Elite: $75 per person
   * 
   * Example:
   * - Base: $100
   * - Distance: 1000 miles × $0.10 = $100
   * - Class: Business (2.5x)
   * - Persons: 2
   * - Nights: 3
   * - Hotel: 4 stars (1.33x)
   * - Car: Yes ($30 × 3 nights = $90)
   * - Insurance: Premium ($50 × 2 people = $100)
   * 
   * Calculation:
   * Base: (100 + 100) × 2 × 3 × 2.5 × 1.33 = $3,990
   * Car: $90
   * Insurance: $100
   * Total: $4,180
   * 
   * Returns: Price as string with 2 decimal places
   */
  const calculateTotalPrice = () => {
    const basePrice = 100; // Base flight cost
    const dist = distance();
    const distanceCost = dist * 0.10; // $0.10 per mile
    
    // Flight class price multipliers
    const classMultipliers = { 
      economy: 1, 
      premium_economy: 1.5, 
      business: 2.5, 
      first: 4 
    };
    
    // Calculate number of nights
    const nights = roundTrip && startDate && endDate
      ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) // Convert ms to days
      : 1; // One-way trips default to 1 night
    
    // Calculate base price with all multipliers
    let price = (basePrice + distanceCost) * persons * nights * classMultipliers[flightClass] * (parseInt(hotelStars) / 3);

    // Add car rental cost (per night)
    if (carRental) price += 30 * nights;
    
    // Add one-time amenity fees
    if (pool) price += 20;
    if (wifi) price += 10;
    
    // *** FIXED: Insurance is now PER PERSON ***
    let insuranceCost = 0;
    if (insurance === 'basic') {
      insuranceCost = 30 * persons; // $30 per person
    } else if (insurance === 'premium') {
      insuranceCost = 50 * persons; // $50 per person
    } else if (insurance === 'elite') {
      insuranceCost = 75 * persons; // $75 per person
    }
    price += insuranceCost;

    console.log(`💰 Price Calculation Breakdown:
      Base + Distance: $${(basePrice + distanceCost).toFixed(2)}
      Persons: ${persons}
      Nights: ${nights}
      Class Multiplier: ${classMultipliers[flightClass]}x
      Hotel Stars: ${hotelStars} (${(parseInt(hotelStars) / 3).toFixed(2)}x)
      Car Rental: ${carRental ? `$${30 * nights}` : '$0'}
      Pool: ${pool ? '$20' : '$0'}
      WiFi: ${wifi ? '$10' : '$0'}
      Insurance (${insurance}): $${insuranceCost} (${persons} person${persons > 1 ? 's' : ''})
      TOTAL: $${price.toFixed(2)}
    `);

    return price > 0 ? price.toFixed(2) : '0.00';
  }; 

  /**
   * useEffect hook - Automatically recalculate price when dependencies change
   * 
   * Why useEffect?
   * - Separates price calculation from rendering
   * - Ensures price updates after state changes
   * - Prevents infinite render loops
   * 
   * Dependencies: All variables that affect pricing
   * When any dependency changes, this effect runs
   */
  useEffect(() => {
    const price = calculateTotalPrice();
    setTotalPrice(price);
  }, [from, to, startDate, endDate, roundTrip, persons, flightClass, hotelStars, insurance, carRental, pool, wifi]);

  // ============================================
  // VALIDATION FUNCTION
  // ============================================
  /**
   * Validate all form inputs before submission
   * 
   * Validation Rules:
   * 1. Departure city is required
   * 2. Destination city is required
   * 3. Start date is required
   * 4. End date is required for round-trip bookings
   * 5. End date must be after start date (logical constraint)
   * 6. At least 1 traveler required
   * 
   * Returns: Object with field names as keys and error messages as values
   * Empty object means no errors (form is valid)
   */
  const validateForm = () => {
    const errors = {};
    
    if (!from) errors.from = 'Departure city is required';
    if (!to) errors.to = 'Destination city is required';
    if (!startDate) errors.startDate = 'Start date is required';
    if (roundTrip && !endDate) errors.endDate = 'End date is required for round-trip';
    if (roundTrip && startDate && endDate && startDate >= endDate) {
      errors.endDate = 'End date must be after start date';
    }
    if (persons < 1) errors.persons = 'Number of travelers must be at least 1';
    
    return errors;
  }; 

  // ============================================
  // BOOKING SUMMARY OBJECT
  // ============================================
  /**
   * Summary object for display in FormWrapper
   * 
   * Contains all booking details formatted for preview
   * Shows user what they're about to book before confirmation
   * Insurance now shows total cost (per person × number of persons)
   */
  const summary = {
    from: from || 'N/A',
    to: to || 'N/A',
    startDate: startDate ? startDate.toLocaleDateString() : 'N/A',
    endDate: roundTrip && endDate ? endDate.toLocaleDateString() : null,
    tripType: roundTrip ? 'Round-Trip' : 'One-Way',
    flightDuration: flightDuration(),
    airline: airline === 'any' ? 'Any Airline' : airline,
    persons: persons,
    flightClass: flightClass,
    flightTime: flightTime,
    hotelStars: hotelStars,
    amenities: `${pool ? 'Pool ' : ''}${wifi ? 'Wi-Fi' : ''}` || 'None',
    // *** UPDATED: Show total insurance cost for multiple travelers ***
    insurance: insurance === 'none' 
      ? 'No Insurance' 
      : insurance === 'basic' 
        ? `Basic Coverage ($${30 * persons} total)` 
        : insurance === 'premium' 
          ? `Premium Coverage ($${50 * persons} total)` 
          : `Elite Coverage ($${75 * persons} total)`,
    addOns: `${carRental ? 'Car Rental' : ''}` || 'None',
    totalPrice: totalPrice,
  };

  // ============================================
  // FORM SUBMISSION HANDLER
  // ============================================
  /**
   * Handle form submission with validation
   * 
   * Process:
   * 1. Run validation function
   * 2. Update errors state to display in UI
   * 3. If errors exist, show alert and stop
   * 4. If valid, create structured formData object
   * 5. Call onSubmit callback with formData
   * 
   * FormData structure matches backend API expectations
   */
  const handleSubmit = () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      alert('Please fix the errors in the form.');
      return;
    }
    
    // Create API-ready data object
    const formData = {
      flight_details: {
        from,
        to,
        roundTrip,
        airline,
        flightClass,
        flightTime,
        duration: flightDuration(),
      },
      hotel_details: {
        hotelStars,
        amenities: { pool, wifi },
        car_rental: carRental,
      },
      start_date: startDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
      end_date: roundTrip && endDate ? endDate.toISOString().split('T')[0] : null,
      persons,
      insurance,
      total_price: totalPrice,
    };
    
    onSubmit(formData);
  };

  // ============================================
  // INPUT CHANGE HANDLERS WITH AUTOCOMPLETE
  // ============================================
  
  /**
   * Handle departure city input changes with autocomplete
   * 
   * Features:
   * - Real-time filtering of city list as user types
   * - Case-insensitive search
   * - Shows/hides dropdown based on input
   * - Clears error when user starts typing
   * 
   * Autocomplete improves UX by:
   * - Reducing typos
   * - Ensuring valid city selection
   * - Showing airport codes for clarity
   */
  const handleFromChange = (e) => {
    const value = e.target.value;
    setFrom(value);
    
    // Clear error when user starts typing
    if (errors.from) {
      setErrors({ ...errors, from: '' });
    }
    
    // Filter cities that match input
    if (value.trim().length > 0) {
      const filtered = cityData.filter(city =>
        city.name.toLowerCase().includes(value.toLowerCase())
      );
      setFromSuggestions(filtered);
      setShowFromSuggestions(true);
    } else {
      setFromSuggestions([]);
      setShowFromSuggestions(false);
    }
  };

  /**
   * Handle destination city input changes with autocomplete
   * 
   * Same functionality as handleFromChange but for destination field
   */
  const handleToChange = (e) => {
    const value = e.target.value;
    setTo(value);
    
    // Clear error when user starts typing
    if (errors.to) {
      setErrors({ ...errors, to: '' });
    }
    
    // Filter cities that match input
    if (value.trim().length > 0) {
      const filtered = cityData.filter(city =>
        city.name.toLowerCase().includes(value.toLowerCase())
      );
      setToSuggestions(filtered);
      setShowToSuggestions(true);
    } else {
      setToSuggestions([]);
      setShowToSuggestions(false);
    }
  };

  // ============================================
  // JSX RETURN - COMPONENT UI RENDERING
  // ============================================
  /**
   * Render the form wrapped in FormWrapper
   * FormWrapper provides:
   * - Submit and cancel buttons
   * - Booking summary sidebar
   * - Consistent styling
   * - Form layout structure
   */
  return (
    <FormWrapper
      onSubmit={handleSubmit}
      onCancel={onCancel}
      summary={summary}
      isEditMode={isEditMode}
      bookingType="flight_hotel"
    >
      {/* ============================================ */}
      {/* FORM HEADER */}
      {/* ============================================ */}
      {/* Dynamic heading based on edit/create mode */}
      <h2 className="text-3xl font-bold text-indigo-800 mb-4 text-center">
        {isEditMode ? 'Edit Your Flight & Hotel' : 'Book Flight & Hotel'}
      </h2>

      {/* ============================================ */}
      {/* INFORMATION BANNER */}
      {/* ============================================ */}
      {/* Blue info box with important booking rules */}
      <div className="flex items-center bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
        <span className="text-2xl mr-3">📅</span>
        <p className="text-blue-700 text-sm">
          <strong>Note:</strong> Your trip must start tomorrow or later, and for round-trips, the end date must be after the start date.
        </p>
      </div>

      {/* ============================================ */}
      {/* ROUND-TRIP TOGGLE */}
      {/* ============================================ */}
      {/* 
        Checkbox to toggle between round-trip and one-way
        Affects: End date requirement, price calculation
      */}
      <div className="flex items-center justify-between mb-6">
        <label className="text-indigo-700 font-semibold">Round-Trip</label>
        <input
          type="checkbox"
          checked={roundTrip}
          onChange={(e) => setRoundTrip(e.target.checked)}
          className="h-5 w-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      {/* ============================================ */}
      {/* DEPARTURE AND DESTINATION CITIES */}
      {/* ============================================ */}
      {/* 
        Grid layout: 2 columns on tablet+, 1 column on mobile
        Features autocomplete dropdowns for city selection
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* DEPARTURE CITY FIELD (FROM) */}
        <div className="relative">
          {/* Label with icon OUTSIDE input field */}
          <label className="flex items-center gap-2 text-indigo-700 font-semibold mb-2">
            <FaPlaneDeparture className="text-indigo-500" />
            <span>From</span>
          </label>
          
          {/* Text input with autocomplete */}
          <input
            type="text"
            value={from}
            onChange={handleFromChange}
            className={`w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400 ${
              errors.from ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Departure City (e.g., London, UK (LHR))"
          />
          
          {/* Error message in red */}
          {errors.from && (
            <p className="text-red-500 text-sm mt-1">{errors.from}</p>
          )}
          
          {/* Autocomplete suggestions dropdown */}
          {showFromSuggestions && fromSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-md">
              {fromSuggestions.map((suggestion) => (
                <li
                  key={suggestion.name}
                  onClick={() => {
                    setFrom(suggestion.name);
                    setShowFromSuggestions(false);
                    if (errors.from) {
                      setErrors({ ...errors, from: '' });
                    }
                  }}
                  className="p-2 text-gray-700 hover:bg-indigo-600 hover:text-white cursor-pointer"
                >
                  {suggestion.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* DESTINATION CITY FIELD (TO) */}
        <div className="relative">
          {/* Label with icon OUTSIDE input field */}
          <label className="flex items-center gap-2 text-indigo-700 font-semibold mb-2">
            <FaPlaneArrival className="text-indigo-500" />
            <span>To</span>
          </label>
          
          {/* Text input with autocomplete */}
          <input
            type="text"
            value={to}
            onChange={handleToChange}
            className={`w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400 ${
              errors.to ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Destination City (e.g., New York, USA (JFK))"
          />
          
          {/* Error message in red */}
          {errors.to && (
            <p className="text-red-500 text-sm mt-1">{errors.to}</p>
          )}
          
          {/* Autocomplete suggestions dropdown */}
          {showToSuggestions && toSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-md">
              {toSuggestions.map((suggestion) => (
                <li
                  key={suggestion.name}
                  onClick={() => {
                    setTo(suggestion.name);
                    setShowToSuggestions(false);
                    if (errors.to) {
                      setErrors({ ...errors, to: '' });
                    }
                  }}
                  className="p-2 text-gray-700 hover:bg-indigo-600 hover:text-white cursor-pointer"
                >
                  {suggestion.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* DATES AND FLIGHT TIME SECTION */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        
        {/* DATE PICKER SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* START DATE PICKER */}
          <div>
            <label className="block text-indigo-700 font-semibold mb-2">Start Date</label>
            {/* 
              DatePicker component from react-datepicker
              - minDate: Prevents selecting past dates
              - onChange: Updates state and clears error
            */}
            <DatePicker
              selected={startDate}
              onChange={(date) => {
                setStartDate(date);
                if (errors.startDate) {
                  setErrors({ ...errors, startDate: '' });
                }
              }}
              minDate={new Date()}
              className={`w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400 ${
                errors.startDate ? 'border-red-500' : 'border-gray-300'
              }`}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select start date"
            />
            {errors.startDate && (
              <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
            )}
          </div>

          {/* END DATE PICKER */}
          <div>
            <label className="block text-indigo-700 font-semibold mb-2">End Date</label>
            {/* 
              DatePicker for return date
              - minDate: Must be after start date
              - disabled: Inactive for one-way trips
            */}
            <DatePicker
              selected={endDate}
              onChange={(date) => {
                setEndDate(date);
                if (errors.endDate) {
                  setErrors({ ...errors, endDate: '' });
                }
              }}
              minDate={startDate || new Date()}
              disabled={!roundTrip}
              className={`w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400 ${
                !roundTrip ? 'opacity-50 cursor-not-allowed' : ''
              } ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select end date"
            />
            {errors.endDate && (
              <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* PREFERRED FLIGHT TIME DROPDOWN */}
        <div>
          <label className="block text-indigo-700 font-semibold mb-2">Preferred Flight Time</label>
          {/* 
            Dropdown for departure time preference
            Options: Any, Morning (6AM-12PM), Afternoon (12PM-6PM), Evening (6PM-12AM)
          */}
          <select
            value={flightTime}
            onChange={(e) => setFlightTime(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400"
          >
            <option value="any">Any Time</option>
            <option value="morning">Morning (6 AM - 12 PM)</option>
            <option value="afternoon">Afternoon (12 PM - 6 PM)</option>
            <option value="evening">Evening (6 PM - 12 AM)</option>
          </select>
        </div>
      </div>

      {/* ============================================ */}
      {/* AIRLINE AND FLIGHT CLASS SECTION */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        
        {/* PREFERRED AIRLINE DROPDOWN */}
        <div>
          <label className="block text-indigo-700 font-semibold mb-2">Preferred Airline</label>
          {/* 
            Dropdown populated from airlines array
            Allows user to specify airline preference or choose "Any"
          */}
          <select
            value={airline}
            onChange={(e) => setAirline(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400"
          >
            {airlines.map((airline) => (
              <option key={airline} value={airline.toLowerCase().replace(' ', '_')}>
                {airline}
              </option>
            ))}
          </select>
        </div>

        {/* FLIGHT CLASS DROPDOWN */}
        <div>
          <label className="block text-indigo-700 font-semibold mb-2">Flight Class</label>
          {/* 
            Dropdown for seat class selection
            Affects price multiplier (economy=1x, first=4x)
          */}
          <select
            value={flightClass}
            onChange={(e) => setFlightClass(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400"
          >
            <option value="economy">Economy</option>
            <option value="premium_economy">Premium Economy</option>
            <option value="business">Business</option>
            <option value="first">First Class</option>
          </select>
        </div>
      </div>

      {/* ============================================ */}
      {/* HOTEL RATING AND TRAVELERS SECTION */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        
        {/* HOTEL STAR RATING DROPDOWN */}
        <div>
          {/* Label with star icon OUTSIDE */}
          <label className="flex items-center gap-2 text-indigo-700 font-semibold mb-2">
            <FaStar className="text-yellow-500" />
            <span>Hotel Star Rating</span>
          </label>
          
          {/* 
            Dropdown for hotel quality selection
            Affects price calculation (3=1x, 5=1.67x)
          */}
          <select
            value={hotelStars}
            onChange={(e) => setHotelStars(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400"
          >
            <option value="3">3 Stars</option>
            <option value="4">4 Stars</option>
            <option value="5">5 Stars</option>
          </select>
        </div>

        {/* NUMBER OF TRAVELERS INPUT */}
        <div>
          {/* Label with users icon OUTSIDE */}
          <label className="flex items-center gap-2 text-indigo-700 font-semibold mb-2">
            <FaUsers className="text-indigo-500" />
            <span>Number of Travelers</span>
          </label>
          
          {/* 
            Number input for traveler count
            - min="1": HTML5 validation for minimum value
            - Affects total price calculation
          */}
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
          />
          
          {/* Error message */}
          {errors.persons && (
            <p className="text-red-500 text-sm mt-1">{errors.persons}</p>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* AMENITIES AND ADD-ONS SECTION */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        
        {/* HOTEL AMENITIES SECTION */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-indigo-800 mb-3">Hotel Amenities</h3>
          
          {/* POOL CHECKBOX */}
          {/* 
            Optional pool amenity
            Cost: $20 one-time fee (not per person or per night)
          */}
          <div className="flex items-center gap-2">
            <FaSwimmingPool className="text-blue-400" />
            <label className="text-indigo-700 font-semibold">Pool ($20)</label>
            <input
              type="checkbox"
              checked={pool}
              onChange={(e) => setPool(e.target.checked)}
              className="ml-2 h-5 w-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          
          {/* WIFI CHECKBOX */}
          {/* 
            Optional WiFi amenity
            Cost: $10 one-time fee
          */}
          <div className="flex items-center gap-2">
            <FaWifi className="text-blue-400" />
            <label className="text-indigo-700 font-semibold">Wi-Fi ($10)</label>
            <input
              type="checkbox"
              checked={wifi}
              onChange={(e) => setWifi(e.target.checked)}
              className="ml-2 h-5 w-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        {/* ADD-ONS SECTION */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-indigo-800 mb-3">Add-ons</h3>
          
          {/* INSURANCE DROPDOWN */}
          {/* 
            Travel insurance selection
            *** PRICING: PER PERSON ***
            - Basic: $30 per person
            - Premium: $50 per person
            - Elite: $75 per person
          */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FaShieldAlt className="text-green-500" />
              <label className="text-indigo-700 font-semibold">Insurance Option (Per Person):</label>
            </div>
            
            {/* Show total insurance cost for multiple travelers */}
            {persons > 1 && insurance !== 'none' && (
              <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-3 rounded">
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
            
            {/* Link to learn more about insurance plans */}
            <p className="mt-2 text-sm text-indigo-600">
              <Link to="/travelinsurance" className="hover:underline">
                Learn more about our insurance plans
              </Link>
            </p>
          </div>
          
          {/* CAR RENTAL CHECKBOX */}
          {/* 
            Optional car rental
            Cost: $30 per night
          */}
          <div className="flex items-center gap-2">
            <FaCar className="text-red-500" />
            <label className="text-indigo-700 font-semibold">Car Rental ($30/night)</label>
            <input
              type="checkbox"
              checked={carRental}
              onChange={(e) => setCarRental(e.target.checked)}
              className="ml-2 h-5 w-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>
      </div>
    </FormWrapper>
  );
};

// ============================================
// EXPORT COMPONENT
// ============================================
/**
 * Export as default for importing in other files
 * Usage: import FlightAndHotelForm from './FlightAndHotelForm';
 */
export default FlightAndHotelForm;
