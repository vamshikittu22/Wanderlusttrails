//path: Frontend/WanderlustTrails/src/components/forms/FlightAndHotelForm.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPlaneDeparture, FaHotel, FaUsers, FaStar, FaCar, FaShieldAlt, FaSwimmingPool, FaWifi, FaPlaneArrival } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import airportData from '../airports.json';

function FlightAndHotelForm({ initialData = {}, isEditMode = false, onSubmit, onCancel, fullWidth = false, relativePosition = false, onChange }) {
  console.log('FlightAndHotelForm: isEditMode =', isEditMode);

  const [formData, setFormData] = useState({
    from: '',
    to: '',
    startDate: null,
    endDate: null,
    airline: 'any',
    persons: 1,
    flightClass: 'economy',
    hotelStars: '3',
    roundTrip: true,
    insurance: false,
    carRental: false,
    flightTime: 'any',
    amenities: { pool: false, wifi: false },
    pending_changes: initialData.pending_changes || null,
  });

  const [errors, setErrors] = useState({});
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [flightDuration, setFlightDuration] = useState(null);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const airlines = [
    'Any Airline', 'Delta', 'American Airlines', 'United', 'British Airways',
    'Emirates', 'Qantas', 'Air France', 'Japan Airlines', 'Lufthansa'
  ];

  const cityData = airportData
    .filter(airport => ['large_airport', 'medium_airport'].includes(airport.type) && airport.iata_code)
    .map(airport => ({
      name: `${airport.municipality}, ${airport.iso_country} (${airport.iata_code})`,
      lat: parseFloat(airport.latitude_deg),
      lon: parseFloat(airport.longitude_deg),
    }));

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3958.8; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    const preloadedData = {
      from: initialData.from || initialData.flight_details?.from || '',
      to: initialData.to || initialData.flight_details?.to || '',
      startDate: initialData.startDate || (initialData.start_date ? new Date(initialData.start_date) : null),
      endDate: initialData.endDate || (initialData.end_date ? new Date(initialData.end_date) : null),
      airline: initialData.airline || initialData.flight_details?.airline || 'any',
      persons: initialData.persons || 1,
      flightClass: initialData.flightClass || initialData.flight_details?.flightClass || 'economy',
      hotelStars: initialData.hotelStars || initialData.hotel_details?.hotelStars || '3',
      roundTrip: initialData.roundTrip !== undefined ? initialData.roundTrip : true,
      insurance: initialData.insurance !== undefined ? initialData.insurance : false,
      carRental: initialData.carRental !== undefined ? initialData.carRental : false,
      flightTime: initialData.flightTime || initialData.flight_details?.flightTime || 'any',
      amenities: {
        pool: initialData.amenities?.pool !== undefined ? initialData.amenities.pool : false,
        wifi: initialData.amenities?.wifi !== undefined ? initialData.amenities.wifi : false,
      },
      totalPrice: initialData.totalPrice || 0,
      pending_changes: initialData.pending_changes || null,
    };
    setFormData(prev => ({ ...prev, ...preloadedData }));

    const calculateFlightDetails = () => {
      const fromCity = cityData.find(city => city.name === preloadedData.from);
      const toCity = cityData.find(city => city.name === preloadedData.to);

      if (fromCity && toCity) {
        const distance = calculateDistance(fromCity.lat, fromCity.lon, toCity.lat, toCity.lon);
        console.log('fromCity:',fromCity, fromCity.lat, fromCity.lon, 'toCity:', toCity, toCity.lat, toCity.lon, 'distance:', distance);
        const avgSpeed = 550; // mph
        const hours = distance / avgSpeed;
        const minutes = Math.round(hours * 60);
        const durationHours = Math.floor(minutes / 60);
        const durationMinutes = minutes % 60;
        setFlightDuration(`${durationHours}h ${durationMinutes}m`);
      } else {
        setFlightDuration(null);
      }

      const basePrice = 100;
      const classMultipliers = { economy: 1, premium_economy: 1.5, business: 2.5, first: 4 };
      const nights = preloadedData.roundTrip && preloadedData.startDate && preloadedData.endDate
        ? Math.ceil((preloadedData.endDate - preloadedData.startDate) / (1000 * 60 * 60 * 24))
        : 1;
      let price = basePrice * preloadedData.persons * nights * classMultipliers[preloadedData.flightClass] * (parseInt(preloadedData.hotelStars) / 3);
      if (preloadedData.insurance) price += 50;
      if (preloadedData.carRental) price += 30 * nights;
      if (preloadedData.amenities.pool) price += 20;
      if (preloadedData.amenities.wifi) price += 10;
      setEstimatedPrice(price > 0 ? price : 0);
    };
    calculateFlightDetails();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'roundTrip' && !checked ? { endDate: null } : {})
    }));
    if (errors[name]) setErrors({ ...errors, [name]: '' });

    if (!isEditMode && (name === 'from' || name === 'to')) {
      if (value && typeof value === 'string' && value.trim().length > 0) {
        const filtered = cityData.filter(city =>
          city.name.toLowerCase().includes(value.toLowerCase())
        );
        if (name === 'from') {
          setFromSuggestions(filtered);
          setShowFromSuggestions(true);
        } else {
          setToSuggestions(filtered);
          setShowToSuggestions(true);
        }
      } else {
        if (name === 'from') {
          setFromSuggestions([]);
          setShowFromSuggestions(false);
        } else {
          setToSuggestions([]);
          setShowToSuggestions(false);
        }
      }
    }

    if (onChange) {
      onChange(formData);
    }
  };

  const handleAmenityChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      amenities: { ...prev.amenities, [name]: checked }
    }));
  };

  const handleDateChange = (date, name) => {
    setFormData(prev => ({ ...prev, [name]: date }));
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSuggestionClick = (name, suggestion) => {
    setFormData(prev => ({ ...prev, [name]: suggestion.name }));
    if (name === 'from') setShowFromSuggestions(false);
    else setShowToSuggestions(false);
    setErrors({ ...errors, [name]: '' });
  };

  const resetForm = () => {
    setFormData({
      from: '',
      to: '',
      startDate: null,
      endDate: null,
      airline: 'any',
      persons: 1,
      flightClass: 'economy',
      hotelStars: '3',
      roundTrip: true,
      insurance: false,
      carRental: false,
      flightTime: 'any',
      amenities: { pool: false, wifi: false },
      pending_changes: null,
    });
    setErrors({});
    setEstimatedPrice(0);
    setFlightDuration(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.from) newErrors.from = 'Departure city is required';
    if (!formData.to) newErrors.to = 'Destination city is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (formData.roundTrip && !formData.endDate) {
      newErrors.endDate = 'End date is required for round-trip';
    }
    if (formData.roundTrip && formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate.setHours(0, 0, 0, 0));
      const end = new Date(formData.endDate.setHours(0, 0, 0, 0));
      if (start >= end) {
        newErrors.endDate = 'End date must be after start date for round-trip';
      }
    }
    if (formData.persons < 1) newErrors.persons = 'Persons must be at least 1';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form.');
      return;
    }
    onSubmit({ ...formData, totalPrice: estimatedPrice });
  };

  const formBgClass = isEditMode ? 'bg-gray-500' : 'bg-gray-800';
  const textClass = 'text-gray-200';
  const inputBgClass = 'bg-orange-50';
  const inputTextClass = 'text-gray-800';
  const borderClass = 'border-red-900';
  const summaryBgClass = isEditMode ? 'bg-gray-100' : 'bg-gray-700';
  const summaryTextClass = isEditMode ? 'text-gray-800' : 'text-gray-200';
  const errorTextClass = 'text-red-400';
  const iconClass = 'text-gray-400';
  const headingClass = 'text-orange-700';

  return (
    <form onSubmit={handleSubmit} className={`w-full shadow-lg rounded-xl p-6 space-y-6 py-4 ${formBgClass}`}>
      <div className="flex items-center justify-between">
        <label className={`${textClass} font-medium`}>Round-Trip</label>
        <input
          type="checkbox"
          name="roundTrip"
          checked={formData.roundTrip}
          onChange={handleChange}
          className={`h-5 w-5 text-indigo-600 ${inputBgClass} ${borderClass} rounded focus:ring-indigo-500`}
        />
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${relativePosition ? 'relative' : ''}`}>
        <div className="relative">
          <label className={`block ${textClass} font-medium mb-1`}>From</label>
          <input
            type="text"
            name="from"
            value={formData.from}
            onChange={handleChange}
            className={`w-full pl-10 p-3 ${inputBgClass} ${inputTextClass} border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            placeholder="Departure City (e.g., London, UK (LHR))"
          />
          <FaPlaneDeparture className={`absolute right-5 top-10 ${iconClass}`} />
          {!isEditMode && showFromSuggestions && fromSuggestions.length > 0 && (
            <ul className={`absolute z-10 w-full ${inputBgClass} border ${borderClass} rounded-lg mt-1 max-h-40 overflow-y-auto`}>
              {fromSuggestions.map((suggestion) => (
                <li
                  key={suggestion.name}
                  onClick={() => handleSuggestionClick('from', suggestion)}
                  className={`p-2 ${inputTextClass} hover:bg-indigo-600 hover:text-white cursor-pointer`}
                >
                  {suggestion.name}
                </li>
              ))}
            </ul>
          )}
          {errors.from && <p className={`${errorTextClass} text-sm mt-1`}>{errors.from}</p>}
        </div>

        <div className="relative">
          <label className={`block ${textClass} font-medium mb-1`}>To</label>
          <input
            type="text"
            name="to"
            value={formData.to}
            onChange={handleChange}
            className={`w-full pl-10 p-3 ${inputBgClass} ${inputTextClass} border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            placeholder="Destination City (e.g., New York, USA (JFK))"
          />
          <FaPlaneArrival className={`absolute right-5 top-10 ${iconClass}`} />
          {!isEditMode && showToSuggestions && toSuggestions.length > 0 && (
            <ul className={`absolute z-10 w-full ${inputBgClass} border ${borderClass} rounded-lg mt-1 max-h-40 overflow-y-auto`}>
              {toSuggestions.map((suggestion) => (
                <li
                  key={suggestion.name}
                  onClick={() => handleSuggestionClick('to', suggestion)}
                  className={`p-2 ${inputTextClass} hover:bg-indigo-600 hover:text-white cursor-pointer`}
                >
                  {suggestion.name}
                </li>
              ))}
            </ul>
          )}
          {errors.to && <p className={`${errorTextClass} text-sm mt-1`}>{errors.to}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <label className={`block ${textClass} font-medium mb-1`}>Start Date</label>
            <DatePicker
              selected={formData.startDate}
              onChange={(date) => handleDateChange(date, 'startDate')}
              minDate={new Date()}
              className={`w-full p-3 ${inputBgClass} ${inputTextClass} border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select start date"
            />
            {errors.startDate && <p className={`${errorTextClass} text-sm mt-1`}>{errors.startDate}</p>}
          </div>
          <div className="relative">
            <label className={`block ${textClass} font-medium mb-1`}>End Date</label>
            <DatePicker
              selected={formData.endDate}
              onChange={(date) => handleDateChange(date, 'endDate')}
              minDate={formData.startDate || new Date()}
              disabled={!formData.roundTrip}
              className={`w-full p-3 ${inputBgClass} ${inputTextClass} border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${!formData.roundTrip ? 'opacity-50 cursor-not-allowed' : ''}`}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select end date"
            />
            {errors.endDate && <p className={`${errorTextClass} text-sm mt-1`}>{errors.endDate}</p>}
          </div>
        </div>

        <div>
          <div>
            <label className={`block ${textClass} font-medium mb-1`}>Preferred Flight Time</label>
            <select
              name="flightTime"
              value={formData.flightTime}
              onChange={handleChange}
              className={`w-full p-3 ${inputBgClass} ${inputTextClass} border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              <option value="any">Any Time</option>
              <option value="morning">Morning (6 AM - 12 PM)</option>
              <option value="afternoon">Afternoon (12 PM - 6 PM)</option>
              <option value="evening">Evening (6 PM - 12 AM)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <label className={`block ${textClass} font-medium mb-1`}>Preferred Airline</label>
          <select
            name="airline"
            value={formData.airline}
            onChange={handleChange}
            className={`w-full p-3 ${inputBgClass} ${inputTextClass} border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          >
            {airlines.map(airline => (
              <option key={airline} value={airline.toLowerCase().replace(' ', '_')}>
                {airline}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <label className={`block ${textClass} font-medium mb-1`}>Flight Class</label>
          <select
            name="flightClass"
            value={formData.flightClass}
            onChange={handleChange}
            className={`w-full p-3 ${inputBgClass} ${inputTextClass} border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
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
          <label className={`block ${textClass} font-medium mb-1`}>Hotel Star Rating</label>
          <FaStar className={`absolute right-5 top-10 ${iconClass}`} />
          <select
            name="hotelStars"
            value={formData.hotelStars}
            onChange={handleChange}
            className={`w-full pl-10 p-3 ${inputBgClass} ${inputTextClass} border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          >
            <option value="3">3 Stars</option>
            <option value="4">4 Stars</option>
            <option value="5">5 Stars</option>
          </select>
        </div>

        <div className="relative">
          <label className={`block ${textClass} font-medium mb-1`}>Persons</label>
          <input
            type="number"
            name="persons"
            value={formData.persons}
            onChange={handleChange}
            min="1"
            className={`w-full pl-10 p-3 ${inputBgClass} ${inputTextClass} border ${borderClass} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
          <FaUsers className={`absolute right-5 top-10 ${iconClass}`} />
          {errors.persons && <p className={`${errorTextClass} text-sm mt-1`}>{errors.persons}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-4">
          <h3 className={`text-lg font-medium ${headingClass}`}>Hotel Amenities</h3>
          <div className="flex items-center">
            <FaSwimmingPool className={`${iconClass} mr-2`} />
            <label className={`${textClass} font-medium`}>Pool ($20)</label>
            <input
              type="checkbox"
              name="pool"
              checked={formData.amenities.pool}
              onChange={handleAmenityChange}
              className={`ml-2 h-5 w-5 text-indigo-600 ${inputBgClass} ${borderClass} rounded focus:ring-indigo-500`}
            />
          </div>
          <div className="flex items-center">
            <FaWifi className={`${iconClass} mr-2`} />
            <label className={`${textClass} font-medium`}>Wi-Fi ($10)</label>
            <input
              type="checkbox"
              name="wifi"
              checked={formData.amenities.wifi}
              onChange={handleAmenityChange}
              className={`ml-2 h-5 w-5 text-indigo-600 ${inputBgClass} ${borderClass} rounded focus:ring-indigo-500`}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className={`text-lg font-medium ${headingClass}`}>Add-ons</h3>
          <div className="flex items-center">
            <FaShieldAlt className={`${iconClass} mr-2`} />
            <label className={`${textClass} font-medium`}>Travel Insurance ($50)</label>
            <input
              type="checkbox"
              name="insurance"
              checked={formData.insurance}
              onChange={handleChange}
              className={`ml-2 h-5 w-5 text-indigo-600 ${inputBgClass} ${borderClass} rounded focus:ring-indigo-500`}
            />
          </div>
          <div className="flex items-center">
            <FaCar className={`${iconClass} mr-2`} />
            <label className={`${textClass} font-medium`}>Car Rental ($30/night)</label>
            <input
              type="checkbox"
              name="carRental"
              checked={formData.carRental}
              onChange={handleChange}
              className={`ml-2 h-5 w-5 text-indigo-600 ${inputBgClass} ${borderClass} rounded focus:ring-indigo-500`}
            />
          </div>
        </div>
      </div>

      <div className={`${summaryBgClass} p-4 rounded-lg`}>
        <h3 className={`text-lg font-semibold ${headingClass} mb-2`}>Booking Summary</h3>
        <p className={`${summaryTextClass}`}><strong>From:</strong> {formData.from || 'N/A'}</p>
        <p className={`${summaryTextClass}`}><strong>To:</strong> {formData.to || 'N/A'}</p>
        <p className={`${summaryTextClass}`}>
          <strong>Dates:</strong> {formData.startDate?.toLocaleDateString() || 'N/A'}
          {formData.roundTrip && formData.endDate ? ` to ${formData.endDate.toLocaleDateString()}` : ' (One-way)'}
        </p>
        <p className={`${summaryTextClass}`}><strong>Flight Duration:</strong> {flightDuration || 'N/A'}</p>
        <p className={`${summaryTextClass}`}><strong>Airline:</strong> {formData.airline === 'any' ? 'Any Airline' : formData.airline.replace('_', ' ')}</p>
        <p className={`${summaryTextClass}`}><strong>Persons:</strong> {formData.persons}</p>
        <p className={`${summaryTextClass}`}><strong>Flight Class:</strong> {formData.flightClass}</p>
        <p className={`${summaryTextClass}`}><strong>Flight Time:</strong> {formData.flightTime}</p>
        <p className={`${summaryTextClass}`}><strong>Hotel Stars:</strong> {formData.hotelStars}</p>
        <p className={`${summaryTextClass}`}><strong>Amenities:</strong> {formData.amenities.pool ? 'Pool ' : ''}{formData.amenities.wifi ? 'Wi-Fi' : ''}</p>
        <p className={`${summaryTextClass}`}><strong>Add-ons:</strong> {formData.insurance ? 'Insurance ' : ''}{formData.carRental ? 'Car Rental' : ''}</p>
        <p className={`${summaryTextClass} mt-2`}><strong>Estimated Price:</strong> <span className={`font-bold ${headingClass}`}>${estimatedPrice.toFixed(2)}</span></p>
        {formData.pending_changes && (
          <div className="mt-2">
            <p className={`${summaryTextClass}`}><strong>Pending Changes:</strong></p>
            <ul className={`list-disc pl-5 ${summaryTextClass}`}>
              {Object.entries(formData.pending_changes).map(([key, value]) => (
                <li key={key}>{`${key}: ${JSON.stringify(value)}`}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-gray-200 font-medium py-3 rounded-lg transition-colors duration-200"
        >
          {isEditMode ? 'Save Changes' : 'Book Now'}
        </button>
        {isEditMode ? (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-gray-200 font-medium py-3 rounded-lg transition-colors duration-200"
          >
            Cancel Edit
          </button>
        ) : (
          <button
            type="button"
            onClick={resetForm}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium py-3 rounded-lg transition-colors duration-200"
          >
            Reset Form
          </button>
        )}
      </div>
    </form>
  );
}

export default FlightAndHotelForm;