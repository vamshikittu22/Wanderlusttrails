// path : Frontend/WanderlustTrails/src/hooks/useBookings.js

import { useState, useEffect } from 'react';
import $ from 'jquery';
import { toast } from 'react-toastify';

// Custom hook to manage bookings (fetch, filter, edit, cancel)
const useBookings = (user, isAuthenticated, fetchAll = false) => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [paymentDetails, setPaymentDetails] = useState({});
    const [paymentLoading, setPaymentLoading] = useState({});
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');

    // Helper: Convert raw booking data into structured format
    const parseBookingDetails = (booking) => {
        const flightDetails = typeof booking.flight_details === 'string' ? JSON.parse(booking.flight_details) : booking.flight_details || {};
        const hotelDetails = typeof booking.hotel_details === 'string' ? JSON.parse(booking.hotel_details) : booking.hotel_details || {};
        const amenities = typeof hotelDetails.amenities === 'object' && hotelDetails.amenities !== null
            ? hotelDetails.amenities
            : { pool: false, wifi: false };
        const parsedHotelDetails = { ...hotelDetails, amenities };
        const pendingChanges = typeof booking.pending_changes === 'string' ? JSON.parse(booking.pending_changes) : booking.pending_changes || null;

        return {
            ...booking,
            flight_details: flightDetails,
            hotel_details: parsedHotelDetails,
            pending_changes: pendingChanges,
            userFullName: `${booking.firstName || ''} ${booking.lastName || ''}`.trim(),
            totalPrice: parseFloat(booking.total_price) || 0,
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
    };

    // On mount or auth/user change, fetch bookings
    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            setLoading(false);
            return;
        }
        fetchBookings();
    }, [user, isAuthenticated, fetchAll]);

    // Fetch user or all bookings from backend
    const fetchBookings = () => {
        if (!user?.id) {
            console.error("Cannot fetch bookings: user.id is missing");
            setLoading(false);
            return;
        }

        const url = fetchAll
            ? 'http://localhost/WanderlustTrails/Backend/config/booking/getAllBookings.php'
            : `http://localhost/WanderlustTrails/Backend/config/booking/getUserBooking.php?user_id=${user.id}`;

        $.ajax({
            url,
            type: 'GET',
            dataType: 'json',
            contentType: fetchAll ? 'application/json' : undefined,

            // On successful response
            success: function (response) {
                if (response.success) {
                    const parsedBookings = response.data.map(parseBookingDetails);
                    const sortedBookings = parsedBookings.sort((a, b) => a.id - b.id); // Sort by ID
                    setBookings(sortedBookings);
                    setFilteredBookings(sortedBookings);

                    const initialPaymentLoading = {};
                    sortedBookings.forEach(booking => {
                        initialPaymentLoading[booking.id] = true;
                    });
                    setPaymentLoading(initialPaymentLoading);

                    // Fetch payment info for each booking
                    if (sortedBookings.length > 0) {
                        Promise.all(
                            sortedBookings.map(booking =>
                                fetchPaymentDetails(booking.id).then(result => {
                                    setPaymentLoading(prev => ({ ...prev, [booking.id]: false }));
                                    return result;
                                }).catch(error => {
                                    console.error(`Failed to fetch payment for bookingId ${booking.id}:`, error);
                                    setPaymentLoading(prev => ({ ...prev, [booking.id]: false }));
                                    return { bookingId: booking.id, data: null };
                                })
                            )
                        ).then(results => {
                            const newPaymentDetails = {};
                            results.forEach(result => {
                                if (result.data && result.data.length > 0) {
                                    newPaymentDetails[result.bookingId] = result.data[result.data.length - 1]; // Latest payment
                                }
                            });
                            setPaymentDetails(newPaymentDetails);
                        });
                    } else {
                        setPaymentDetails({});
                        setPaymentLoading({});
                    }
                } else {
                    toast.error(response.message || 'Failed to fetch bookings');
                }
            },

            // On error response
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

    // Fetch payment details for given booking ID
    const fetchPaymentDetails = (bookingId) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `http://localhost/WanderlustTrails/Backend/config/payment/getPaymentDetails.php?booking_id=${bookingId}`,
                type: 'GET',
                dataType: 'json',
                success: function (response) {
                    if (response.success && response.data) {
                        resolve({ bookingId, data: response.data });
                    } else {
                        resolve({ bookingId, data: null });
                    }
                },
                error: function (xhr) {
                    reject(xhr);
                }
            });
        });
    };

    // Edit an existing booking
    const editBooking = (bookingId, payload, callback) => {
        if (!payload || !payload.booking_id || !payload.user_id || !payload.changes || Object.keys(payload.changes).length === 0) {
            toast.error('Invalid submission data');
            return;
        }

        $.ajax({
            url: 'http://localhost/WanderlustTrails/Backend/config/booking/editBooking.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    toast.success(response.message);
                    fetchBookings(); // Refresh bookings
                    if (callback) callback(); // Run callback if given
                } else {
                    toast.error(response.message);
                }
            },
            error: function (xhr) {
                let errorMessage = `Error updating booking: ${xhr.status} ${xhr.statusText}`;
                try {
                    const response = JSON.parse(xhr.responseText);
                    errorMessage += ` - ${response.message || 'Server error'}`;
                } catch (e) {
                    errorMessage += ' - Unable to parse server response';
                }
                toast.error(errorMessage);
            }
        });
    };

    // Cancel a booking
    const cancelBooking = (bookingId, callback) => {
        $.ajax({
            url: 'http://localhost/WanderlustTrails/Backend/config/booking/cancelBooking.php',
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({ booking_id: bookingId, user_id: user.id }),
            success: function (response) {
                if (response.success) {
                    toast.success('Booking canceled successfully!');
                    fetchBookings(); // Refresh after cancel
                    if (callback) callback();
                } else {
                    toast.error(response.message || 'Failed to cancel booking.');
                }
            },
            error: function (xhr) {
                let errorMessage = 'Failed to cancel booking: Server error';
                try {
                    const response = JSON.parse(xhr.responseText);
                    errorMessage = response.message || 'Server error';
                } catch (e) {
                    errorMessage = xhr.statusText || 'Server error';
                }
                toast.error(errorMessage);
            }
        });
    };

    // Filter bookings based on status
    const applyFilters = () => {
        let filtered = [...bookings];
        if (statusFilter !== 'all') {
            filtered = filtered.filter(booking => booking.status === statusFilter);
        }
        setFilteredBookings(filtered);
    };

    useEffect(() => {
        applyFilters(); // Apply filters whenever bookings or filter value changes
    }, [statusFilter, bookings]);

    return {
        bookings,
        filteredBookings,
        paymentDetails,
        paymentLoading,
        loading,
        statusFilter,
        setStatusFilter,
        fetchBookings,
        applyFilters,
        editBooking,
        cancelBooking
    };
};

export default useBookings;
