import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function ManageBookings() {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [updatingStatus, setUpdatingStatus] = useState(false);


    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await axios.get(
                'http://localhost/WanderlustTrails/Backend/config/booking/getAllBookings.php',
                { headers: { 'Content-Type': 'application/json' } }
            );
            console.log("Fetched bookings:", response.data);
            if (response.data.success) {
                setBookings(response.data.data);
                setFilteredBookings(response.data.data);
            } else {
                toast.error(response.data.message || 'Failed to fetch bookings');
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Error fetching bookings: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (bookingId, newStatus) => {
        if (!confirm(`Are you sure you want to change the status to ${newStatus}?`)) return;

        try {
            const currentBooking = bookings.find(b => b.id === bookingId);
            const oldPrice = currentBooking.total_price;

            const payload = { booking_id: bookingId, status: newStatus };
            console.log("Sending payload to updateBookingStatus.php:", JSON.stringify(payload));
            const response = await axios.post(
                'http://localhost/WanderlustTrails/Backend/config/booking/updateBookingStatus.php',
                payload,
                { headers: { 'Content-Type': 'application/json' } }
            );
            console.log("Response from updateBookingStatus.php:", response.data);
            if (response.data.success) {
                toast.success('Booking status updated successfully!');
                await fetchBookings(); // Refresh the list

                const updatedBooking = bookings.find(b => b.id === bookingId);
                const newPrice = updatedBooking.total_price;
                if (newStatus === 'confirmed' && oldPrice !== newPrice) {
                    const priceChange = newPrice - oldPrice;
                    toast.info(`Price updated: ${priceChange >= 0 ? '+' : ''}$${priceChange.toFixed(2)} (New total: $${newPrice.toFixed(2)})`);
                }
            } else {
                console.error("Status update failed:", response.data.message);
                toast.error(response.data.message || 'Failed to update booking status');
            }
        } catch (error) {
            console.error("Error updating status:", error.response?.data || error.message);
            toast.error('Error updating booking status: ' + (error.response?.data?.message || error.message));
        }finally {
            setUpdatingStatus(false);
        }
    };

    const handleFilterChange = (e) => {
        const selectedStatus = e.target.value;
        setStatusFilter(selectedStatus);
        if (selectedStatus === 'all') {
            setFilteredBookings(bookings);
        } else {
            setFilteredBookings(bookings.filter(booking => booking.status === selectedStatus));
        }
    };

    if (loading) {
        return <div className="text-center p-4 text-white">Loading bookings...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-6 bg-gray-700 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-orange-600">Manage Bookings</h2>
                <div className="flex items-center">
                    <label className="text-gray-300 font-semibold mr-2">Filter:</label>
                    <select
                        value={statusFilter}
                        onChange={handleFilterChange}
                        // className="bg-gray-800 text-white border border-gray-400 rounded px-3 py-1 focus:outline-none focus:border-orange-600"
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
            </div>

            {filteredBookings.length === 0 ? (
                <p className="text-center text-gray-300">No bookings found for this status.</p>
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

                            
                            <div className="space-y-2">
                                <p>
                                    <span className="font-semibold text-gray-300">User:</span>{' '}
                                    {`${booking.firstName} ${booking.lastName}`}
                                </p>
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
                                    </>
                                    
                                ) : (
                                    <>
                                        <p>
                                            <span className="font-semibold text-gray-300">Flight Details:</span>{' '}
                                            {booking.flight_details
                                                ? `${booking.flight_details.from} to ${booking.flight_details.to}`
                                                : '-'}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-gray-300">Hotel:</span>{' '}
                                            {booking.hotel_details ? booking.hotel_details.hotel : '-'}
                                        </p>
                                    </>
                                )}
                                <p>
                                    <span className="font-semibold text-gray-300">Start Date:</span>{' '}
                                    {booking.start_date}
                                </p>
                                <p>
                                    <span className="font-semibold text-gray-300">End Date:</span>{' '}
                                    {booking.end_date}
                                </p>
                                <p>
                                    <span className="font-semibold text-gray-300">Persons:</span>{' '}
                                    {booking.persons}
                                </p>
                                <p>
                                    <span className="font-semibold text-gray-300">Total Price:</span>{' '}
                                    ${booking.total_price}
                                </p>
                                {booking.pending_changes && (
                                    <div>
                                        <span className="font-semibold text-yellow-300">Pending Changes:</span>
                                        <ul className="list-disc pl-5">
                                            {Object.entries(booking.pending_changes).map(([key, value]) => (
                                                <li key={key}>{key}: {value}</li>
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