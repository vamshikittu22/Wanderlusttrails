import React, { useState, useEffect } from 'react';
import $ from 'jquery';
import { toast } from 'react-toastify';

function ManageBookings() {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [userFilter, setUserFilter] = useState('all');
    const [uniqueUsers, setUniqueUsers] = useState([]);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = () => {
        $.ajax({
            url: 'http://localhost/WanderlustTrails/Backend/config/booking/getAllBookings.php',
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            success: function (response) {
                if (response.success) {
                    const parsedBookings = response.data.map(booking => {
                        const flightDetails = typeof booking.flight_details === 'string' && booking.flight_details
                            ? JSON.parse(booking.flight_details)
                            : booking.flight_details || {};
                        const hotelDetails = typeof booking.hotel_details === 'string' && booking.hotel_details
                            ? JSON.parse(booking.hotel_details)
                            : booking.hotel_details || {};
                        const amenities = typeof hotelDetails.amenities === 'object' && hotelDetails.amenities !== null
                            ? hotelDetails.amenities
                            : { pool: false, wifi: false };
                        const parsedHotelDetails = { ...hotelDetails, amenities };
                        const pendingChanges = typeof booking.pending_changes === 'string' && booking.pending_changes
                            ? JSON.parse(booking.pending_changes)
                            : booking.pending_changes || null;
                        return {
                            ...booking,
                            flight_details: flightDetails,
                            hotel_details: parsedHotelDetails,
                            pending_changes: pendingChanges,
                            userFullName: `${booking.firstName} ${booking.lastName}`,
                        };
                    });
                    const sortedBookings = parsedBookings.sort((a, b) => a.id - b.id);
                    setBookings(sortedBookings);
                    setFilteredBookings(sortedBookings);

                    const usersMap = new Map();
                    sortedBookings.forEach(b => {
                        usersMap.set(b.user_id, {
                            user_id: b.user_id,
                            fullName: b.userFullName,
                            username: b.username || 'N/A',
                            role: b.role || 'N/A',
                        });
                    });
                    const users = Array.from(usersMap.values()).sort((a, b) => a.fullName.localeCompare(b.fullName) || a.user_id - b.user_id);
                    setUniqueUsers(users);
                } else {
                    toast.error(response.message || 'Failed to fetch bookings');
                }
            },
            error: function (xhr) {
                let errorMessage = 'Error fetching bookings: Server error';
                try {
                    const response = JSON.parse(xhr.responseText);
                    errorMessage = 'Error fetching bookings: ' + (response.message || 'Server error');
                } catch (e) {
                    errorMessage = xhr.statusText || 'Server error';
                }
                toast.error(errorMessage);
            },
            complete: function () {
                setLoading(false);
            }
        });
    };

    const handleStatusChange = (bookingId, newStatus) => {
        if (!confirm(`Are you sure you want to change the status to ${newStatus}?`)) return;
    
        setUpdatingStatus(true);
        const currentBooking = bookings.find(b => b.id === bookingId);
        if (!currentBooking) {
            toast.error(`Booking #${bookingId} not found`);
            setUpdatingStatus(false);
            return;
        }
        const oldPrice = currentBooking.total_price;
        const userId = currentBooking.user_id;
        const pendingChanges = currentBooking.pending_changes || {};
    
        // Convert dates to YYYY-MM-DD format for pending_changes
        const formattedPendingChanges = { ...pendingChanges };
        if (pendingChanges.startDate) {
            formattedPendingChanges.start_date = new Date(pendingChanges.startDate).toISOString().split('T')[0];
            delete formattedPendingChanges.startDate;
        }
        if (pendingChanges.endDate) {
            formattedPendingChanges.end_date = new Date(pendingChanges.endDate).toISOString().split('T')[0];
            delete formattedPendingChanges.endDate;
        }
    
        // Validate inputs before sending
        if (!Number.isInteger(Number(bookingId)) || !Number.isInteger(Number(userId))) {
            toast.error('Invalid booking ID or user ID');
            setUpdatingStatus(false);
            return;
        }
        if (!['pending', 'confirmed', 'canceled'].includes(newStatus)) {
            toast.error('Invalid status selected');
            setUpdatingStatus(false);
            return;
        }
    
        const payload = {
            booking_id: Number(bookingId),
            status: newStatus,
            user_id: Number(userId),
            pending_changes: formattedPendingChanges,
        };
        console.log('Sending payload to updateBookingStatus:', payload); // Debug payload
    
        $.ajax({
            url: 'http://localhost/WanderlustTrails/Backend/config/booking/updateBookingStatus.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            dataType: 'json',
            success: function (response) {
                console.log('Server response:', response); // Debug server response
                if (response.success) {
                    if (response.message === "Status unchanged") {
                        toast.info("Status is already " + newStatus);
                    } else {
                        toast.success('Booking status and pending changes updated successfully!');
                        fetchBookings(); // Refresh to reflect DB changes
                        const updatedBooking = bookings.find(b => b.id === bookingId);
                        const newPrice = updatedBooking ? updatedBooking.total_price : oldPrice;
                        if (newStatus === 'confirmed' && oldPrice !== newPrice) {
                            const priceChange = newPrice - oldPrice;
                            toast.info(`Price updated: ${priceChange >= 0 ? '+' : ''}$${priceChange.toFixed(2)} (New total: $${newPrice.toFixed(2)})`);
                        }
                    }
                } else {
                    toast.error(response.message || 'Failed to update booking status or pending changes');
                }
            },
            error: function (xhr) {
                let errorMessage = `Error updating booking status: ${xhr.status} ${xhr.statusText}`;
                try {
                    const response = JSON.parse(xhr.responseText);
                    errorMessage += ` - ${response.message || 'Server error'}`;
                    console.log('Server error response:', response); // Debug server response
                } catch (e) {
                    errorMessage += ' - Unable to parse server response';
                }
                console.error('AJAX Error:', xhr); // Log full error for debugging
                toast.error(errorMessage);
            },
            complete: function () {
                setUpdatingStatus(false);
            }
        });
    };
    

    const applyFilters = () => {
        let filtered = [...bookings];
        if (userFilter !== 'all') {
            filtered = filtered.filter(booking => booking.user_id === parseInt(userFilter));
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter(booking => booking.status === statusFilter);
        }
        setFilteredBookings(filtered);
    };

    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
        applyFilters();
    };

    const handleUserFilterChange = (e) => {
        setUserFilter(e.target.value);
        applyFilters();
    };

    useEffect(() => {
        applyFilters();
    }, [bookings, userFilter, statusFilter]);

    if (loading) {
        return <div className="text-center p-4 text-white">Loading bookings...</div>;
    }

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
            return getAmenitiesString(value); // Handle nested amenities objects
        }
        return value.toString(); // Convert other types to string
    };

    return (
        <div className="max-w-7xl mx-auto p-6 bg-gray-700 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <h1 className="text-3xl font-semibold text-orange-600">Manage Bookings</h1>  
                </div>
                <div className="flex items-center space-x-4 mb-4">    
                    <div className="flex items-center">
                        <label className="text-gray-300 font-semibold">Filter by Status:</label>
                        <select
                            value={statusFilter}
                            onChange={handleStatusFilterChange}
                            disabled={updatingStatus}
                            className={`mt-1 bg-gray-700 text-white border border-gray-400 rounded px-2 py-1 w-full ${
                                updatingStatus ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            <option value="all">All</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="canceled">Canceled</option>
                        </select>
                    </div>
                    <div className="flex items-center">
                        <label className="text-gray-300 font-semibold">Filter by User:</label>
                        <select
                            value={userFilter}
                            onChange={handleUserFilterChange}
                            disabled={updatingStatus}
                            className={`mt-1 bg-gray-700 text-white border border-gray-400 rounded px-2 py-1 w-full ${
                                updatingStatus ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            <option value="all">All Users</option>
                            {uniqueUsers.map(user => (
                                <option key={user.user_id} value={user.user_id}>
                                    {user.fullName} ({user.username}, {user.role})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-gray-300 font-semibold mr-2">Total Bookings:</label>
                        <span className="text-orange-500 font-bold w-full">
                            {filteredBookings.length}
                        </span>
                    </div>
                </div>
            </div>
            {filteredBookings.length === 0 ? (
                <p className="text-center text-gray-300">No bookings found.</p>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredBookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="bg-gray-800 text-white rounded-lg shadow-lg p-6 relative border-l-4 border-orange-600"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-orange-600">
                                    Booking #{booking.id}
                                </h3>
                                <span
                                    className={`text-sm px-2 py-1 rounded-full ${
                                        booking.status === 'confirmed'
                                            ? 'bg-green-500'
                                            : booking.status === 'pending'
                                            ? 'bg-yellow-500'
                                            : 'bg-red-500'
                                    }`}
                                >
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                            </div>
                            <div className="space

-y-2">
                                <p>
                                    <span className="font-semibold text-gray-300">Type:</span>{' '}
                                    {booking.booking_type}
                                </p>
                                {booking.booking_type === 'package' ? (
                                    <>
                                        <p>
                                            <span className="font-semibold text-gray-300">Package ID:</span>{' '}
                                            {booking.package_id || 'N/A'}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-gray-300">Package Name:</span>{' '}
                                            {booking.package_name || 'N/A'}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-gray-300">Dates:</span>{' '}
                                            {booking.start_date} to {booking.end_date}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-gray-300">Persons:</span>{' '}
                                            {booking.persons}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p>
                                            <span className="font-semibold text-gray-300">Trip:</span>{' '}
                                            {booking.end_date !== booking.start_date ? 'Round-Trip' : 'One-Way'}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-gray-300">From:</span>{' '}
                                            {booking.flight_details.from || 'N/A'}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-gray-300">To:</span>{' '}
                                            {booking.flight_details.to || 'N/A'}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-gray-300">Dates:</span>{' '}
                                            {booking.start_date}{booking.end_date !== booking.start_date ? ` to ${booking.end_date}` : ''}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-gray-300">Airline:</span>{' '}
                                            {booking.flight_details.airline || 'Any'}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-gray-300">Class:</span>{' '}
                                            {booking.flight_details.class || 'N/A'}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-gray-300">Preferred Time:</span>{' '}
                                            {booking.flight_details.preferred_time || 'N/A'}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-gray-300">Insurance:</span>{' '}
                                            {booking.flight_details.insurance ? 'Yes' : 'No'}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-gray-300">Hotel Stars:</span>{' '}
                                            {booking.hotel_details.star_rating || 'N/A'}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-gray-300">Amenities:</span>{' '}
                                            {getAmenitiesString(booking.hotel_details.amenities)}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-gray-300">Car Rental:</span>{' '}
                                            {booking.hotel_details?.car_rental ? 'Yes' : 'No'}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-gray-300">Persons:</span>{' '}
                                            {booking.persons}
                                        </p>
                                    </>
                                )}
                                <p>
                                    <span className="font-semibold text-gray-300">Total Price:</span>{' '}
                                    ${booking.total_price}
                                </p>
                                {booking.pending_changes && (
                                    <div>
                                        <span className="font-semibold text-yellow-300">Pending Changes:</span>
                                        <ul className="list-disc pl-5">
                                            {Object.entries(booking.pending_changes).map(([key, value]) => (
                                                <li key={key}>{key}: {formatValue(value)}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <p>
                                    <span className="font-semibold text-gray-300">Created At:</span>{' '}
                                    {new Date(booking.created_at).toLocaleString()}
                                </p>
                            </div>
                            <div className="mt-4">
                                <label className="font-semibold text-gray-300">Status:</label>
                                <select
                                    value={booking.status}
                                    onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                                    className="mt-1 bg-gray-700 text-white border border-gray-400 rounded px-2 py-1 w-full focus:outline-none focus:border-blue-500"
                                    disabled={updatingStatus}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="canceled">Canceled</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ManageBookings;