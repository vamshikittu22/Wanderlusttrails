import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';

/**
 * Reusable Airport Search Input Component with Autocomplete and keyboard navigation
 */
const AirportSearchInput = ({
  label,
  icon: Icon,
  value,
  onChange,
  onSelect,
  searchByCity,
  searchByCode,
  selectedAirport,
  placeholder = "Type city name or code",
  error,
  loading
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);

  // Keyboard navigation for dropdown
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      setActiveSuggestion((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions[activeSuggestion]) {
        handleSelectAirport(suggestions[activeSuggestion]);
        setActiveSuggestion(0);
      }
    }
  };

  // Handle input changes and fetch suggestions
  const handleInputChange = async (e) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.length >= 2) {
      const results = await searchByCity(inputValue, 8);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setActiveSuggestion(0); // Reset highlight each time
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setActiveSuggestion(0);
    }
  };

  // Handle selecting an airport from dropdown
  const handleSelectAirport = (airport) => {
    onSelect(airport);
    setShowSuggestions(false);
    toast.success(`✅ Selected: ${airport.name}`);
  };

  // Handle manual search button click
  const handleSearch = async () => {
    if (!value || value.length < 2) {
      toast.error('Please enter at least 2 characters to search');
      return;
    }
    // If it looks like a city name (more than 4 characters), search by city
    if (value.length > 4) {
      const results = await searchByCity(value, 1);
      if (results.length > 0) {
        handleSelectAirport(results[0]);
        return;
      }
    }
    // Otherwise search by code
    const result = await searchByCode(value);
    if (result) {
      onSelect(result);
      toast.success(`✅ Found: ${result.name} (${result.icao})`);
    } else {
      toast.error(`Airport not found: ${value}`);
    }
  };

  return (
    <div className="relative">
      <label className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
        <Icon className="text-blue-500" />
        <span>{label}</span>
      </label>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder={placeholder}
            onKeyDown={handleKeyDown}
            className={`w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-indigo-400 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {/* Autocomplete Dropdown */}
          {/* {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((airport, idx) => (
                <div
                  key={airport.icao}
                  onClick={() => handleSelectAirport(airport)}
                  className={`p-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                    idx === activeSuggestion ? 'bg-blue-100 font-semibold' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{airport.city}, {airport.country}</p>
                      <p className="text-sm text-gray-600">{airport.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono bg-indigo-100 px-2 py-1 rounded">
                        {airport.iata !== 'N/A' ? airport.iata : airport.icao}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{airport.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )} */}
          {showSuggestions && suggestions.length > 0 && (
  <div
    role="listbox"
    aria-label="Airport Suggestions"
    className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
  >
    {suggestions.map((airport, idx) => (
      <div
        key={airport.icao}
        role="option"
        tabIndex={0}
        aria-selected={idx === activeSuggestion}
        data-testid={`airport-option-${airport.icao}`}
        onClick={() => handleSelectAirport(airport)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleSelectAirport(airport);
          }
        }}
        className={`p-3 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
          idx === activeSuggestion ? 'bg-blue-100 font-semibold' : ''
        }`}
        style={{ outline: idx === activeSuggestion ? '2px solid #6366f1' : 'none' }}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-gray-800">{airport.city}, {airport.country}</p>
            <p className="text-sm text-gray-600">{airport.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono bg-indigo-100 px-2 py-1 rounded">
              {airport.iata !== 'N/A' ? airport.iata : airport.icao}
            </p>
            <p className="text-xs text-gray-500 mt-1">{airport.type.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
)}

        </div>
      </div>
      {/* Selected Airport Display */}
      {selectedAirport && (
        <div className="mt-2 p-3 bg-green-50 border border-green-300 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>{selectedAirport.name}</strong> - {selectedAirport.city}, {selectedAirport.country}
          </p>
          <p className="text-xs text-green-600">
            {selectedAirport.iata !== 'N/A' ? `IATA: ${selectedAirport.iata} | ` : ''}
            ICAO: {selectedAirport.icao} | Elevation: {selectedAirport.elevation}ft
          </p>
        </div>
      )}
      {/* Error Message */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {/* Help Text */}
      <p className="text-xs text-gray-500 mt-1">
        💡 Type city name or code (Mumbai/BOM, Delhi/DEL)
      </p>
    </div>
  );
};

export default AirportSearchInput;
