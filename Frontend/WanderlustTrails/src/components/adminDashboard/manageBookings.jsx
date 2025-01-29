import React, { useState } from "react";

const ManageBookings = () => {
    const [showBookingList, setShowBookingList] = useState(false);

    return (
        <div className="p-6 bg-transparent text-dark rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Manage Bookings</h2>

            {/* Button to Toggle Booking List */}
            <button
                onClick={() => setShowBookingList(!showBookingList)}
                className="w-full bg-blue-500 text-white font-bold py-2 rounded-lg hover:bg-blue-600 focus:outline-none mb-4"
            >
                {showBookingList ? "Hide Booking List" : "View Bookings"}
            </button>

            {/* Conditional Booking List Display */}
            {showBookingList && (
                <div className="space-y-4">
                    {/* Replace this with actual booking data mapping */}
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <h3 className="font-semibold">Booking ID: 12345</h3>
                        <p>Package Name: Adventure Tour</p>
                        <p>User: John Doe</p>
                        <button
                            className="mt-2 bg-yellow-500 text-white font-bold py-1 px-2 rounded-lg hover:bg-yellow-600 focus:outline-none"
                            onClick={() => alert("Edit Booking")}
                        >
                            Edit Booking
                        </button>
                    </div>
                    {/* Add more booking items here */}
                </div>
            )}
        </div>
    );
};

export default ManageBookings;
