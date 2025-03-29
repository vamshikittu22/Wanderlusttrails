// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const UserViewBookings = () => {
//     const [bookings, setBookings] = useState(null); // Similar to 'user' in UserProfile
//     const [loading, setLoading] = useState(true);  // Add loading state for clarity

//     useEffect(() => {
//         const fetchUserBookings = async () => {
//             try {
//                 const userId = localStorage.getItem("userId");
//                 console.log("User ID from localStorage:", userId);
//                 if (!userId) {
//                     alert("Please log in to view your bookings.");
//                     return;
//                 }
//                 const response = await axios.get(
//                     `http://localhost/WanderlustTrails/Backend/config/booking/getUserBooking.php?user_id=${userId}`,
//                     { headers: { "Content-Type": "application/json" } }
//                 );
//                 console.log("Response from getUserBooking.php:", response.data);
//                 if (response.data.success) {
//                     setBookings(response.data.data); // Array of bookings
//                 } else {
//                     console.error("Failed to fetch bookings:", response.data);
//                     alert("Failed to fetch bookings: " + (response.data.message || "Unknown error"));
//                 }
//             } catch (error) {
//                 console.error("Error fetching bookings:", error.response?.data || error.message);
//                 alert("Error fetching bookings: " + (error.response?.data?.message || "Server error"));
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchUserBookings();
//     }, []);

//     if (loading) {
//         return <div className="p-8 text-white">Loading bookings...</div>;
//     }

//     if (!bookings || bookings.length === 0) {
//         return (
//             <div className="p-6 bg-gray-700 text-white rounded-lg shadow-md">
//                 <h2 className="text-2xl text-orange-600 font-bold mb-4">Your Bookings</h2>
//                 <p>No bookings found.</p>
//             </div>
//         );
//     }

//     return (
//         <div className="p-6 bg-gray-700 text-white rounded-lg shadow-md">
//             <h2 className="text-2xl text-orange-600 font-bold mb-4">Your Bookings</h2>
//             <div className="grid grid-cols-1 gap-4">
//                 {bookings.map((booking) => (
//                     <div key={booking.id} className="bg-gray-800 p-4 rounded-md border border-gray-600">
//                         <h3 className="text-lg font-semibold">Booking ID: {booking.id}</h3>
//                         <div className="grid grid-cols-2 gap-2 mt-2">
//                             <div>
//                                 <label className="block text-sm font-medium">Type</label>
//                                 <p>{booking.booking_type}</p>
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium">Start Date</label>
//                                 <p>{booking.start_date}</p>
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium">End Date</label>
//                                 <p>{booking.end_date}</p>
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium">Persons</label>
//                                 <p>{booking.persons}</p>
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium">Total Price</label>
//                                 <p>${booking.total_price}</p>
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium">Status</label>
//                                 <p>{booking.status}</p>
//                             </div>
//                             {booking.flight_details && (
//                                 <div>
//                                     <label className="block text-sm font-medium">Flight</label>
//                                     <p>{`${booking.flight_details.from} to ${booking.flight_details.to}, ${booking.flight_details.passengers} passenger(s)`}</p>
//                                 </div>
//                             )}
//                             {booking.hotel_details && (
//                                 <div>
//                                     <label className="block text-sm font-medium">Hotel</label>
//                                     <p>{booking.hotel_details.destination}</p>
//                                 </div>
//                             )}
//                             <div>
//                                 <label className="block text-sm font-medium">Created At</label>
//                                 <p>{new Date(booking.created_at).toLocaleString()}</p>
//                             </div>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default UserViewBookings;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useUser } from '../../context/UserContext';

