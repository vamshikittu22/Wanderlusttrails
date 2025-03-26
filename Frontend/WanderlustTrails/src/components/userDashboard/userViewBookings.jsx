import React, { useState, useEffect } from "react";
import axios from "axios";

const UserViewBookings = () => {
    const [bookings, setBookings] = useState(null); // Similar to 'user' in UserProfile
    const [loading, setLoading] = useState(true);  // Add loading state for clarity

    useEffect(() => {
        const fetchUserBookings = async () => {
            try {
                const userId = localStorage.getItem("userId");
                console.log("User ID from localStorage:", userId);
                if (!userId) {
                    alert("Please log in to view your bookings.");
                    return;
                }
                const response = await axios.get(
                    `http://localhost/WanderlustTrails/Backend/config/booking/getUserBooking.php?user_id=${userId}`,
                    { headers: { "Content-Type": "application/json" } }
                );
                console.log("Response from getUserBooking.php:", response.data);
                if (response.data.success) {
                    setBookings(response.data.data); // Array of bookings
                } else {
                    console.error("Failed to fetch bookings:", response.data);
                    alert("Failed to fetch bookings: " + (response.data.message || "Unknown error"));
                }
            } catch (error) {
                console.error("Error fetching bookings:", error.response?.data || error.message);
                alert("Error fetching bookings: " + (error.response?.data?.message || "Server error"));
            } finally {
                setLoading(false);
            }
        };
        fetchUserBookings();
    }, []);

    if (loading) {
        return <div className="p-8 text-white">Loading bookings...</div>;
    }

    if (!bookings || bookings.length === 0) {
        return (
            <div className="p-6 bg-gray-700 text-white rounded-lg shadow-md">
                <h2 className="text-2xl text-orange-600 font-bold mb-4">Your Bookings</h2>
                <p>No bookings found.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-700 text-white rounded-lg shadow-md">
            <h2 className="text-2xl text-orange-600 font-bold mb-4">Your Bookings</h2>
            <div className="grid grid-cols-1 gap-4">
                {bookings.map((booking) => (
                    <div key={booking.id} className="bg-gray-800 p-4 rounded-md border border-gray-600">
                        <h3 className="text-lg font-semibold">Booking ID: {booking.id}</h3>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                                <label className="block text-sm font-medium">Type</label>
                                <p>{booking.booking_type}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Start Date</label>
                                <p>{booking.start_date}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">End Date</label>
                                <p>{booking.end_date}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Persons</label>
                                <p>{booking.persons}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Total Price</label>
                                <p>${booking.total_price}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Status</label>
                                <p>{booking.status}</p>
                            </div>
                            {booking.flight_details && (
                                <div>
                                    <label className="block text-sm font-medium">Flight</label>
                                    <p>{`${booking.flight_details.from} to ${booking.flight_details.to}, ${booking.flight_details.passengers} passenger(s)`}</p>
                                </div>
                            )}
                            {booking.hotel_details && (
                                <div>
                                    <label className="block text-sm font-medium">Hotel</label>
                                    <p>{booking.hotel_details.destination}</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium">Created At</label>
                                <p>{new Date(booking.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserViewBookings;