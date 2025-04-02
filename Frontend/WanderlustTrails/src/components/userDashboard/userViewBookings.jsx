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
        hotel: '',
        package_id: '' // Added for editing package_id
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
            console.log('Fetch bookings response:', response.data);
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
                'http://localhost/WanderlustTrails/Backend/config/booking/cancelBooking.php',
                { booking_id: bookingId, user_id: user.id },
                { headers: { 'Content-Type': 'application/json' } }
            );
            if (response.data.success) {
                fetchBookings();
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
        const newEditForm = {
            start_date: booking.pending_changes?.start_date || booking.start_date,
            end_date: booking.pending_changes?.end_date || booking.end_date,
            persons: booking.pending_changes?.persons || booking.persons,
            from: booking.pending_changes?.from || booking.flight_details?.from || '',
            to: booking.pending_changes?.to || booking.flight_details?.to || '',
            hotel: booking.pending_changes?.hotel || booking.hotel_details?.hotel || '',
            package_id: booking.pending_changes?.package_id || booking.package_id || '' // Initialize package_id
        };
        setEditForm(newEditForm);
        console.log('Edit form initialized:', newEditForm);
    };

    const handleEditChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleEditSubmit = async (bookingId) => {
        try {
            const changes = {};
            // Only include fields that have changed from the original booking
            const booking = bookings.find(b => b.id === bookingId);
            if (editForm.start_date !== booking.start_date) changes.start_date = editForm.start_date;
            if (editForm.end_date !== booking.end_date) changes.end_date = editForm.end_date;
            if (editForm.persons !== booking.persons) changes.persons = parseInt(editForm.persons);
            if (booking.booking_type === 'flight_hotel') {
                if (editForm.from !== (booking.flight_details?.from || '')) changes.from = editForm.from;
                if (editForm.to !== (booking.flight_details?.to || '')) changes.to = editForm.to;
                if (editForm.hotel !== (booking.hotel_details?.hotel || '')) changes.hotel = editForm.hotel;
            }
            if (booking.booking_type === 'package' && editForm.package_id !== booking.package_id) {
                changes.package_id = parseInt(editForm.package_id);
            }

            if (Object.keys(changes).length === 0) {
                toast.info('No changes detected.');
                setEditBookingId(null);
                return;
            }

            console.log('Submitting edit with changes:', changes);
            const response = await axios.post(
                'http://localhost/WanderlustTrails/Backend/config/booking/editBooking.php',
                { booking_id: bookingId, user_id: user.id, changes },
                { headers: { 'Content-Type': 'application/json' } }
            );
            if (response.data.success) {
                setEditBookingId(null);
                toast.success('Edit request submitted and awaiting admin confirmation!');
                fetchBookings();
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
                                <p><span className="font-semibold text-gray-300">Type:</span> {booking.booking_type}</p>
                                {booking.booking_type === 'package' ? (
                                    <>
                                        <p>
                                            <span className="font-semibold text-gray-300">Package:</span>{' '}
                                            {booking.package_name || 'Unknown Package'} (ID:{' '}
                                            {editBookingId === booking.id ? (
                                                <input
                                                    type="number"
                                                    name="package_id"
                                                    value={editForm.package_id}
                                                    onChange={handleEditChange}
                                                    className="bg-gray-700 text-white border border-gray-400 rounded px-2 py-1 w-20"
                                                    min="1"
                                                />
                                            ) : (
                                                booking.package_id
                                            )}
                                            )
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p><span className="font-semibold text-gray-300">From:</span>{' '}
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
                                        <p><span className="font-semibold text-gray-300">To:</span>{' '}
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
                                        <p><span className="font-semibold text-gray-300">Hotel:</span>{' '}
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
                                <p><span className="font-semibold text-gray-300">Start Date:</span>{' '}
                                    {editBookingId === booking.id ? (
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={editForm.start_date}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={handleEditChange}
                                            className="bg-gray-700 text-white border border-gray-400 rounded px-2 py-1 w-full"
                                        />
                                    ) : (
                                        booking.start_date
                                    )}
                                </p>
                                <p><span className="font-semibold text-gray-300">End Date:</span>{' '}
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
                                <p><span className="font-semibold text-gray-300">Persons:</span>{' '}
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
                                <p><span className="font-semibold text-gray-300">Total Price:</span> ${booking.total_price}</p>
                                {booking.pending_changes && (
                                    <div>
                                        <span className="font-semibold text-gray-300">Pending Changes:</span>
                                        <ul className="list-disc pl-5">
                                            {Object.entries(booking.pending_changes).map(([key, value]) => (
                                                <li key={key}>{key}: {value}</li>
                                            ))}
                                        </ul>
                                    </div>
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


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { useUser } from '../../context/UserContext';

// function UserViewBookings() {
//     const { user, isAuthenticated } = useUser();
//     const [bookings, setBookings] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [editBookingId, setEditBookingId] = useState(null);
//     const [editForm, setEditForm] = useState({
//         start_date: '',
//         end_date: '',
//         persons: '',
//         from: '',
//         to: '',
//         hotel: ''
//     });

//     useEffect(() => {
//         if (!isAuthenticated || !user?.id) {
//             console.error('UserViewBookings: User is not authenticated or ID is missing');
//             toast.error('Please log in to view your bookings.');
//             setLoading(false);
//             return;
//         }
//         fetchBookings();
//     }, [user, isAuthenticated]);

//     const fetchBookings = async () => {
//         try {
//             const response = await axios.get(
//                 `http://localhost/WanderlustTrails/Backend/config/booking/getUserBooking.php?user_id=${user.id}`,
//                 { headers: { 'Content-Type': 'application/json' } }
//             );
//             console.log('Fetch bookings response:', response.data);
//             if (response.data.success) {
//                 setBookings(response.data.data);
//             } else {
//                 toast.error(response.data.message || 'Failed to fetch bookings');
//             }
//         } catch (error) {
//             console.error('Fetch bookings error:', error);
//             toast.error('Error fetching bookings: ' + (error.response?.data?.message || error.message));
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleCancelBooking = async (bookingId) => {
//         if (!confirm('Are you sure you want to cancel this booking?')) return;
//         try {
//             const response = await axios.post(
//                 'http://localhost/WanderlustTrails/Backend/config/booking/cancelBooking.php',
//                 { booking_id: bookingId, user_id: user.id },
//                 { headers: { 'Content-Type': 'application/json' } }
//             );
//             if (response.data.success) {
//                 fetchBookings(); // Refresh after cancellation
//                 toast.success('Booking canceled successfully!');
//             } else {
//                 toast.error(response.data.message);
//             }
//         } catch (error) {
//             toast.error('Error canceling booking: ' + (error.response?.data?.message || error.message));
//         }
//     };

//     const handleEditClick = (booking) => {
//         setEditBookingId(booking.id);
//         const newEditForm = {
//             start_date: booking.pending_changes?.start_date || booking.start_date,
//             end_date: booking.pending_changes?.end_date || booking.end_date,
//             persons: booking.pending_changes?.persons || booking.persons,
//             from: booking.pending_changes?.from || booking.flight_details?.from || '',
//             to: booking.pending_changes?.to || booking.flight_details?.to || '',
//             hotel: booking.pending_changes?.hotel || booking.hotel_details?.hotel || ''
//         };
//         setEditForm(newEditForm);
//         console.log('Edit form initialized:', newEditForm);
//     };

//     const handleEditChange = (e) => {
//         setEditForm({ ...editForm, [e.target.name]: e.target.value });
//     };

//     const handleEditSubmit = async (bookingId) => {
//         try {
//             const changes = {
//                 start_date: editForm.start_date,
//                 end_date: editForm.end_date,
//                 persons: editForm.persons,
//                 from: editForm.from,
//                 to: editForm.to,
//                 hotel: editForm.hotel
//             };
//             console.log('Submitting edit with changes:', changes);
//             const response = await axios.post(
//                 'http://localhost/WanderlustTrails/Backend/config/booking/editBooking.php',
//                 { booking_id: bookingId, user_id: user.id, changes },
//                 { headers: { 'Content-Type': 'application/json' } }
//             );
//             if (response.data.success) {
//                 setEditBookingId(null);
//                 toast.success('Edit request submitted and awaiting admin confirmation!');
//                 fetchBookings(); // Refresh after edit
//             } else {
//                 toast.error(response.data.message);
//             }
//         } catch (error) {
//             toast.error('Error updating booking: ' + (error.response?.data?.message || error.message));
//         }
//     };

//     if (loading) return <div className="text-center p-4 text-white">Loading bookings...</div>;

//     return (
//         <div className="max-w-6xl mx-auto p-6 bg-gray-700 rounded-lg shadow-md">
//             <h2 className="text-2xl font-semibold text-orange-600 text-center mb-6">My Bookings</h2>
//             {bookings.length === 0 ? (
//                 <p className="text-center text-gray-300">No bookings found.</p>
//             ) : (
//                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//                     {bookings.map((booking) => (
//                         <div
//                             key={booking.id}
//                             className="bg-gray-800 text-white rounded-lg shadow-lg p-6 relative border-l-4 border-orange-600"
//                         >
//                             <div className="flex justify-between items-center mb-4">
//                                 <h3 className="text-lg font-bold text-orange-600">
//                                     Booking #{booking.id}
//                                 </h3>
//                                 <span
//                                     className={`text-sm px-2 py-1 rounded-full ${
//                                         booking.status === 'confirmed'
//                                             ? 'bg-green-500'
//                                             : booking.status === 'pending'
//                                             ? 'bg-yellow-500'
//                                             : 'bg-red-500'
//                                     }`}
//                                 >
//                                     {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
//                                 </span>
//                             </div>

//                             <div className="space-y-2">
//                                 <p><span className="font-semibold text-gray-300">Type:</span> {booking.booking_type}</p>
//                                 {booking.booking_type === 'package' ? (
//                                     <p><span className="font-semibold text-gray-300">Package ID:</span> {booking.package_id}</p>
//                                 ) : (
//                                     <>
//                                         <p><span className="font-semibold text-gray-300">From:</span>{' '}
//                                             {editBookingId === booking.id ? (
//                                                 <input
//                                                     type="text"
//                                                     name="from"
//                                                     value={editForm.from}
//                                                     onChange={handleEditChange}
//                                                     className="bg-gray-700 text-white border border-gray-400 rounded px-2 py-1 w-full"
//                                                 />
//                                             ) : (
//                                                 booking.flight_details?.from || 'N/A'
//                                             )}
//                                         </p>
//                                         <p><span className="font-semibold text-gray-300">To:</span>{' '}
//                                             {editBookingId === booking.id ? (
//                                                 <input
//                                                     type="text"
//                                                     name="to"
//                                                     value={editForm.to}
//                                                     onChange={handleEditChange}
//                                                     className="bg-gray-700 text-white border border-gray-400 rounded px-2 py-1 w-full"
//                                                 />
//                                             ) : (
//                                                 booking.flight_details?.to || 'N/A'
//                                             )}
//                                         </p>
//                                         <p><span className="font-semibold text-gray-300">Hotel:</span>{' '}
//                                             {editBookingId === booking.id ? (
//                                                 <input
//                                                     type="text"
//                                                     name="hotel"
//                                                     value={editForm.hotel}
//                                                     onChange={handleEditChange}
//                                                     className="bg-gray-700 text-white border border-gray-400 rounded px-2 py-1 w-full"
//                                                 />
//                                             ) : (
//                                                 booking.hotel_details?.hotel || 'N/A'
//                                             )}
//                                         </p>
//                                     </>
//                                 )}
//                                 <p><span className="font-semibold text-gray-300">Start Date:</span>{' '}
//                                     {editBookingId === booking.id ? (
//                                         <input
//                                             type="date"
//                                             name="start_date"
//                                             value={editForm.start_date}
//                                             min={new Date().toISOString().split('T')[0]}
//                                             onChange={handleEditChange}
//                                             className="bg-gray-700 text-white border border-gray-400 rounded px-2 py-1 w-full"
//                                         />
//                                     ) : (
//                                         booking.start_date
//                                     )}
//                                 </p>
//                                 <p><span className="font-semibold text-gray-300">End Date:</span>{' '}
//                                     {editBookingId === booking.id ? (
//                                         <input
//                                             type="date"
//                                             name="end_date"
//                                             value={editForm.end_date}
//                                             onChange={handleEditChange}
//                                             className="bg-gray-700 text-white border border-gray-400 rounded px-2 py-1 w-full"
//                                         />
//                                     ) : (
//                                         booking.end_date
//                                     )}
//                                 </p>
//                                 <p><span className="font-semibold text-gray-300">Persons:</span>{' '}
//                                     {editBookingId === booking.id ? (
//                                         <input
//                                             type="number"
//                                             name="persons"
//                                             value={editForm.persons}
//                                             onChange={handleEditChange}
//                                             className="bg-gray-700 text-white border border-gray-400 rounded px-2 py-1 w-full"
//                                             min="1"
//                                         />
//                                     ) : (
//                                         booking.persons
//                                     )}
//                                 </p>
//                                 <p><span className="font-semibold text-gray-300">Total Price:</span> ${booking.total_price}</p>
//                                 {booking.pending_changes && (
//                                     <div>
//                                         <span className="font-semibold text-gray-300">Pending Changes:</span>
//                                         <ul className="list-disc pl-5">
//                                             {Object.entries(booking.pending_changes).map(([key, value]) => (
//                                                 <li key={key}>{key}: {value}</li>
//                                             ))}
//                                         </ul>
//                                     </div>
//                                 )}
//                             </div>

//                             {booking.status !== 'canceled' && (
//                                 <div className="mt-4 flex space-x-2">
//                                     <button
//                                         onClick={() => handleCancelBooking(booking.id)}
//                                         className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
//                                     >
//                                         Cancel
//                                     </button>
//                                     {editBookingId === booking.id ? (
//                                         <button
//                                             onClick={() => handleEditSubmit(booking.id)}
//                                             className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
//                                         >
//                                             Submit Edit
//                                         </button>
//                                     ) : (
//                                         <button
//                                             onClick={() => handleEditClick(booking)}
//                                             className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
//                                         >
//                                             Edit
//                                         </button>
//                                     )}
//                                 </div>
//                             )}
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }

// export default UserViewBookings;
