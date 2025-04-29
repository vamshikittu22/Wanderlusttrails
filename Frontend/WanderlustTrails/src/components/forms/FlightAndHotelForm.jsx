// FlightAndHotelForm.jsx
import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import airportData from '../airports.json';
import FormWrapper from './FormWrapper';
import { FaPlaneDeparture, FaPlaneArrival, FaUsers, FaStar, FaCar, FaShieldAlt, FaSwimmingPool, FaWifi } from 'react-icons/fa';

const FlightAndHotelForm = ({ initialData = {}, isEditMode = false, onSubmit, onCancel }) => {
  const [from, setFrom] = useState(initialData.from || '');
  const [to, setTo] = useState(initialData.to || '');
  const [startDate, setStartDate] = useState(initialData.startDate ? new Date(initialData.startDate) : null);
  const [endDate, setEndDate] = useState(initialData.endDate ? new Date(initialData.endDate) : null);
  const [roundTrip, setRoundTrip] = useState(initialData.roundTrip !== undefined ? initialData.roundTrip : true);
  const [persons, setPersons] = useState(initialData.persons || 1);
  const [flightClass, setFlightClass] = useState(initialData.flightClass || 'economy');
  const [hotelStars, setHotelStars] = useState(initialData.hotelStars || '3');
  const [airline, setAirline] = useState(initialData.airline || 'any');
  const [flightTime, setFlightTime] = useState(initialData.flightTime || 'any');
  const [insurance, setInsurance] = useState(initialData.insurance || false);
  const [carRental, setCarRental] = useState(initialData.carRental || false);
  const [pool, setPool] = useState(initialData.amenities?.pool || false);
  const [wifi, setWifi] = useState(initialData.amenities?.wifi || false);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [totalPrice, setTotalPrice] = useState(initialData.totalPrice || 0);

  const cityData = airportData
    .filter(airport => ['large_airport', 'medium_airport'].includes(airport.type) && airport.iata_code)
    .map(airport => ({
      name: `${airport.municipality}, ${airport.iso_country} (${airport.iata_code})`,
      lat: parseFloat(airport.latitude_deg),
      lon: parseFloat(airport.longitude_deg),
    }));

  const airlines = [
    'Any Airline', 'Delta', 'American Airlines', 'United', 'British Airways',
    'Emirates', 'Qantas', 'Air France', 'Japan Airlines', 'Lufthansa',
  ];

  const distance = () => {
    const fromCity = cityData.find(city => city.name === from);
    const toCity = cityData.find(city => city.name === to);
    if (fromCity && toCity) {
      const R = 3958.8;
      const dLat = (toCity.lat - fromCity.lat) * Math.PI / 180;
      const dLon = (toCity.lon - fromCity.lon) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(fromCity.lat * Math.PI / 180) * Math.cos(toCity.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }
    return 0;
  };

  const flightDuration = () => {
    const dist = distance();
    if (dist) {
      const avgSpeed = 550;
      const hours = dist / avgSpeed;
      const minutes = Math.round(hours * 60);
      const durationHours = Math.floor(minutes / 60);
      const durationMinutes = minutes % 60;
      return `${durationHours}h ${durationMinutes}m`;
    }
    return 'N/A';
  };

  const calculateTotalPrice = () => {
    const basePrice = 100;
    const dist = distance();
    const distanceCost = dist * 0.10;
    const classMultipliers = { economy: 1, premium_economy: 1.5, business: 2.5, first: 4 };
    const nights = roundTrip && startDate && endDate
      ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
      : 1;
    let price = (basePrice + distanceCost) * persons * nights * classMultipliers[flightClass] * (parseInt(hotelStars) / 3);
    if (insurance) price += 50;
    if (carRental) price += 30 * nights;
    if (pool) price += 20;
    if (wifi) price += 10;
    return price > 0 ? price.toFixed(2) : '0.00';
  };

  // Recalculate total price whenever dependencies change
  useEffect(() => {
    const price = calculateTotalPrice();
    setTotalPrice(price);
  }, [from, to, startDate, endDate, roundTrip, persons, flightClass, hotelStars, insurance, carRental, pool, wifi]);

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
    amenities: `${pool ? 'Pool ' : ''}${wifi ? 'Wi-Fi' : ''}`,
    addOns: `${insurance ? 'Insurance ' : ''}${carRental ? 'Car Rental' : ''}`,
    totalPrice: totalPrice,
  };

  const handleSubmit = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      alert('Please fix the errors in the form.');
      return;
    }
    const formData = {
      from,
      to,
      startDate,
      endDate,
      roundTrip,
      airline,
      persons,
      flightClass,
      hotelStars,
      flightTime,
      insurance,
      carRental,
      amenities: { pool, wifi },
      totalPrice,
    };
    onSubmit(formData);
  };

  const handleFromChange = (e) => {
    const value = e.target.value;
    setFrom(value);
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

  const handleToChange = (e) => {
    const value = e.target.value;
    setTo(value);
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

  return (
    <FormWrapper
      onSubmit={handleSubmit}
      onCancel={onCancel}
      summary={summary}
      isEditMode={isEditMode}
      bookingType="flight_hotel"
    >
      <h2 className="text-3xl font-bold text-indigo-800 mb-4 text-center">
        {isEditMode ? 'Edit Your Flight & Hotel' : 'Book Flight & Hotel'}
      </h2>
      <div className="flex items-center bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
        <span className="text-2xl mr-3">📅</span>
        <p className="text-blue-700 text-sm">
          <strong>Note:</strong> Your trip must start tomorrow or later, and for round-trips, the end date must be after the start date.
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <label className="text-indigo-700 font-semibold">Round-Trip</label>
        <input
          type="checkbox"
          checked={roundTrip}
          onChange={(e) => setRoundTrip(e.target.checked)}
          className="h-5 w-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-indigo-700 font-semibold mb-2">From</label>
          <div className="relative">
            <input
              type="text"
              value={from}
              onChange={handleFromChange}
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400"
              placeholder="Departure City (e.g., London, UK (LHR))"
            />
            <FaPlaneDeparture className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {showFromSuggestions && fromSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-md">
              {fromSuggestions.map((suggestion) => (
                <li
                  key={suggestion.name}
                  onClick={() => {
                    setFrom(suggestion.name);
                    setShowFromSuggestions(false);
                  }}
                  className="p-2 text-gray-700 hover:bg-indigo-600 hover:text-white cursor-pointer"
                >
                  {suggestion.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative">
          <label className="block text-indigo-700 font-semibold mb-2">To</label>
          <div className="relative">
            <input
              type="text"
              value={to}
              onChange={handleToChange}
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400"
              placeholder="Destination City (e.g., New York, USA (JFK))"
            />
            <FaPlaneArrival className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {showToSuggestions && toSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-md">
              {toSuggestions.map((suggestion) => (
                <li
                  key={suggestion.name}
                  onClick={() => {
                    setTo(suggestion.name);
                    setShowToSuggestions(false);
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-indigo-700 font-semibold mb-2">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              minDate={new Date()}
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400"
              dateFormat="yyyy-MM-dd"
              placeholderText="Select start date"
            />
          </div>
          <div>
            <label className="block text-indigo-700 font-semibold mb-2">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              minDate={startDate || new Date()}
              disabled={!roundTrip}
              className={`w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400 ${!roundTrip ? 'opacity-50 cursor-not-allowed' : ''}`}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select end date"
            />
          </div>
        </div>

        <div>
          <label className="block text-indigo-700 font-semibold mb-2">Preferred Flight Time</label>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-indigo-700 font-semibold mb-2">Preferred Airline</label>
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

        <div>
          <label className="block text-indigo-700 font-semibold mb-2">Flight Class</label>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-indigo-700 font-semibold mb-2">Hotel Star Rating</label>
          <div className="relative">
            <select
              value={hotelStars}
              onChange={(e) => setHotelStars(e.target.value)}
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400"
            >
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>
            <FaStar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="relative">
          <label className="block text-indigo-700 font-semibold mb-2">Number of Travelers</label>
          <div className="relative">
            <input
              type="number"
              value={persons}
              onChange={(e) => setPersons(Number(e.target.value))}
              min="1"
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400"
            />
            <FaUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-indigo-800 mb-3">Hotel Amenities</h3>
          <div className="flex items-center">
            <FaSwimmingPool className="text-gray-400 mr-2" />
            <label className="text-indigo-700 font-semibold">Pool ($20)</label>
            <input
              type="checkbox"
              checked={pool}
              onChange={(e) => setPool(e.target.checked)}
              className="ml-2 h-5 w-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="flex items-center">
            <FaWifi className="text-gray-400 mr-2" />
            <label className="text-indigo-700 font-semibold">Wi-Fi ($10)</label>
            <input
              type="checkbox"
              checked={wifi}
              onChange={(e) => setWifi(e.target.checked)}
              className="ml-2 h-5 w-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-indigo-800 mb-3">Add-ons</h3>
          <div className="flex items-center">
            <FaShieldAlt className="text-gray-400 mr-2" />
            <label className="text-indigo-700 font-semibold">Travel Insurance ($50)</label>
            <input
              type="checkbox"
              checked={insurance}
              onChange={(e) => setInsurance(e.target.checked)}
              className="ml-2 h-5 w-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="flex items-center">
            <FaCar className="text-gray-400 mr-2" />
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

export default FlightAndHotelForm;