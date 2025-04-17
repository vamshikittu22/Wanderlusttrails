import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useUser } from '../context/UserContext.jsx';
import { useNavigate } from 'react-router-dom';
import FlightAndHotelForm from '../components/forms/FlightandHotelForm.jsx';
import BookingForm from '../components/forms/BookingDetailsForm.jsx';
import Barcode from 'react-barcode';

function UserViewBookings() {
    const { user, isAuthenticated } = useUser();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editBookingId, setEditBookingId] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            toast.error('Please log in to view your bookings.');
            setLoading(false);
            return;
        }
        fetchBookings();
    }, [user, isAuthenticated]);

    const fetchBookings = async () => {
        try {
            const response = await axios.get(
                `http://localhost/WanderlustTrails/Backend/config/booking/getUserBooking.php?user_id=${user.id}`,
                { headers: { 'Content-Type': 'application/json' } }
            );
            console.log("Fetched bookings:", response.data);
            if (response.data.success) {
                const parsedBookings = response.data.data.map(booking => {
                    const flightDetails = typeof booking.flight_details === 'string' ? JSON.parse(booking.flight_details) : booking.flight_details || {};
                    const hotelDetails = typeof booking.hotel_details === 'string' ? JSON.parse(booking.hotel_details) : booking.hotel_details || {};
                    const pendingChanges = typeof booking.pending_changes === 'string' ? JSON.parse(booking.pending_changes) : booking.pending_changes || null;
                    return {
                        ...booking,
                        flight_details: flightDetails,
                        hotel_details: hotelDetails,
                        pending_changes: pendingChanges,
                        editForm: booking.booking_type === 'package' ? {
                            persons: parseInt(booking.persons) || 1,
                            startDate: booking.start_date ? new Date(booking.start_date) : null,
                            endDate: booking.end_date ? new Date(booking.end_date) : null,
                        } : {
                            roundTrip: booking.end_date !== booking.start_date,
                            from: flightDetails.from || '',
                            to: flightDetails.to || '',
                            startDate: booking.start_date ? new Date(booking.start_date) : null,
                            endDate: booking.end_date ? new Date(booking.end_date) : null,
                            airline: flightDetails.airline || 'any',
                            persons: parseInt(booking.persons) || 1,
                            flightClass: flightDetails.class || 'economy',
                            hotelStars: hotelDetails.star_rating || '3',
                            insurance: flightDetails.insurance || false,
                            carRental: hotelDetails.car_rental || false,
                            flightTime: flightDetails.preferred_time || 'any',
                            amenities: {
                                pool: hotelDetails.amenities?.pool || false,
                                wifi: hotelDetails.amenities?.wifi || false,
                            },
                        }
                    };
                });
                const sortedBookings = parsedBookings.sort((a, b) => a.id - b.id);
                setBookings(sortedBookings);
                setFilteredBookings(sortedBookings);
            } else {
                toast.error(response.data.message || 'Failed to fetch bookings');
            }
        } catch (error) {
            toast.error('Error fetching bookings: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        console.log("Cancel button clicked for booking ID:", bookingId);
        if (!window.confirm('Are you sure you want to cancel this booking?')) {
            console.log("Cancellation aborted by user");
            return;
        }
        try {
            console.log("Sending cancel request for booking ID:", bookingId);
            const response = await axios.post(
                'http://localhost/WanderlustTrails/Backend/config/booking/cancelBooking.php',
                { booking_id: bookingId, user_id: user.id },
                { headers: { 'Content-Type': 'application/json' } }
            );
            console.log("Cancel response:", response.data);
            if (response.data.success) {
                fetchBookings();
                toast.success('Booking canceled successfully!');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Cancel error:", error);
            toast.error('Error canceling booking: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEditSubmit = async (bookingId, updatedFormData) => {
        console.log("Edit submit for booking ID:", bookingId, "with data:", updatedFormData);
        const booking = bookings.find(b => b.id === bookingId);
        const changes = {};

        console.log("Original booking:", booking);

        if (booking.booking_type === 'package') {
            if (updatedFormData.persons !== booking.persons) changes.persons = updatedFormData.persons;
            if (updatedFormData.startDate?.toISOString().split('T')[0] !== booking.start_date)
                changes.start_date = updatedFormData.startDate.toISOString().split('T')[0];
            if (updatedFormData.endDate?.toISOString().split('T')[0] !== booking.end_date)
                changes.end_date = updatedFormData.endDate.toISOString().split('T')[0];
            if (updatedFormData.totalPrice !== booking.total_price) changes.total_price = updatedFormData.totalPrice;
        } else {
            const flightDetails = booking.flight_details || {};
            const hotelDetails = booking.hotel_details || {};
            if (updatedFormData.from !== flightDetails.from) changes['flight_details.from'] = updatedFormData.from;
            if (updatedFormData.to !== flightDetails.to) changes['flight_details.to'] = updatedFormData.to;
            if (updatedFormData.startDate?.toISOString().split('T')[0] !== booking.start_date)
                changes.start_date = updatedFormData.startDate.toISOString().split('T')[0];
            if (updatedFormData.roundTrip && updatedFormData.endDate?.toISOString().split('T')[0] !== booking.end_date)
                changes.end_date = updatedFormData.endDate.toISOString().split('T')[0];
            if (!updatedFormData.roundTrip && booking.end_date !== booking.start_date)
                changes.end_date = updatedFormData.startDate.toISOString().split('T')[0];
            if (updatedFormData.airline !== (flightDetails.airline || 'any')) changes['flight_details.airline'] = updatedFormData.airline;
            if (updatedFormData.persons !== booking.persons) changes.persons = updatedFormData.persons;
            if (updatedFormData.flightClass !== (flightDetails.class || 'economy')) changes['flight_details.class'] = updatedFormData.flightClass;
            if (updatedFormData.hotelStars !== (hotelDetails.star_rating || '3')) changes['hotel_details.star_rating'] = updatedFormData.hotelStars;
            if (updatedFormData.insurance !== (flightDetails.insurance || false)) changes['flight_details.insurance'] = updatedFormData.insurance;
            if (updatedFormData.carRental !== (hotelDetails.car_rental || false)) changes['hotel_details.car_rental'] = updatedFormData.carRental;
            if (updatedFormData.flightTime !== (flightDetails.preferred_time || 'any')) changes['flight_details.preferred_time'] = updatedFormData.flightTime;
            if (updatedFormData.amenities.pool !== (hotelDetails.amenities?.pool || false))
                changes['hotel_details.amenities.pool'] = updatedFormData.amenities.pool;
            if (updatedFormData.amenities.wifi !== (hotelDetails.amenities?.wifi || false))
                changes['hotel_details.amenities.wifi'] = updatedFormData.amenities.wifi;
            if (updatedFormData.totalPrice !== booking.total_price) changes.total_price = updatedFormData.totalPrice;
        }

        console.log("Detected changes:", changes);
        if (Object.keys(changes).length === 0) {
            console.log("No changes detected.");
            toast.info('No changes detected.');
            setEditBookingId(null);
            return;
        }

        try {
            console.log("Submitting to backend:", { booking_id: bookingId, user_id: user.id, changes });
            const response = await axios.post(
                'http://localhost/WanderlustTrails/Backend/config/booking/editBooking.php',
                { booking_id: bookingId, user_id: user.id, changes },
                { headers: { 'Content-Type': 'application/json' } }
            );
            console.log("Backend response:", response.data);
            if (response.data.success) {
                setEditBookingId(null);
                toast.success('Edit request submitted and awaiting admin confirmation!');
                fetchBookings();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Edit error:", error);
            toast.error('Error updating booking: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEditClick = (bookingId) => {
        console.log("Edit button clicked for booking ID:", bookingId, "Current editBookingId:", editBookingId);
        setEditBookingId(bookingId === editBookingId ? null : bookingId);
    };

    const applyFilters = () => {
        let filtered = [...bookings];
        if (statusFilter !== 'all') {
            filtered = filtered.filter(booking => booking.status === statusFilter);
        }
        setFilteredBookings(filtered);
    };

    const handleStatusFilterChange = (e) => {
        console.log("Status filter changed to:", e.target.value);
        setStatusFilter(e.target.value);
        applyFilters();
    };

    useEffect(() => {
        applyFilters();
    }, [bookings, statusFilter]);

    const getDestinationImage = (booking) => {
        const destination = booking.booking_type === 'package' ? booking.package_name : booking.flight_details.to;
        if (!destination) return 'https://source.unsplash.com/random/100x100/?travel';
        const keyword = destination.split(',')[0].toLowerCase().replace(/\s/g, '');
        return `https://source.unsplash.com/100x100/?${keyword}`;
    };

    if (loading) return <div className="text-center p-4 text-white">Loading bookings...</div>;

    return (
        <div className="max-w-7xl mx-auto p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-4">
                    <h2 className="text-3xl font-bold text-blue-800">Your Travel Tickets</h2>
                    <span className="text-gray-600 font-semibold">
                        Total Bookings: {filteredBookings.length}
                    </span>
                </div>
                <div className="flex items-center">
                    <label className="text-gray-600 font-semibold mr-2">Filter by Status:</label>
                    <select
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        className="mt-1 bg-white text-gray-800 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-600"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="canceled">Canceled</option>
                    </select>
                </div>
            </div>
            {filteredBookings.length === 0 ? (
                <p className="text-center text-gray-600 text-lg">No bookings found.</p>
            ) : (
                <div className="space-y-8">
                    {filteredBookings.map((booking) => (
                        <React.Fragment key={booking.id}>
                            <div className="relative bg-white text-gray-800 rounded-lg shadow-xl max-w-md mx-auto overflow-hidden border border-gray-200">
                                {/* Background Bluemark */}
                                <div
                                    className="absolute inset-0 opacity-10 bg-repeat"
                                    style={{
                                        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><text x="50" y="50" font-size="20" fill="blue" transform="rotate(45 50 50)" text-anchor="middle" dominant-baseline="middle">Wanderlust</text></svg>')`,
                                    }}
                                ></div>

                                {/* Perpendicular Ticket Number */}
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90">
                                    <p className="text-xs font-mono text-gray-500 tracking-wider">TICKET NO. {booking.id}</p>
                                </div>

                                {/* Ticket Header */}
                                <div className="bg-blue-800 text-white p-4 flex items-center space-x-4 relative">
                                    <img
                                        src={getDestinationImage(booking)}
                                        alt="Destination"
                                        className="w-12 h-12 rounded-full object-cover border-2 border-white"
                                    />
                                    <div>
                                        <h3 className="text-lg font-bold">
                                            {booking.booking_type === 'package' ? 'Package Ticket' : 'Flight & Hotel Ticket'}
                                        </h3>
                                        <p className="text-sm">{booking.package_name || booking.flight_details.to || 'N/A'}</p>
                                    </div>
                                    <span
                                        className={`absolute top-4 right-4 text-xs px-2 py-1 rounded-full font-medium ${
                                            booking.status === 'confirmed' ? 'bg-green-500' : booking.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}
                                    >
                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </span>
                                </div>

                                {/* Ticket Body */}
                                <div className="p-6 relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-gray-200" style={{ background: 'radial-gradient(circle, transparent 50%, #e5e7eb 50%) 0 0 / 10px 10px' }}></div>
                                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-gray-200" style={{ background: 'radial-gradient(circle, transparent 50%, #e5e7eb 50%) 0 0 / 10px 10px' }}></div>

                                    <div className="ml-4 mr-4 font-mono text-sm">
                                        {booking.booking_type === 'package' ? (
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-gray-500 uppercase">Package</p>
                                                    <p className="font-semibold">{booking.package_name || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 uppercase">Travel Dates</p>
                                                    <p className="font-semibold">{booking.start_date} - {booking.end_date}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 uppercase">Persons</p>
                                                    <p className="font-semibold">{booking.persons}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 uppercase">Total</p>
                                                    <p className="font-semibold text-blue-600">${booking.total_price}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-gray-500 uppercase">From</p>
                                                    <p className="font-semibold">{booking.flight_details.from || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 uppercase">To</p>
                                                    <p className="font-semibold">{booking.flight_details.to || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 uppercase">Dates</p>
                                                    <p className="font-semibold">
                                                        {booking.start_date}{booking.end_date !== booking.start_date ? ` - ${booking.end_date}` : ' (One-Way)'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 uppercase">Airline</p>
                                                    <p className="font-semibold">{booking.flight_details.airline || 'Any'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 uppercase">Class</p>
                                                    <p className="font-semibold">{booking.flight_details.class || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 uppercase">Time</p>
                                                    <p className="font-semibold">{booking.flight_details.preferred_time || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 uppercase">Hotel</p>
                                                    <p className="font-semibold">{booking.hotel_details.destination || 'N/A'} ({booking.hotel_details.star_rating || 'N/A'}★)</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 uppercase">Add-ons</p>
                                                    <p className="font-semibold text-xs">
                                                        {booking.flight_details.insurance || booking.hotel_details.car_rental || booking.hotel_details.amenities?.pool || booking.hotel_details.amenities?.wifi
                                                            ? `${booking.flight_details.insurance ? 'Insurance ' : ''}${booking.hotel_details.car_rental ? 'Car ' : ''}${booking.hotel_details.amenities?.pool ? 'Pool ' : ''}${booking.hotel_details.amenities?.wifi ? 'Wi-Fi' : ''}`
                                                            : 'None'}
                                                    </p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-gray-500 uppercase">Total</p>
                                                    <p className="font-semibold text-blue-600">${booking.total_price}</p>
                                                </div>
                                            </div>
                                        )}

                                        {booking.pending_changes && (
                                            <div className="mt-3 border-t border-dashed border-gray-400 pt-2">
                                                <p className="text-xs text-yellow-600 font-semibold uppercase">Pending Changes</p>
                                                <ul className="text-xs text-gray-700 list-disc pl-4">
                                                    {Object.entries(booking.pending_changes).map(([key, value]) => (
                                                        <li key={key}>{key}: {value.toString()}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Ticket Footer with Barcode */}
                                <div className="bg-gray-100 p-4 border-t border-dashed border-gray-400 flex justify-between items-center">
                                    <Barcode
                                        value={`WL${booking.id.toString().padStart(8, '0')}`}
                                        height={40}
                                        width={1}
                                        fontSize={12}
                                        margin={0}
                                    />
                                    {booking.status !== 'canceled' && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleCancelBooking(booking.id)}
                                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-xs font-mono uppercase"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleEditClick(booking.id)}
                                                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-xs font-mono uppercase"
                                            >
                                                {editBookingId === booking.id ? 'Close' : 'Edit'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {editBookingId === booking.id && (
                                <div className="bg-gray-700 rounded-xl p-6 mt-4 max-w-md mx-auto">
                                    {booking.booking_type === 'flight_hotel' ? (
                                        <FlightAndHotelForm
                                            user={user}
                                            navigate={navigate}
                                            initialData={booking.editForm}
                                            isEditMode={true}
                                            onSubmit={(formData) => handleEditSubmit(booking.id, formData)}
                                            onCancel={() => setEditBookingId(null)}
                                        />
                                    ) : (
                                        <BookingForm
                                            pricePerPerson={parseFloat(booking.total_price) / (booking.persons * ((new Date(booking.end_date) - new Date(booking.start_date)) / (1000 * 60 * 60 * 24) + 1))}
                                            initialData={booking.editForm}
                                            isEditMode={true}
                                            onSubmit={(formData) => handleEditSubmit(booking.id, formData)}
                                            onCancel={() => setEditBookingId(null)}
                                        />
                                    )}
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
}

export default UserViewBookings;