function UserViewBookings() {
    const { user, isAuthenticated } = useUser();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editBookingId, setEditBookingId] = useState(null);
    const [editForm, setEditForm] = useState({
        start_date: '',
        end_date: '',
        persons: '',
        from: '',
        to: '',
        hotel: ''
    });

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            console.error('UserViewBookings: User is not authenticated or ID is missing');
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
            if (response.data.success) {
                setBookings(response.data.data);
            } else {
                toast.error(response.data.message || 'Failed to fetch bookings');
            }
        } catch (error) {
            console.error('Fetch bookings error:', error);
            toast.error('Error fetching bookings: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;
        try {
            const response = await axios.post(
                'http://localhost/WanderlustTrails/Backend/config/booking/editBooking.php',
                { booking_id: bookingId, user_id: user.id },
                { headers: { 'Content-Type': 'application/json' } }
            );
            if (response.data.success) {
                setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'canceled' } : b));
                toast.success('Booking canceled successfully!');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('Error canceling booking: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEditClick = (booking) => {
        setEditBookingId(booking.id);
        setEditForm({
            start_date: booking.pending_changes?.start_date || booking.start_date,
            end_date: booking.pending_changes?.end_date || booking.end_date,
            persons: booking.pending_changes?.persons || booking.persons,
            from: booking.pending_changes?.from || booking.flight_details?.from || '',
            to: booking.pending_changes?.to || booking.flight_details?.to || '',
            hotel: booking.pending_changes?.hotel || booking.hotel_details?.hotel || ''
        });
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (bookingId) => {
        try {
            const changes = {
                start_date: editForm.start_date,
                end_date: editForm.end_date,
                persons: editForm.persons,
                from: editForm.from,
                to: editForm.to,
                hotel: editForm.hotel
            };
            const response = await axios.post(
                'http://localhost/WanderlustTrails/Backend/config/booking/editBooking.php',
                { booking_id: bookingId, user_id: user.id, changes },
                { headers: { 'Content-Type': 'application/json' } }
            );
            if (response.data.success) {
                setBookings(bookings.map(b => b.id === bookingId ? { ...b, pending_changes: changes, status: 'pending' } : b));
                setEditBookingId(null);
                toast.success('Edit request submitted and awaiting admin confirmation!');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('Error updating booking: ' + (error.response?.data?.message || error.message));
        }
    };

    if (loading) return <div className="text-center p-4 text-white">Loading bookings...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 bg-gray-700 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-orange-600 text-center mb-6">My Bookings</h2>
            {bookings.length === 0 ? (
                <p className="text-center text-gray-300">No bookings found.</p>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {bookings.map((booking) => (
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
                                    <span className="font-semibold text-gray-300">Type:</span> {booking.booking_type}
                                </p>
                                {booking.booking_type === 'package' ? (
                                    <p>
                                        <span className="font-semibold text-gray-300">Package ID:</span> {booking.package_id}
                                    </p>
                                ) : (
                                    <>
                                        <p>
                                            <span className="font-semibold text-gray-300">From:</span>{' '}
                                            {editBookingId === booking.id ? (
                                                <input
                                                    type="text"
                                                    name="from"
                                                    value={editForm.from}
                                                    onChange={handleEditChange}
                                                    className="bg-gray-700 text-white border border-gray-400 rounded px-2 py-1 w-full"
                                                />
                                            ) : (
                                                booking.flight_details?.from || 'N/A'
                                            )}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-gray-300">To:</span>{' '}
                                            {editBookingId === booking.id ? (
                                                <input
                                                    type="text"
                                                    name="to"
                                                    value={editForm.to}
                                                    onChange={handleEditChange}
                                                    className="bg-gray-700 text-white border border-gray-400 rounded px-2 py-1 w-full"
                                                />
                                            ) : (
                                                booking.flight_details?.to || 'N/A'
                                            )}
                                        </p>
                                        <p>
                                            <span className="font-semibold text-gray-300">Hotel:</span>{' '}
                                            {editBookingId === booking.id ? (
                                                <input
                                                    type="text"
                                                    name="hotel"
                                                    value={editForm.hotel}
                                                    onChange={handleEditChange}
                                                    className="bg-gray-700 text-white border border-gray-400 rounded px-2 py-1 w-full"
                                                />
                                            ) : (
                                                booking.hotel_details?.hotel || 'N/A'
                                            )}
                                        </p>
                                    </>
                                )}
                                <p>
                                    <span className="font-semibold text-gray-300">Start Date:</span>{' '}
                                    {editBookingId === booking.id ? (
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={editForm.start_date}
                                            onChange={handleEditChange}
                                            className="bg-gray-700 text-white border border-gray-400 rounded px-2 py-1 w-full"
                                        />
                                    ) : (
                                        booking.start_date
                                    )}
                                </p>
                                <p>
                                    <span className="font-semibold text-gray-300">End Date:</span>{' '}
                                    {editBookingId === booking.id ? (
                                        <input
                                            type="date"
                                            name="end_date"
                                            value={editForm.end_date}
                                            onChange={handleEditChange}
                                            className="bg-gray-700 text-white border border-gray-400 rounded px-2 py-1 w-full"
                                        />
                                    ) : (
                                        booking.end_date
                                    )}
                                </p>
                                <p>
                                    <span className="font-semibold text-gray-300">Persons:</span>{' '}
                                    {editBookingId === booking.id ? (
                                        <input
                                            type="number"
                                            name="persons"
                                            value={editForm.persons}
                                            onChange={handleEditChange}
                                            className="bg-gray-700 text-white border border-gray-400 rounded px-2 py-1 w-full"
                                            min="1"
                                        />
                                    ) : (
                                        booking.persons
                                    )}
                                </p>
                                <p>
                                    <span className="font-semibold text-gray-300">Total Price:</span> ${booking.total_price}
                                </p>
                                {booking.pending_changes && (
                                    <p>
                                        <span className="font-semibold text-gray-300">Pending Changes:</span>{' '}
                                        {JSON.stringify(booking.pending_changes)}
                                    </p>
                                )}
                            </div>

                            {booking.status !== 'canceled' && (
                                <div className="mt-4 flex space-x-2">
                                    <button
                                        onClick={() => handleCancelBooking(booking.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    {editBookingId === booking.id ? (
                                        <button
                                            onClick={() => handleEditSubmit(booking.id)}
                                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                                        >
                                            Submit Edit
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleEditClick(booking)}
                                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default UserViewBookings;