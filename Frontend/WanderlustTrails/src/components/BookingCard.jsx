import React from 'react';

// Utility function to format amenities object into a string
const getAmenitiesString = (amenities) => {
    if (!amenities || typeof amenities !== 'object' || amenities === null) return 'N/A';
    return Object.entries(amenities)
        .filter(([_, value]) => value)
        .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
        .join(', ') || 'None';
};

// ✅ NEW: Better formatting for pending changes
const formatPendingChanges = (changes) => {
    if (!changes || typeof changes !== 'object') return 'None';
    
    const formatted = [];
    
    // Handle flight_details
    if (changes.flight_details && typeof changes.flight_details === 'object') {
        const fd = changes.flight_details;
        if (fd.from) formatted.push(`From: ${fd.from}`);
        if (fd.to) formatted.push(`To: ${fd.to}`);
        if (fd.fromAirport?.name) formatted.push(`Departure: ${fd.fromAirport.name}`);
        if (fd.toAirport?.name) formatted.push(`Arrival: ${fd.toAirport.name}`);
        if (fd.roundTrip !== undefined) formatted.push(`Round-Trip: ${fd.roundTrip ? 'Yes' : 'No'}`);
        if (fd.airline) formatted.push(`Airline: ${fd.airline}`);
        if (fd.flightClass) formatted.push(`Class: ${fd.flightClass}`);
        if (fd.flightTime) formatted.push(`Time: ${fd.flightTime}`);
        if (fd.duration) formatted.push(`Duration: ${fd.duration}`);
        if (fd.distance) formatted.push(`Distance: ${fd.distance}`);
    }
    
    // Handle hotel_details
    if (changes.hotel_details && typeof changes.hotel_details === 'object') {
        const hd = changes.hotel_details;
        if (hd.hotelStars) formatted.push(`Hotel Stars: ${hd.hotelStars}`);
        if (hd.amenities) formatted.push(`Amenities: ${getAmenitiesString(hd.amenities)}`);
        if (hd.car_rental !== undefined) formatted.push(`Car Rental: ${hd.car_rental ? 'Yes' : 'No'}`);
    }
    
    // Handle other fields
    if (changes.start_date) formatted.push(`Start Date: ${changes.start_date}`);
    if (changes.end_date) formatted.push(`End Date: ${changes.end_date}`);
    if (changes.persons) formatted.push(`Travelers: ${changes.persons}`);
    if (changes.insurance_type) formatted.push(`Insurance: ${changes.insurance_type}`);
    if (changes.total_price) formatted.push(`Total: $${changes.total_price}`);
    
    return formatted.length > 0 ? formatted : ['No changes'];
};

// Utility function to format various values safely
const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object' && value !== null) {
        return getAmenitiesString(value);
    }
    return value.toString();
};

