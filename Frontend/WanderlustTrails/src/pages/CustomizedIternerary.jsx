//path: Frontend/WanderlustTrails/src/pages/CustomizedItinerary.jsx
import React, { useState } from 'react';
import mockData from '../data/mockData';

const CustomizedItinerary = () => {
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);

  console.log('CustomizedItinerary rendered with mock data:', mockData.itinerary);

  const handleDestinationSelect = (destination) => {
    setSelectedDestination(destination);
    setSelectedActivities([]);
    setSelectedAccommodation(null);
    console.log('Selected destination:', destination);
  };

  const handleActivityToggle = (activity) => {
    const updatedActivities = selectedActivities.includes(activity)
      ? selectedActivities.filter((a) => a.id !== activity.id)
      : [...selectedActivities, activity];
    setSelectedActivities(updatedActivities);
    console.log('Updated activities:', updatedActivities);
  };

  const handleAccommodationSelect = (accommodation) => {
    setSelectedAccommodation(accommodation);
    console.log('Selected accommodation:', accommodation);
  };

  const calculateTotalPrice = () => {
    const activityPrice = selectedActivities.reduce((sum, a) => sum + a.price, 0);
    const accommodationPrice = selectedAccommodation ? selectedAccommodation.pricePerNight : 0;
    return activityPrice + accommodationPrice;
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-300 mb-8 text-center">
          Design Your Itinerary
        </h1>

        {/* Destinations */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-xl font-medium text-orange-700 mb-4">Choose a Destination</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockData.itinerary.destinations.map((destination) => (
              <button
                key={destination.id}
                onClick={() => handleDestinationSelect(destination)}
                className={`p-4 rounded-lg border border-red-900 text-gray-200 ${
                  selectedDestination?.id === destination.id ? 'bg-indigo-600' : 'bg-gray-700'
                } hover:bg-indigo-700 transition-colors duration-200`}
              >
                <h3 className="font-medium">{destination.name}</h3>
                <p className="text-sm text-gray-400">{destination.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Activities */}
        {selectedDestination && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
            <h2 className="text-xl font-medium text-orange-700 mb-4">Select Activities</h2>
            <div className="space-y-4">
              {mockData.itinerary.activities
                .filter((activity) => activity.destinationId === selectedDestination.id)
                .map((activity) => (
                  <div key={activity.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedActivities.includes(activity)}
                      onChange={() => handleActivityToggle(activity)}
                      className="h-5 w-5 text-indigo-600 bg-orange-50 border border-red-900 rounded focus:ring-indigo-500"
                    />
                    <label className="ml-2 text-gray-200">
                      {activity.name} (${activity.price})
                    </label>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Accommodations */}
        {selectedDestination && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
            <h2 className="text-xl font-medium text-orange-700 mb-4">Choose Accommodation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockData.itinerary.accommodations
                .filter((acc) => acc.destinationId === selectedDestination.id)
                .map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => handleAccommodationSelect(acc)}
                    className={`p-4 rounded-lg border border-red-900 text-gray-200 ${
                      selectedAccommodation?.id === acc.id ? 'bg-indigo-600' : 'bg-gray-700'
                    } hover:bg-indigo-700 transition-colors duration-200`}
                  >
                    <h3 className="font-medium">{acc.name}</h3>
                    <p className="text-sm text-gray-400">{acc.stars} Stars - ${acc.pricePerNight}/night</p>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {(selectedDestination || selectedActivities.length > 0 || selectedAccommodation) && (
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-orange-700 mb-2">Itinerary Summary</h3>
            <p className="text-gray-200">
              <strong>Destination:</strong> {selectedDestination?.name || 'None'}
            </p>
            <p className="text-gray-200">
              <strong>Activities:</strong>{' '}
              {selectedActivities.length > 0 ? selectedActivities.map((a) => a.name).join(', ') : 'None'}
            </p>
            <p className="text-gray-200">
              <strong>Accommodation:</strong> {selectedAccommodation?.name || 'None'}
            </p>
            <p className="text-gray-200 mt-2">
              <strong>Total Estimated Cost:</strong> ${calculateTotalPrice()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomizedItinerary;