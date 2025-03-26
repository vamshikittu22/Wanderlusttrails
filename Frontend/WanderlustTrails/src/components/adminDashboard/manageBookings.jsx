// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';

// function ManageBookings() {
//     const [bookings, setBookings] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         fetchBookings();
//     }, []);

//     const fetchBookings = async () => {
//         try {
//             const response = await axios.get(
//                 'http://localhost/WanderlustTrails/Backend/config/booking/getAllBookings.php',
//                 { headers: { 'Content-Type': 'application/json' } }
//             );
//             console.log("Fetched packages:", response.data);
//             if (response.data.success) {
//                 setBookings(response.data.data);
//             } else {
//                 toast.error(response.data.message || 'Failed to fetch bookings');
//             }
//         } catch (error) {
//             toast.error('Error fetching bookings: ' + (error.response?.data?.message || error.message));
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleApproveBooking = async (bookingId) => {
//         try {
//             const payload = { booking_id: bookingId };
//             console.log("Sending payload to approveBooking.php:", JSON.stringify(payload));
//             const response = await axios.post(
//                 'http://localhost/WanderlustTrails/Backend/config/booking/approveBooking.php',
//                 payload,
//                 { headers: { 'Content-Type': 'application/json' } }
//             );
//             console.log("Response from approveBooking.php:", response.data); // Log full response
//             if (response.data.success) {
//                 setBookings((prevBookings) =>
//                     prevBookings.map((booking) =>
//                         booking.id === bookingId ? { ...booking, status: 'confirmed' } : booking
//                     )
//                 );
//                 toast.success('Booking approved successfully!');
//             } else {
//                 console.error("Approval failed:", response.data.message);
//                 toast.error(response.data.message || 'Failed to approve booking');
//             }
//         } catch (error) {
//             console.error("Error approving booking:", error.response?.data || error.message);
//             toast.error('Error approving booking: ' + (error.response?.data?.message || error.message));
//         }
//     };

//     if (loading) {
//         return <div className="text-center p-4 text-white">Loading bookings...</div>;
//     }

//     return (
//         <div className="max-w-6xl mx-auto p-6 bg-gray-700 text-white rounded-lg shadow-md">
//             <h2 className="text-2xl font-semibold text-orange-600 text-center mb-6">Manage Bookings</h2>
//             {bookings.length === 0 ? (
//                 <p className="text-center text-gray-300">No bookings found.</p>
//             ) : (
//                 <div className="overflow-x-auto">
//                     <table className="min-w-full bg-gray-800 border border-gray-400 text-white">
//                         <thead>
//                             <tr className="bg-gray-600">
//                                 <th className="py-2 px-4 border-b border-gray-400">ID</th>
//                                 <th className="py-2 px-4 border-b border-gray-400">User</th>
//                                 <th className="py-2 px-4 border-b border-gray-400">Type</th>
//                                 <th className="py-2 px-4 border-b border-gray-400">Flight Details</th>
//                                 <th className="py-2 px-4 border-b border-gray-400">Hotel Details</th>
//                                 <th className="py-2 px-4 border-b border-gray-400">Start Date</th>
//                                 <th className="py-2 px-4 border-b border-gray-400">End Date</th>
//                                 <th className="py-2 px-4 border-b border-gray-400">Persons</th>
//                                 <th className="py-2 px-4 border-b border-gray-400">Total Price</th>
//                                 <th className="py-2 px-4 border-b border-gray-400">Status</th>
//                                 <th className="py-2 px-4 border-b border-gray-400">Created At</th>
//                                 <th className="py-2 px-4 border-b border-gray-400">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {bookings.map((booking) => (
//                                 <tr key={booking.id} className="hover:bg-gray-600">
//                                     <td className="py-2 px-4 border-b border-gray-400">{booking.id}</td>
//                                     <td className="py-2 px-4 border-b border-gray-400">{`${booking.firstName} ${booking.lastName}`}</td>
//                                     <td className="py-2 px-4 border-b border-gray-400">{booking.booking_type}</td>
//                                     <td className="py-2 px-4 border-b border-gray-400">{booking.flight_details ? `${booking.flight_details.from} to ${booking.flight_details.to}` : '-'}</td>
//                                     <td className="py-2 px-4 border-b border-gray-400">{booking.hotel_details ? booking.hotel_details.destination : '-'}</td>
//                                     <td className="py-2 px-4 border-b border-gray-400">{booking.start_date}</td>
//                                     <td className="py-2 px-4 border-b border-gray-400">{booking.end_date}</td>
//                                     <td className="py-2 px-4 border-b border-gray-400">{booking.persons}</td>
//                                     <td className="py-2 px-4 border-b border-gray-400">${booking.total_price}</td>
//                                     <td className="py-2 px-4 border-b border-gray-400">{booking.status}</td>
//                                     <td className="py-2 px-4 border-b border-gray-400">{new Date(booking.created_at).toLocaleString()}</td>
//                                     <td className="py-2 px-4 border-b border-gray-400">
//                                         {booking.status === 'pending' && (
//                                             <button
//                                                 onClick={() => handleApproveBooking(booking.id)}
//                                                 className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
//                                             >
//                                                 Approve
//                                             </button>
//                                         )}
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default ManageBookings;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function ManageBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await axios.get(
                'http://localhost/WanderlustTrails/Backend/config/booking/getAllBookings.php',
                { headers: { 'Content-Type': 'application/json' } }
            );
            console.log("Fetched packages:", response.data);
            if (response.data.success) {
                setBookings(response.data.data);
            } else {
                toast.error(response.data.message || 'Failed to fetch bookings');
            }
        } catch (error) {
            toast.error('Error fetching bookings: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            const payload = { booking_id: bookingId, status: newStatus };
            console.log("Sending payload to updateBookingStatus.php:", JSON.stringify(payload));
            const response = await axios.post(
                'http://localhost/WanderlustTrails/Backend/config/booking/updateBookingStatus.php',
                payload,
                { headers: { 'Content-Type': 'application/json' } }
            );
            console.log("Response from updateBookingStatus.php:", response.data);
            if (response.data.success) {
                setBookings((prevBookings) =>
                    prevBookings.map((booking) =>
                        booking.id === bookingId ? { ...booking, status: newStatus } : booking
                    )
                );
                toast.success('Booking status updated successfully!');
            } else {
                console.error("Status update failed:", response.data.message);
                toast.error(response.data.message || 'Failed to update booking status');
            }
        } catch (error) {
            console.error("Error updating status:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
            toast.error('Error updating booking status: ' + errorMessage);
        }
    };

    if (loading) {
        return <div className="text-center p-4 text-white">Loading bookings...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-6 bg-gray-700 text-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-orange-600 text-center mb-6">Manage Bookings</h2>
            {bookings.length === 0 ? (
                <p className="text-center text-gray-300">No bookings found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-800 border border-gray-400 text-white">
                        <thead>
                            <tr className="bg-gray-600">
                                <th className="py-2 px-4 border-b border-gray-400">ID</th>
                                <th className="py-2 px-4 border-b border-gray-400">User</th>
                                <th className="py-2 px-4 border-b border-gray-400">Type</th>
                                <th className="py-2 px-4 border-b border-gray-400">Flight Details</th>
                                <th className="py-2 px-4 border-b border-gray-400">Hotel Details</th>
                                <th className="py-2 px-4 border-b border-gray-400">Start Date</th>
                                <th className="py-2 px-4 border-b border-gray-400">End Date</th>
                                <th className="py-2 px-4 border-b border-gray-400">Persons</th>
                                <th className="py-2 px-4 border-b border-gray-400">Total Price</th>
                                <th className="py-2 px-4 border-b border-gray-400">Status</th>
                                <th className="py-2 px-4 border-b border-gray-400">Created At</th>
                                <th className="py-2 px-4 border-b border-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-600">
                                    <td className="py-2 px-4 border-b border-gray-400">{booking.id}</td>
                                    <td className="py-2 px-4 border-b border-gray-400">{`${booking.firstName} ${booking.lastName}`}</td>
                                    <td className="py-2 px-4 border-b border-gray-400">{booking.booking_type}</td>
                                    <td className="py-2 px-4 border-b border-gray-400">{booking.flight_details ? `${booking.flight_details.from} to ${booking.flight_details.to}` : '-'}</td>
                                    <td className="py-2 px-4 border-b border-gray-400">{booking.hotel_details ? booking.hotel_details.destination : '-'}</td>
                                    <td className="py-2 px-4 border-b border-gray-400">{booking.start_date}</td>
                                    <td className="py-2 px-4 border-b border-gray-400">{booking.end_date}</td>
                                    <td className="py-2 px-4 border-b border-gray-400">{booking.persons}</td>
                                    <td className="py-2 px-4 border-b border-gray-400">${booking.total_price}</td>
                                    <td className="py-2 px-4 border-b border-gray-400">{booking.status}</td>
                                    <td className="py-2 px-4 border-b border-gray-400">{new Date(booking.created_at).toLocaleString()}</td>
                                    <td className="py-2 px-4 border-b border-gray-400">
                                        <select
                                            value={booking.status}
                                            onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                                            className="bg-gray-700 text-white border border-gray-400 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="canceled">Canceled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ManageBookings;