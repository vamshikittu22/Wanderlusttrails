
import React from 'react';

// Utility functions for formatting
const getAmenitiesString = (amenities) => {
    if (!amenities || typeof amenities !== 'object' || amenities === null) return 'N/A';
    return Object.entries(amenities)
        .filter(([_, value]) => value)
        .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
        .join(' ') || 'None';
};

const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object' && value !== null) {
        return getAmenitiesString(value);
    }
    return value.toString();
};

const BookingCard = ({
    booking,
    paymentDetails,
    paymentLoading,
    onViewTicket,
    onEditClick,
    onCancelClick,
    onStatusChange,
    updatingStatus,
    isAdminView = false
}) => {
    const payment = paymentDetails[booking.id];
    const isPaymentLoading = paymentLoading[booking.id] || false;

    // Parse itinerary_details if it's a JSON string
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

    return (
        <div
            className={`rounded-lg shadow-lg p-6 relative border-l-4 ${isAdminView ? 'bg-gray-800 text-white border-orange-800' : 'bg-gray-200 text-gray-800 border-green-600'}`}
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-bold ${isAdminView ? 'text-orange-600' : 'text-gray-800'}`}>
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
                    <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Type:</span>{' '}
                    {booking.booking_type}
                </p>
                {booking.booking_type === 'package' ? (
                    <>
                        <p>
                            <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Package ID:</span>{' '}
                            {booking.package_id || 'N/A'}
                        </p>
                        <p>
                            <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Package Name:</span>{' '}
                            {booking.package_name || 'N/A'}
                        </p>
                        <p>
                            <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Dates:</span>{' '}
                            {booking.start_date} to {booking.end_date}
                        </p>
                        <p>
                            <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Persons:</span>{' '}
                            {booking.persons}
                        </p>
                        <p>
                            <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Insurance:</span>{' '}
                            {booking.insurance_type}
                        </p>
                    </>
                ) : booking.booking_type === 'itinerary' ? (
                    <>
                        <p>
                            <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Package ID:</span>{' '}
                            {booking.package_id || 'N/A'}
                        </p>
                        <p>
                            <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Package Name:</span>{' '}
                            {booking.package_name || 'N/A'}
                        </p>
                        <p>
                            <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Dates:</span>{' '}
                            {booking.start_date} to {booking.end_date}
                        </p>
                        <p>
                            <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Persons:</span>{' '}
                            {booking.persons}
                        </p>
                        <p>
                            <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Insurance:</span>{' '}
                            {booking.insurance_type}
                        </p>
                        <div>
                            <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Activities:</span>
                            {itineraryDetails.length > 0 ? (
                                <ul className="list-disc pl-5 mt-1">
                                    {itineraryDetails.map((activity, index) => (
                                        <li key={index} className={isAdminView ? 'text-gray-400' : 'text-gray-600'}>
                                            {activity.name} ({activity.duration}, ${activity.price})
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <span className={isAdminView ? 'text-gray-400' : 'text-gray-600'}> None</span>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <p>
                            <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Trip:</span>{' '}
                            {booking.end_date !== booking.start_date ? 'Round-Trip' : 'One-Way'}
                        </p>
                        <p>
                            <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>From:</span>{' '}
                            {booking.flight_details?.from || 'N/A'}
                        </p>
                        <p>
                            <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>To:</span>{' '}
                            {booking.flight_details?.to || 'N/A'}
                        </p>
                        <p>
                            <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Dates:</span>{' '}
                            {booking.start_date}{booking.end_date !== booking.start_date ? ` to ${booking.end_date}` : ''}
                        </p>
                        <p>
                            <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Airline:</span>{' '}
                            {booking.flight_details?.airline || 'Any'}
                        </p>
                        <p>
                            <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Class:</span>{' '}
                            {booking.flight_details?.class || 'N/A'}
                        </p>
                        <p>
                            <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Preferred Time:</span>{' '}
                            {booking.flight_details?.preferred_time || 'N/A'}
                        </p>
                        
                        <p>
                            <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Hotel Stars:</span>{' '}
                            {booking.hotel_details?.star_rating || 'N/A'}
                        </p>
                        <p>
                            <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Amenities:</span>{' '}
                            {getAmenitiesString(booking.hotel_details?.amenities)}
                        </p>
                        <p>
                            <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Car Rental:</span>{' '}
                            {booking.hotel_details?.car_rental ? 'Yes' : 'No'}
                        </p>
                        <p>
                            <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Persons:</span>{' '}
                            {booking.persons}
                        </p>
                        <p>
                            <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Insurance:</span>{' '}
                            {booking.insurance_type}
                        </p>
                       
                    </>
                )}
                <p>
                    <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Total Price:</span>{' '}
                    ${booking.total_price}
                </p>
                {booking.pending_changes && (
                    <div>
                        <span className={`font-semibold ${isAdminView ? 'text-yellow-300' : 'text-yellow-600'}`}>Pending Changes:</span>
                        <ul className="list-disc pl-5">
                            {Object.entries(booking.pending_changes).map(([key, value]) => (
                                <li key={key}>{key}: {formatValue(value)}</li>
                            ))}
                        </ul>
                    </div>
                )}
                <p>
                    <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Created At:</span>{' '}
                    {new Date(booking.created_at).toLocaleString()}
                </p>
                <div className="mt-4">
                    <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Payment Details:</span>
                    {isPaymentLoading ? (
                        <p className={isAdminView ? 'text-gray-400' : 'text-gray-600'}>Loading payment details...</p>
                    ) : payment ? (
                        <div className={`mt-2 border-t ${isAdminView ? 'border-gray-500' : 'border-gray-300'} pt-2`}>
                            <p>
                                <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Transaction ID:</span>{' '}
                                {payment.transaction_id || 'N/A'}
                            </p>
                            <p>
                                <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Payment Method:</span>{' '}
                                {payment.payment_method || 'N/A'}
                            </p>
                            <p>
                                <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Status:</span>{' '}
                                <span
                                    className={
                                        payment.payment_status === 'completed'
                                            ? (isAdminView ? 'text-green-400' : 'text-green-500')
                                            : payment.payment_status === 'pending'
                                            ? (isAdminView ? 'text-yellow-400' : 'text-yellow-500')
                                            : (isAdminView ? 'text-red-400' : 'text-red-500')
                                    }
                                >
                                    {payment.payment_status
                                        ? payment.payment_status.charAt(0).toUpperCase() + payment.payment_status.slice(1)
                                        : 'N/A'}
                                </span>
                            </p>
                            <p>
                                <span className={`font-semibold ${isAdminView ? 'text-gray-300' : 'text-gray-700'}`}>Date:</span>{' '}
                                {payment.payment_date
                                    ? new Date(payment.payment_date).toLocaleString()
                                    : 'N/A'}
                            </p>
                        </div>
                    ) : (
                        <p className={isAdminView ? 'text-gray-400' : 'text-gray-600'}>No payment details available.</p>
                    )}
                </div>
            </div>
            {isAdminView ? (
                <div className="mt-4">
                    <label className="font-semibold text-gray-300">Status:</label>
                    <select
                        value={booking.status}
                        onChange={(e) => onStatusChange(booking.id, e.target.value)}
                        className="mt-1 bg-gray-700 text-white border border-gray-400 rounded px-2 py-1 w-full focus:outline-none focus:border-blue-500"
                        disabled={updatingStatus}
                    >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="canceled">Canceled</option>
                    </select>
                </div>
            ) : (
                <div className="mt-3 flex space-x-2">
                    <button
                        onClick={() => onViewTicket(booking)}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                    >
                        View Ticket
                    </button>
                    <button
                        onClick={() => onCancelClick(booking.id)}
                        disabled={booking.status === 'canceled'}
                        className={`px-3 py-1 rounded transition-colors ${
                            booking.status === 'canceled'
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onEditClick(booking)}
                        disabled={booking.status === 'canceled'}
                        className={`px-3 py-1 rounded transition-colors ${
                            booking.status === 'canceled'
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-yellow-500 text-white hover:bg-yellow-600'
                        }`}
                    >
                        Edit Ticket
                    </button>
                </div>
            )}
        </div>
    );
};

export default BookingCard;