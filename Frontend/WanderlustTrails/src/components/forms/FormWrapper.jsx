
import React from 'react';

// FormWrapper component to wrap around the booking forms
const FormWrapper = ({ children, onSubmit, onCancel, summary, isEditMode, bookingType }) => {
  const bgColor = bookingType === 'itinerary' ? 'bg-teal-50' : 'bg-indigo-50'; // Change background color based on booking type

  // Function to render the booking summary based on the booking type
  const renderSummary = () => {
    if (bookingType === 'flight_hotel') {
      return (
        <>
          <p className="text-gray-700"><strong>From:</strong> {summary.from}</p>
          <p className="text-gray-700"><strong>To:</strong> {summary.to}</p>
          <p className="text-gray-700">
            <strong>Dates:</strong> {summary.startDate}
            {summary.endDate ? ` to ${summary.endDate}` : ` (${summary.tripType})`}
          </p>
          <p className="text-gray-700"><strong>Flight Duration:</strong> {summary.flightDuration}</p>
          <p className="text-gray-700"><strong>Airline:</strong> {summary.airline}</p>
          <p className="text-gray-700"><strong>Travelers:</strong> {summary.persons}</p>
          <p className="text-gray-700"><strong>Flight Class:</strong> {summary.flightClass}</p>
          <p className="text-gray-700"><strong>Flight Time:</strong> {summary.flightTime}</p>
          <p className="text-gray-700"><strong>Hotel Stars:</strong> {summary.hotelStars}</p>
          <p className="text-gray-700"><strong>Amenities:</strong> {summary.amenities || 'None'}</p>
          <p className="text-gray-700"><strong>Insurance:</strong> {summary.insurance}</p>
          <p className="text-gray-700"><strong>Add-ons:</strong> {summary.addOns || 'None'}</p>
          <p className="text-lg font-semibold text-indigo-800 mt-2">
            Total Price: <span className="text-indigo-600">${summary.totalPrice}</span>
          </p>
        </>
      );
    } else if (bookingType === 'package') {
      return (
        <>
          <p className="text-gray-700"><strong>Package ID:</strong> {summary.packageId}</p>
          <p className="text-gray-700"><strong>Travelers:</strong> {summary.persons}</p>
          <p className="text-gray-700">
            <strong>Dates:</strong> {summary.startDate} to {summary.endDate}
          </p>
          <p className="text-gray-700"><strong>Insurance:</strong> {summary.insurance}</p>
          <p className="text-lg font-semibold text-indigo-800 mt-2">
            Total Price: <span className="text-indigo-600">${summary.totalPrice}</span>
          </p>
        </>
      );
    } else if (bookingType === 'itinerary') {
      return (
        <>
          <p className="text-gray-700"><strong>Package:</strong> {summary.packageName || 'N/A'}</p>
          <p className="text-gray-700"><strong>Location:</strong> {summary.location || 'N/A'}</p>
          <p className="text-gray-700"><strong>Activities:</strong> {summary.activities || 'None'}</p>
          <p className="text-gray-700"><strong>Start Date:</strong> {summary.startDate || 'N/A'}</p>
          <p className="text-gray-700"><strong>End Date:</strong> {summary.endDate || 'N/A'}</p>
          <p className="text-gray-700"><strong>Travelers:</strong> {summary.persons}</p>
          <p className="text-gray-700"><strong>Insurance:</strong> {summary.insurance}</p>
          <p className="text-lg font-semibold text-indigo-800 mt-2">
            Total Price: <span className="text-indigo-600">${summary.totalPrice}</span>
          </p>
        </>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className={`w-full ${bgColor} p-8 rounded-xl shadow-2xl space-y-6`}>
          {children}
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-indigo-800 mb-3">Booking Summary</h3>
            {renderSummary()}
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700"
            >
              {isEditMode ? 'Update Booking' : 'Save & Proceed'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormWrapper;