
//path: Wanderlusttrails/Frontend/WanderlustTrails/src/hooks/useBookings.js
import { useState, useEffect } from 'react';
import $ from 'jquery';
import { toast } from 'react-toastify';

const useBookings = (user, isAuthenticated) => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [paymentDetails, setPaymentDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState({});
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            setLoading(false);
            return;
        }
        fetchBookings();
    }, [user, isAuthenticated]);

    const fetchBookings = () => {
        if (!user?.id) {
            console.error("Cannot fetch bookings: user.id is missing");
            setLoading(false);
            return;
        }

        console.log("Fetching bookings for userId:", user.id);
        $.ajax({
            url: `http://localhost/WanderlustTrails/Backend/config/booking/getUserBooking.php?user_id=${user.id}`,
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                console.log("Fetched bookings:", response);
                if (response.success) {
                    if (response.data.length === 0) {
                        console.log("No bookings found for userId:", user.id);
                    }
                    const parsedBookings = response.data.map(booking => {
                        const flightDetails = typeof booking.flight_details === 'string' ? JSON.parse(booking.flight_details) : booking.flight_details || {};
                        const hotelDetails = typeof booking.hotel_details === 'string' ? JSON.parse(booking.hotel_details) : booking.hotel_details || {};
                        const pendingChanges = typeof booking.pending_changes === 'string' ? JSON.parse(booking.pending_changes) : booking.pending_changes || null;
                        return {
                            ...booking,
                            flight_details: flightDetails,
                            hotel_details: hotelDetails,
                            pending_changes: pendingChanges,
                            totalPrice: parseFloat(booking.total_price) || 0, // Map total_price to totalPrice

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
                    setBookings(parsedBookings);
                    setFilteredBookings(parsedBookings);
                    const initialPaymentLoading = {};
                    parsedBookings.forEach(booking => {
                        initialPaymentLoading[booking.id] = true;
                    });
                    setPaymentLoading(initialPaymentLoading);
                    if (parsedBookings.length > 0) {
                        console.log("Booking IDs to fetch payments for:", parsedBookings.map(b => b.id));
                        Promise.all(
                            parsedBookings.map(booking =>
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
                                newPaymentDetails[result.bookingId] = result.data;
                            });
                            setPaymentDetails(newPaymentDetails);
                            console.log("All payment details fetched:", newPaymentDetails);
                        });
                    } else {
                        setPaymentDetails({});
                        setPaymentLoading({});
                    }
                } else {
                    toast.error(response.message || 'Failed to fetch bookings');
                }
            },
            error: function (xhr) {
                console.error("Error fetching bookings:", xhr);
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

    const fetchPaymentDetails = (bookingId) => {
        console.log("Fetching payment details for bookingId:", bookingId);
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `http://localhost/WanderlustTrails/Backend/config/payment/getPaymentDetails.php?booking_id=${bookingId}`,
                type: 'GET',
                dataType: 'json',
                success: function (response) {
                    console.log(`Raw response for bookingId ${bookingId}:`, response);
                    if (response.success && response.data) {
                        console.log(`Payment details found for bookingId ${bookingId}:`, response.data);
                        resolve({ bookingId, data: response.data });
                    } else {
                        console.log(`No payment details for bookingId ${bookingId}:`, response.message || 'No data');
                        resolve({ bookingId, data: null });
                    }
                },
                error: function (xhr) {
                    console.error(`Error fetching payment details for bookingId ${bookingId}:`, xhr);
                    try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        console.log(`Error response for bookingId ${bookingId}:`, errorResponse);
                    } catch (e) {
                        console.log(`Error response text for bookingId ${bookingId}:`, xhr.responseText);
                    }
                    reject(xhr);
                }
            });
        });
    };

    const applyFilters = () => {
        console.log("Applying filters with status:", statusFilter);
        let filtered = [...bookings];
        if (statusFilter !== 'all') {
            filtered = filtered.filter(booking => booking.status === statusFilter);
        }
        filtered.sort((a, b) => {
            const statusOrder = { confirmed: 1, pending: 2, canceled: 3 };
            return statusOrder[a.status] - statusOrder[b.status];
        });
        console.log("Filtered and sorted bookings:", filtered);
        setFilteredBookings(filtered);
    };

    useEffect(() => {
        applyFilters();
    }, [statusFilter, bookings]);

    return {
        bookings,
        filteredBookings,
        paymentDetails,
        loading,
        paymentLoading,
        statusFilter,
        setStatusFilter,
        fetchBookings,
        applyFilters
    };
};

export default useBookings;