// Functional component to display a booking card
const BookingCard = ({
    booking,
    paymentDetails,
    paymentLoading,
    onViewTicket,
    onEditClick,
    onCancelClick,
    onStatusChange,
    onSendReminder,
    updatingStatus,
    isAdminView = false
}) => {
    const payment = paymentDetails[booking.id];
    const isPaymentLoading = paymentLoading[booking.id] || false;

    let itineraryDetails = [];
    if (booking.booking_type === 'itinerary') {
        try {
            itineraryDetails = typeof booking.itinerary_details === 'string'
                ? JSON.parse(booking.itinerary_details)
                : Array.isArray(booking.itinerary_details)
                ? booking.itinerary_details
                : [];
        } catch (error) {
            console.error('Error parsing itinerary_details:', error, booking.itinerary_details);
            itineraryDetails = [];
        }
    }

    // ✅ FIX: Parse flight_details if it's a string
    let flightDetails = {};
    if (booking.booking_type === 'flight_hotel') {
        try {
            flightDetails = typeof booking.flight_details === 'string'
                ? JSON.parse(booking.flight_details)
                : booking.flight_details || {};
        } catch (error) {
            console.error('Error parsing flight_details:', error);
            flightDetails = {};
        }
    }

    // ✅ FIX: Parse hotel_details if it's a string
    let hotelDetails = {};
    if (booking.booking_type === 'flight_hotel') {
        try {
            hotelDetails = typeof booking.hotel_details === 'string'
                ? JSON.parse(booking.hotel_details)
                : booking.hotel_details || {};
        } catch (error) {
            console.error('Error parsing hotel_details:', error);
            hotelDetails = {};
        }
    }

    // ✅ FIX: Determine if round-trip from flight_details
    const isRoundTrip = flightDetails.roundTrip !== undefined 
        ? flightDetails.roundTrip 
        : (booking.end_date && booking.end_date !== booking.start_date);

    // Check if booking dates are in the past
    const currentDate = new Date().toISOString().split('T')[0];
    const isPastDate = (booking.start_date && booking.start_date < currentDate) || 
                      (booking.end_date && booking.end_date < currentDate);

    return (
        <div    
            className={`rounded-lg shadow-lg p-6 relative border-l-4 ${
                isAdminView 
                  ? 'bg-blue-100 text-orange-900 border-orange-400' 
                  : 'bg-blue-100 text-green-900 border-green-600'
              }`}
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-bold ${isAdminView ? 'text-orange-600' : 'text-green-800'}`}>
                    Booking #{booking.id}
                </h3>
                <span
                    className={`text-sm px-2 py-1 rounded-full ${
                        isAdminView
                            ? booking.status === 'confirmed'
                                ? 'bg-green-500'
                                : booking.status === 'pending'
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            : booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                    }`}
                >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
            </div>

            <div className="space-y-2">
                <p>
                    <span className={`font-semibold`}>Type:</span>{' '}
                    {booking.booking_type}
                </p>

                {booking.booking_type === 'package' ? (
                    <>
                        <p><span className="font-semibold">Package ID:</span> {booking.package_id || 'N/A'}</p>
                        <p><span className="font-semibold">Package Name:</span> {booking.package_name || 'N/A'}</p>
                        <p><span className="font-semibold">Dates:</span> {booking.start_date} to {booking.end_date || 'N/A'}</p>
                        <p><span className="font-semibold">Persons:</span> {booking.persons}</p>
                        <p><span className="font-semibold">Insurance:</span> {booking.insurance_type}</p>
                    </>
                ) : booking.booking_type === 'itinerary' ? (
                    <>
                        <p><span className="font-semibold">Package ID:</span> {booking.package_id || 'N/A'}</p>
                        <p><span className="font-semibold">Package Name:</span> {booking.package_name || 'N/A'}</p>
                        <p><span className="font-semibold">Dates:</span> {booking.start_date} to {booking.end_date || 'N/A'}</p>
                        <p><span className="font-semibold">Persons:</span> {booking.persons}</p>
                        <p><span className="font-semibold">Insurance:</span> {booking.insurance_type}</p>
                        <div>
                            <span className="font-semibold">Activities:</span>
                            {itineraryDetails.length > 0 ? (
                                <ul className="list-disc pl-5 mt-1">
                                    {itineraryDetails.map((activity, index) => (
                                        <li key={index}>{activity.name} ({activity.duration}, ${activity.price})</li>
                                    ))}
                                </ul>
                            ) : (
                                <span> None</span>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        {/* ✅ FIX: Use isRoundTrip variable */}
                        <p><span className="font-semibold">Trip:</span> {isRoundTrip ? 'Round-Trip' : 'One-Way'}</p>
                        <p><span className="font-semibold">From:</span> {flightDetails.from || 'N/A'}</p>
                        <p><span className="font-semibold">To:</span> {flightDetails.to || 'N/A'}</p>
                        {/* ✅ FIX: Handle null end_date properly */}
                        <p>
                            <span className="font-semibold">Dates:</span> {booking.start_date}
                            {isRoundTrip && booking.end_date ? ` to ${booking.end_date}` : ''}
                        </p>
                        <p><span className="font-semibold">Airline:</span> {flightDetails.airline || 'Any'}</p>
                        <p><span className="font-semibold">Class:</span> {flightDetails.class || flightDetails.flightClass || 'N/A'}</p>
                        <p><span className="font-semibold">Preferred Time:</span> {flightDetails.preferred_time || flightDetails.flightTime || 'N/A'}</p>
                        <p><span className="font-semibold">Hotel Stars:</span> {hotelDetails.star_rating || hotelDetails.hotelStars || 'N/A'}</p>
                        <p><span className="font-semibold">Amenities:</span> {getAmenitiesString(hotelDetails.amenities)}</p>
                        <p><span className="font-semibold">Car Rental:</span> {hotelDetails.car_rental ? 'Yes' : 'No'}</p>
                        <p><span className="font-semibold">Persons:</span> {booking.persons}</p>
                        <p><span className="font-semibold">Insurance:</span> {booking.insurance_type}</p>
                    </>
                )}

                <p>
                    <span className="font-semibold">Total Price:</span> ${booking.total_price}
                </p>

                {/* ✅ FIX: Better formatting for pending changes */}
                {booking.pending_changes && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <span className="font-semibold text-yellow-800">Pending Changes:</span>
                        <ul className="list-disc pl-5 mt-2 text-sm">
                            {formatPendingChanges(booking.pending_changes).map((change, index) => (
                                <li key={index} className="text-yellow-900">{change}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <p>
                    <span className="font-semibold">Created At:</span> {new Date(booking.created_at).toLocaleString()}
                </p>

                <div className="mt-4">
                    <span className="font-semibold">Payment Details:</span>
                    {isPaymentLoading ? (
                        <p>Loading payment details...</p>
                    ) : payment ? (
                        <div className="mt-2 border-t border-gray-300 pt-2">
                            <p><span className="font-semibold">Transaction ID:</span> {payment.transaction_id || 'N/A'}</p>
                            <p><span className="font-semibold">Payment Method:</span> {payment.payment_method || 'N/A'}</p>
                            <p>
                                <span className="font-semibold">Payment Status:</span>{' '}
                                <span className={
                                    payment.payment_status === 'completed' ? 'text-green-600' :
                                    payment.payment_status === 'pending' ? 'text-yellow-600' :
                                    'text-red-600'
                                }>
                                    {payment.payment_status?.charAt(0).toUpperCase() + payment.payment_status.slice(1) || 'N/A'}
                                </span>
                            </p>
                            <p><span className="font-semibold">Date:</span> {payment.payment_date ? new Date(payment.payment_date).toLocaleString() : 'N/A'}</p>
                        </div>
                    ) : (
                        <p>No payment details available.</p>
                    )}
                </div>
            </div>

            {!isAdminView ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                        onClick={() => onViewTicket(booking)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                        View Ticket
                    </button>
                    <button
                        onClick={() => onCancelClick(booking.id)}
                        disabled={booking.status === 'canceled' || isPastDate}
                        className={`px-3 py-1 rounded ${
                            (booking.status === 'canceled' || isPastDate)
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onEditClick(booking)}
                        disabled={booking.status === 'canceled' || isPastDate}
                        className={`px-3 py-1 rounded ${
                            (booking.status === 'canceled' || isPastDate)
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-yellow-500 text-white hover:bg-yellow-600'
                        }`}
                    >
                        Edit Ticket
                    </button>
                    <button
                        onClick={() => onSendReminder(booking.id)}
                        disabled={isPastDate}
                        className={`px-3 py-1 rounded ${
                            (booking.status === 'canceled' ||isPastDate)
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                    >
                        Send Reminder
                    </button>
                </div>
            ) : (
                <div className="mt-4">
                    <label className="font-semibold text-orange-600">Status:</label>
                    <select
                        value={booking.status}
                        onChange={(e) => onStatusChange(booking.id, e.target.value)}
                        className="mt-1 bg-gray-700 text-white border border-gray-400 rounded px-2 py-1 w-full"
                        disabled={updatingStatus || booking.status === 'canceled' || isPastDate}
                    >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="canceled">Canceled</option>
                    </select>
                </div>
            )}
        </div>
    );
};

export default BookingCard;
