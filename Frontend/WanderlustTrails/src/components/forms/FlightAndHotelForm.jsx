// Path: Frontend/WanderlustTrails/src/components/forms/FlightAndHotelForm.jsx

import React, { useState, useEffect } from 'react';
import FormWrapper from './FormWrapper';
import AirportSearchInput from './AirportSearchInput';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormDatePicker from './FormDatePicker'; // ✅ ADD THIS IMPORT
import { 
  FaPlaneDeparture, FaPlaneArrival, FaUsers, FaStar, FaCar, 
  FaShieldAlt, FaSwimmingPool, FaWifi, FaCalendarAlt, 
  FaClock, FaPlane, FaChair
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import useAirportSearch from '../../hooks/useAirportSearch';

const FlightAndHotelForm = ({ initialData = {}, isEditMode = false, onSubmit, onCancel }) => {
  
  // STATE
   // ✅ Debug: Log what data we're receiving
  useEffect(() => {
    console.log('📋 FlightAndHotelForm mounted');
    console.log('📋 isEditMode:', isEditMode);
    console.log('📋 initialData received:', initialData);
  }, []);

  // ✅ STATE - FIXED to properly handle edit mode
  const [fromICAO, setFromICAO] = useState(() => {
    return initialData.flight_details?.from || initialData.from || '';
  });
  
  const [toICAO, setToICAO] = useState(() => {
    return initialData.flight_details?.to || initialData.to || '';
  });
  
  // ✅ FIX 1: Load airports from initialData when editing
  const [fromAirport, setFromAirport] = useState(() => {
    return initialData.flight_details?.fromAirport || null;
  });
  
  const [toAirport, setToAirport] = useState(() => {
    return initialData.flight_details?.toAirport || null;
  });
  
  // ✅ FIX 2: Properly load dates from initialData
  const [startDate, setStartDate] = useState(() => {
    const dateStr = initialData.start_date || initialData.startDate;
    if (!dateStr) return null;
    const date = new Date(dateStr);
    console.log('📅 Start date loaded:', date);
    return date;
  });
  
  const [endDate, setEndDate] = useState(() => {
    const dateStr = initialData.end_date || initialData.endDate;
    if (!dateStr) return null;
    const date = new Date(dateStr);
    console.log('📅 End date loaded:', date);
    return date;
  });
  
  const [roundTrip, setRoundTrip] = useState(() => {
    if (initialData.roundTrip !== undefined) return initialData.roundTrip;
    if (initialData.flight_details?.roundTrip !== undefined) return initialData.flight_details.roundTrip;
    return true;
  });
  
  const [persons, setPersons] = useState(initialData.persons || 1);
  
  const [flightClass, setFlightClass] = useState(() => {
    return initialData.flight_details?.flightClass || initialData.flightClass || 'economy';
  });
  
  const [hotelStars, setHotelStars] = useState(() => {
    return initialData.hotel_details?.hotelStars || initialData.hotelStars || '3';
  });
  
  const [airline, setAirline] = useState(() => {
    return initialData.flight_details?.airline || initialData.airline || 'any';
  });
  
  const [flightTime, setFlightTime] = useState(() => {
    return initialData.flight_details?.flightTime || initialData.flightTime || 'any';
  });
  
  const [insurance, setInsurance] = useState(initialData.insurance || 'none');
  
  const [carRental, setCarRental] = useState(() => {
    return initialData.hotel_details?.car_rental || initialData.carRental || false;
  });
  
  const [pool, setPool] = useState(() => {
    return initialData.hotel_details?.amenities?.pool || initialData.amenities?.pool || false;
  });
  
  const [wifi, setWifi] = useState(() => {
    return initialData.hotel_details?.amenities?.wifi || initialData.amenities?.wifi || false;
  });
  
  const [totalPrice, setTotalPrice] = useState(() => {
    return initialData.total_price || initialData.totalPrice || 0;
  });
  
  const [errors, setErrors] = useState({});

  // HOOKS
  const { 
    searchByCode, searchByCity, loading: searchingAirport, 
    error: airportError, databaseReady, loadingDatabase 
  } = useAirportSearch();


  // ✅ AUTO-FETCH airports in edit mode when we have codes but no airport objects
useEffect(() => {
  const fetchAirportsForEdit = async () => {
    if (isEditMode && databaseReady) {
      // Fetch FROM airport if we have code but no airport object
      if (fromICAO && !fromAirport) {
        console.log('🔍 Auto-fetching FROM airport:', fromICAO);
        const result = await searchByCode(fromICAO);
        if (result) {
          console.log('✅ Auto-loaded FROM airport:', result.name);
          setFromAirport(result);
        } else {
          console.log('❌ Could not find FROM airport:', fromICAO);
        }
      }

      // Fetch TO airport if we have code but no airport object
      if (toICAO && !toAirport) {
        console.log('🔍 Auto-fetching TO airport:', toICAO);
        const result = await searchByCode(toICAO);
        if (result) {
          console.log('✅ Auto-loaded TO airport:', result.name);
          setToAirport(result);
        } else {
          console.log('❌ Could not find TO airport:', toICAO);
        }
      }
    }
  };

  fetchAirportsForEdit();
}, [isEditMode, databaseReady, fromICAO, toICAO, fromAirport, toAirport, searchByCode]);

  // HANDLERS
  const handleSelectFromAirport = (airport) => {
    setFromAirport(airport);
    setFromICAO(airport.icao);
    if (errors.from) setErrors({ ...errors, from: undefined });
  };

  const handleSelectToAirport = (airport) => {
    setToAirport(airport);
    setToICAO(airport.icao);
    if (errors.to) setErrors({ ...errors, to: undefined });
  };

  // CALCULATIONS
  const distance = () => {
    if (fromAirport && toAirport) {
      const R = 3958.8;
      const dLat = (toAirport.latitude - fromAirport.latitude) * Math.PI / 180;
      const dLon = (toAirport.longitude - fromAirport.longitude) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(fromAirport.latitude * Math.PI / 180) * Math.cos(toAirport.latitude * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }
    return 0;
  };

  const flightDuration = () => {
    const dist = distance();
    if (dist) {
      const minutes = Math.round((dist / 550) * 60);
      return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
    }
    return 'N/A';
  };

  const calculateTotalPrice = () => {
    const basePrice = 100;
    const dist = distance();
    const distanceCost = dist * 0.10;
    const classMultipliers = { economy: 1, premium_economy: 1.25, business: 1.65, first: 2.2 };
    const nights = roundTrip && startDate && endDate
      ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) : 1;
    
    let price = (basePrice + distanceCost) * persons * nights * classMultipliers[flightClass] * (parseInt(hotelStars) / 3);
    if (carRental) price += 30 * nights;
    if (pool) price += 20;
    if (wifi) price += 10;
    if (insurance === 'basic') price += 30 * persons;
    else if (insurance === 'premium') price += 50 * persons;
    else if (insurance === 'elite') price += 75 * persons;

    return price > 0 ? price.toFixed(2) : '0.00';
  };

  useEffect(() => {
    setTotalPrice(calculateTotalPrice());
  }, [fromAirport, toAirport, startDate, endDate, roundTrip, persons, flightClass, hotelStars, insurance, carRental, pool, wifi]);

  // VALIDATION
  const validateForm = () => {
    const errors = {};
    if (!fromAirport) {
      errors.from = 'Please select departure airport';
      console.log('❌ No departure airport');
    }
    if (!toAirport) {
      errors.to = 'Please select arrival airport';
      console.log('❌ No arrival airport');
    }
    if (!startDate) {
      errors.startDate = 'Start date required';
      console.log('❌ No start date');
    }
    if (roundTrip && !endDate) {
      errors.endDate = 'End date required';
      console.log('❌ No end date');
    }
    if (roundTrip && startDate && endDate && startDate >= endDate) {
      errors.endDate = 'End date must be after start';
      console.log('❌ Invalid dates');
    }
    if (persons < 1) {
      errors.persons = 'At least 1 traveler required';
      console.log('❌ Invalid persons');
    }
    console.log(Object.keys(errors).length ? '❌ Validation failed' : '✅ Validation passed');
    return errors;
  };

  // SUBMISSION
  const handleSubmit = () => {
    console.log('🚀 Submit:', { fromAirport, toAirport, startDate, endDate });
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      const msgs = Object.values(validationErrors).join(', ');
      toast.error(`Fix: ${msgs}`);
      return;
    }
    onSubmit({
      flight_details: {
        from: fromICAO, to: toICAO, fromAirport, toAirport, roundTrip,
        airline, flightClass, flightTime, duration: flightDuration(),
        distance: distance().toFixed(2) + ' miles',
      },
      hotel_details: { hotelStars, amenities: { pool, wifi }, car_rental: carRental },
      start_date: startDate.toISOString().split('T')[0],
      end_date: roundTrip && endDate ? endDate.toISOString().split('T')[0] : null,
      persons, insurance, total_price: totalPrice,
    });
  };

  // OPTIONS
  const flightClassOptions = [
    { value: 'economy', label: 'Economy' },
    { value: 'premium_economy', label: 'Premium Economy' },
    { value: 'business', label: 'Business' },
    { value: 'first', label: 'First Class' }
  ];

  const flightTimeOptions = [
    { value: 'any', label: 'Any Time' },
    { value: 'morning', label: 'Morning (6 AM - 12 PM)' },
    { value: 'afternoon', label: 'Afternoon (12 PM - 6 PM)' },
    { value: 'evening', label: 'Evening (6 PM - 12 AM)' }
  ];

  const airlineOptions = [
    'Any Airline', 'Delta', 'American Airlines', 'United', 'British Airways',
    'Emirates', 'Qantas', 'Air France', 'Japan Airlines', 'Lufthansa'
  ].map(name => ({ value: name.toLowerCase().replace(' ', '_'), label: name }));

  const hotelStarOptions = [
    { value: '3', label: '3 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '5', label: '5 Stars' }
  ];

  const insuranceOptions = [
    { value: 'none', label: 'No Insurance' },
    { value: 'basic', label: 'Basic ($30/person)' },
    { value: 'premium', label: 'Premium ($50/person)' },
    { value: 'elite', label: 'Elite ($75/person)' }
  ];

  // ✅ Debug loaded state
useEffect(() => {
  if (isEditMode) {
    console.log('✅ Edit mode - Loaded state:');
    console.log('  From Airport:', fromAirport);
    console.log('  To Airport:', toAirport);
    console.log('  Start Date:', startDate);
    console.log('  End Date:', endDate);
    console.log('  Round Trip:', roundTrip);
  }
}, [isEditMode, fromAirport, toAirport, startDate, endDate, roundTrip]);

  // // DEBUG
  // const DebugInfo = () => (
  //   <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs z-50">
  //     <h4 className="font-bold mb-2">🐛 Debug</h4>
  //     <p>From: {fromAirport ? '✅' : '❌'}</p>
  //     <p>To: {toAirport ? '✅' : '❌'}</p>
  //     <p>Start: {startDate ? '✅' : '❌'}</p>
  //     <p>End: {roundTrip ? (endDate ? '✅' : '❌') : 'N/A'}</p>
  //     <p>Errors: {Object.keys(errors).length || '0'}</p>
  //   </div>
  // );

  // RENDER
  return (
    <FormWrapper onSubmit={handleSubmit} onCancel={onCancel} summary={{
      from: fromAirport ? `${fromAirport.name} (${fromAirport.icao})` : 'Not selected',
      to: toAirport ? `${toAirport.name} (${toAirport.icao})` : 'Not selected',
      startDate: startDate?.toLocaleDateString() || 'N/A',
      endDate: roundTrip && endDate ? endDate.toLocaleDateString() : null,
      tripType: roundTrip ? 'Round-Trip' : 'One-Way',
      flightDuration: flightDuration(),
      airline: airline === 'any' ? 'Any Airline' : airline,
      persons, flightClass, flightTime, hotelStars,
      amenities: `${pool ? 'Pool ' : ''}${wifi ? 'Wi-Fi' : ''}` || 'None',
      insurance: insurance === 'none' ? 'No Insurance' : `${insurance} ($${insurance === 'basic' ? 30 : insurance === 'premium' ? 50 : 75} × ${persons})`,
      addOns: carRental ? 'Car Rental' : 'None',
      totalPrice,
    }} isEditMode={isEditMode} bookingType="flight_hotel">
      
      <h2 className="text-3xl font-bold text-indigo-800 mb-4 text-center">
        {isEditMode ? 'Edit Flight & Hotel' : 'Book Flight & Hotel'}
      </h2>

      {loadingDatabase && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-700 mr-3"></div>
            <p className="text-yellow-700"><strong>Loading airports...</strong></p>
          </div>
        </div>
      )}

      {databaseReady && !loadingDatabase && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-lg">
          <p className="text-green-700">✅ <strong>Airport database ready!</strong></p>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <label className="text-indigo-700 font-semibold">Round-Trip</label>
        <input type="checkbox" checked={roundTrip} onChange={(e) => setRoundTrip(e.target.checked)}
          className="h-5 w-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-400" />
      </div>

      {/* AIRPORTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <AirportSearchInput
          label="Departure Airport"
          icon={FaPlaneDeparture}
          value={fromICAO}
          onChange={setFromICAO}
          onSelect={handleSelectFromAirport}
          searchByCity={searchByCity}
          searchByCode={searchByCode}
          selectedAirport={fromAirport}
          placeholder="Type city (Mumbai, Delhi)"
          error={errors.from}
          loading={searchingAirport}
        />
        <AirportSearchInput
          label="Arrival Airport"
          icon={FaPlaneArrival}
          value={toICAO}
          onChange={setToICAO}
          onSelect={handleSelectToAirport}
          searchByCity={searchByCity}
          searchByCode={searchByCode}
          selectedAirport={toAirport}
          placeholder="Type city (Hyderabad)"
          error={errors.to}
          loading={searchingAirport}
        />
      </div>

      {/* ✅ DATES - USING FormDatePicker */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
        <FormDatePicker
          label="End Date"
          icon={FaCalendarAlt}
          value={endDate}
          onChange={(date) => {
            setEndDate(date);
            if (errors.endDate) setErrors({ ...errors, endDate: '' });
          }}
          minDate={startDate || new Date()}
          disabled={!roundTrip}
          error={errors.endDate}
          placeholder="Select end date"
        />
      </div>

      {/* FLIGHT OPTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <FormSelect label="Flight Class" icon={FaChair} value={flightClass} 
          onChange={(e) => setFlightClass(e.target.value)} options={flightClassOptions} />
        <FormSelect label="Preferred Airline" icon={FaPlane} value={airline}
          onChange={(e) => setAirline(e.target.value)} options={airlineOptions} />
      </div>

      {/* FLIGHT TIME & TRAVELERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <FormSelect label="Preferred Flight Time" icon={FaClock} value={flightTime}
          onChange={(e) => setFlightTime(e.target.value)} options={flightTimeOptions} />
        <FormInput
          label="Number of Travelers"
          icon={FaUsers}
          type="number"
          value={persons}
          onChange={(e) => {
            setPersons(Number(e.target.value));
            if (errors.persons) setErrors({ ...errors, persons: '' });
          }}
          min="1"
          error={errors.persons}
        />
      </div>

      {/* HOTEL & INSURANCE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <FormSelect label="Hotel Star Rating" icon={FaStar} value={hotelStars}
          onChange={(e) => setHotelStars(e.target.value)} options={hotelStarOptions} />
        <FormSelect label="Insurance (Per Person)" icon={FaShieldAlt} value={insurance}
          onChange={(e) => setInsurance(e.target.value)} options={insuranceOptions} />
      </div>

      {/* AMENITIES */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-indigo-800 mb-3">Hotel Amenities & Add-ons</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FaSwimmingPool className="text-cyan-600" />
            <label className="text-indigo-700 font-semibold flex-1">Pool ($20)</label>
            <input type="checkbox" checked={pool} onChange={(e) => setPool(e.target.checked)}
              className="h-5 w-5 text-indigo-600 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <FaWifi className="text-pink-700" />
            <label className="text-indigo-700 font-semibold flex-1">Wi-Fi ($10)</label>
            <input type="checkbox" checked={wifi} onChange={(e) => setWifi(e.target.checked)}
              className="h-5 w-5 text-indigo-600 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <FaCar className="text-red-500" />
            <label className="text-indigo-700 font-semibold flex-1">Car Rental ($30/night)</label>
            <input type="checkbox" checked={carRental} onChange={(e) => setCarRental(e.target.checked)}
              className="h-5 w-5 text-indigo-600 rounded" />
          </div>
        </div>
      </div>
      {/* <DebugInfo /> */}
    </FormWrapper>
  );
};

export default FlightAndHotelForm;
