import React, { useState, useEffect, useMemo } from 'react'; // Import React hooks and core functionality
import $ from 'jquery'; // Import jQuery for AJAX requests
import { toast } from 'react-toastify'; // Import toast notification library
import useBookings from '../../hooks/useBookings'; // Custom hook for bookings
import { useUser } from '../../context/UserContext'; // Import User context for authentication
import BookingCard from '../BookingCard'; // Import BookingCard component
import FilterSortBar from '../FilterSortBar'; // Import filter and sort component
import Pagination from './../Pagination'; // Import pagination component

const useDebounce = (value, delay) => { // Custom hook for debouncing
    const [debouncedValue, setDebouncedValue] = useState(value); // State for debounced value

    useEffect(() => { // Effect to handle debouncing
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}; // Return debounced value

function ManageBookings() {
    const { user, isAuthenticated } = useUser(); // Get user and authentication status from context
    const [searchQuery, setSearchQuery] = useState(''); // State for search query
    const [currentPage, setCurrentPage] = useState(1); // State for current page in pagination
    const [updatingStatus, setUpdatingStatus] = useState(false); // State for updating status
    const [filteredBookingsWithSearch, setFilteredBookingsWithSearch] = useState([]); // State for filtered bookings
    const itemsPerPage = 6; // Number of items per page in pagination

    const debouncedSearchQuery = useDebounce(searchQuery, 300); // Debounce the search query to avoid excessive re-renders

    const {
        bookings,
        filteredBookings,
        paymentDetails,
        paymentLoading,
        loading,
        fetchBookings
    } = useBookings(user, isAuthenticated, true); // Fetch bookings and payment details

    // This function generates a searchable string from the booking object
    const getSearchableText = (booking) => {
        const fields = [
            booking.id.toString(),
            booking.userFullName || '',
            booking.booking_type || '',
            booking.start_date || '',
            booking.end_date || '',
            booking.total_price?.toString() || '',
            booking.status || '',
            booking.persons?.toString() || '',
            booking.created_at || '',
            booking.insurance || '',
            booking.insurance_type || '',
            ...(booking.booking_type === 'package' ? [
                booking.package_id?.toString() || '',
                booking.package_name || ''
            ] : []),
            ...(booking.flight_details ? [
                booking.flight_details.from || '',
                booking.flight_details.to || '',
                booking.flight_details.airline || '',
                booking.flight_details.class || '',
                booking.flight_details.preferred_time || '',
            ] : []),
            ...(booking.hotel_details ? [
                booking.hotel_details.name || '',
                booking.hotel_details.star_rating?.toString() || '',
                ...(booking.hotel_details.amenities
                    ? Object.entries(booking.hotel_details.amenities)
                        .filter(([_, value]) => value)
                        .map(([key]) => key)
                    : []),
                booking.hotel_details.car_rental ? 'yes' : 'no'
            ] : []),
            ...(paymentDetails[booking.id] ? [
                paymentDetails[booking.id].transaction_id || '',
                paymentDetails[booking.id].payment_method || '',
                paymentDetails[booking.id].payment_status || '',
                paymentDetails[booking.id].payment_date || ''
            ] : []),
            ...(booking.pending_changes
                ? Object.entries(booking.pending_changes).flatMap(([key, value]) => [
                    key,
                    value?.toString() || ''
                ])
                : [])
        ]; // Create an array of fields to be searched

        return fields
            .filter(field => field !== null && field !== undefined)
            .map(field => field.toString().toLowerCase())
            .join(' ');
    }; // Generate a searchable string by joining all fields with spaces

    const searchedBookings = useMemo(() => { // Memoize the searched bookings to avoid unnecessary re-computation
        console.log('[Debug] Debounced Search Query:', debouncedSearchQuery); // Debug search query
        return filteredBookings.filter(booking => {
            if (!debouncedSearchQuery) return true;
            const searchLower = debouncedSearchQuery.toLowerCase();
            const searchableText = getSearchableText(booking);
            console.log('[Debug] Searching:', { bookingId: booking.id, searchableText, searchLower }); // Debug search process
            return searchableText.includes(searchLower);
        });
    }, [filteredBookings, debouncedSearchQuery, paymentDetails]); // Filter bookings based on the debounced search query

    // Define filter options for bookings with useMemo to avoid re-computation
    const filterOptions = useMemo(() => [
        {
            key: 'status-all',
            label: 'All',
            filterFunction: () => true
        },
        {
            key: 'status-pending',
            label: 'Pending',
            filterFunction: booking => booking.status === 'pending'
        },
        {
            key: 'status-confirmed',
            label: 'Confirmed',
            filterFunction: booking => booking.status === 'confirmed'
        },
        {
            key: 'status-canceled',
            label: 'Canceled',
            filterFunction: booking => booking.status === 'canceled'
        }
    ], []);

    // Define sort options for bookings with useMemo to avoid re-computation
    const sortOptions = useMemo(() => [
        {
            key: 'id-asc',
            label: 'Booking ID (Asc)',
            sortFunction: (a, b) => a.id - b.id
        },
        {
            key: 'id-desc',
            label: 'Booking ID (Desc)',
            sortFunction: (a, b) => b.id - a.id
        },
        {
            key: 'totalPrice-asc',
            label: 'Total Price (Asc)',
            sortFunction: (a, b) => (a.total_price || 0) - (b.total_price || 0)
        },
        {
            key: 'totalPrice-desc',
            label: 'Total Price (Desc)',
            sortFunction: (a, b) => (b.total_price || 0) - (a.total_price || 0)
        },
        {
            key: 'createdAt-asc',
            label: 'Created At (Asc)',
            sortFunction: (a, b) => new Date(a.created_at) - new Date(b.created_at)
        },
        {
            key: 'createdAt-desc',
            label: 'Created At (Desc)',
            sortFunction: (a, b) => new Date(b.created_at) - new Date(a.created_at)
        },
        {
            key: 'userName-asc',
            label: 'User Name (A-Z)',
            sortFunction: (a, b) => (a.userFullName || '').localeCompare(b.userFullName || '')
        },
        {
            key: 'userName-desc',
            label: 'User Name (Z-A)',
            sortFunction: (a, b) => (b.userFullName || '').localeCompare(a.userFullName || '')
        }
    ], []);

    const totalItems = filteredBookingsWithSearch.length; // Total number of items after filtering and searching
    const startIndex = (currentPage - 1) * itemsPerPage; // Calculate the start index for pagination
    const endIndex = startIndex + itemsPerPage; // Calculate the end index for pagination
    const currentBookings = filteredBookingsWithSearch.slice(startIndex, endIndex); // Get the current bookings for the current page

    // Function to handle status change of booking
    const handleStatusChange = (bookingId, newStatus) => {
        if (!confirm(`Are you sure you want to change the status to ${newStatus}?`)) return; // Confirm status change

        setUpdatingStatus(true);
        const currentBooking = bookings.find(b => b.id === bookingId); // Find the current booking by ID
        if (!currentBooking) {
            toast.error(`Booking #${bookingId} not found`);
            setUpdatingStatus(false);
            return; // Check if booking exists
        }

        const currentDate = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD
        const startDate = currentBooking.start_date;
        const endDate = currentBooking.end_date;

        console.log('[Debug] Date Check:', { currentDate, startDate, endDate }); // Debug date comparison

        if (startDate && startDate < currentDate) {
            toast.error('Cannot change status: Start date is in the past.');
            setUpdatingStatus(false);
            return;
        }
        if (endDate && endDate < currentDate) {
            toast.error('Cannot change status: End date is in the past.');
            setUpdatingStatus(false);
            return;
        }

        const oldPrice = currentBooking.total_price; // Store the old price for comparison
        const userId = currentBooking.user_id; // Get the user ID from the booking
        const pendingChanges = currentBooking.pending_changes || {}; // Get the pending changes from the booking

        console.log('[Debug] Status Change Initiated:', { bookingId, newStatus, userId, pendingChanges }); // Debug initiation

        const formattedPendingChanges = { ...pendingChanges }; // Create a copy of pending changes to avoid mutating the original object
        if (pendingChanges.startDate) {
            formattedPendingChanges.start_date = new Date(pendingChanges.startDate).toISOString().split('T')[0];
            delete formattedPendingChanges.startDate;
        } // Format the start date to YYYY-MM-DD
        if (pendingChanges.endDate) {
            formattedPendingChanges.end_date = new Date(pendingChanges.endDate).toISOString().split('T')[0];
            delete formattedPendingChanges.endDate;
        } // Format the end date to YYYY-MM-DD

        if (!Number.isInteger(Number(bookingId)) || !Number.isInteger(Number(userId))) {
            toast.error('Invalid booking ID or user ID');
            setUpdatingStatus(false);
            return;
        } // Check if booking ID and user ID are valid integers
        if (!['pending', 'confirmed', 'canceled'].includes(newStatus)) {
            toast.error('Invalid status selected');
            setUpdatingStatus(false);
            return;
        } // Check if the new status is valid

        const payload = {
            booking_id: Number(bookingId),
            status: newStatus,
            user_id: Number(userId),
            pending_changes: formattedPendingChanges,
        }; // Create the payload for the AJAX request

        console.log('[Debug] AJAX Payload:', payload); // Debug payload

        // Send AJAX request to update booking status and pending changes
        $.ajax({
            url: 'http://localhost/WanderlustTrails/Backend/config/booking/updateBookingStatus.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            dataType: 'json',
            success: function (response) { // Handle successful response
                console.log('[Debug] AJAX Success Response:', response); // Debug response
                if (response.success) {
                    if (response.message === "Status unchanged") {
                        toast.info("Status is already " + newStatus);
                    } else {
                        toast.success('Booking status and pending changes updated successfully!');
                        fetchBookings();
                        const updatedBooking = bookings.find(b => b.id === bookingId);
                        const newPrice = updatedBooking ? updatedBooking.total_price : oldPrice;
                        if (newPrice !== oldPrice) {
                            const priceChange = newPrice - oldPrice;
                            toast.info(`Price updated: ${priceChange >= 0 ? '+' : ''}$${priceChange.toFixed(2)} (New total: $${newPrice.toFixed(2)})`);
                        }
                    }
                } else { // Handle error response
                    console.error('[Debug] AJAX Error Response:', response.message); // Debug error
                    toast.error(response.message || 'Failed to update booking status or pending changes');
                }
            },
            error: function (xhr) { // Handle AJAX error
                console.error('[Debug] AJAX Error:', xhr); // Debug error details
                let errorMessage = `Error updating booking status: ${xhr.status} ${xhr.statusText}`;
                try {
                    const response = JSON.parse(xhr.responseText);
                    errorMessage += ` - ${response.message || 'Server error'}`;
                    console.log('[Debug] Parsed Error Response:', response); // Debug parsed response
                } catch (e) {
                    errorMessage += ' - Unable to parse server response';
                    console.error('[Debug] Parse Error:', e); // Debug parse failure
                }
                toast.error(errorMessage);
            },
            complete: function () {
                console.log('[Debug] AJAX Complete:', { bookingId, newStatus }); // Debug completion
                setUpdatingStatus(false);
            }
        });
    };

    // Function to handle sending a booking reminder
    const handleSendReminder = (bookingId) => {
        const currentBooking = bookings.find(b => b.id === bookingId);
        if (!currentBooking) {
            toast.error(`Booking #${bookingId} not found`);
            return;
        }

        const payload = {
            booking_id: Number(bookingId),
            user_id: Number(currentBooking.user_id),
            userFullName: currentBooking.userFullName,
            start_date: currentBooking.start_date,
            end_date: currentBooking.end_date
        };

        console.log('[Debug] Send Reminder Initiated:', { bookingId, payload }); // Debug initiation

        $.ajax({
            url: 'http://localhost/WanderlustTrails/Backend/config/booking/sendBookingReminder.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            dataType: 'json',
            success: function (response) {
                console.log('[Debug] Send Reminder Response:', response); // Debug response
                if (response.success) {
                    toast.success('Reminder sent successfully!');
                } else {
                    console.error('[Debug] Send Reminder Error:', response.message); // Debug error
                    toast.error(response.message || 'Failed to send reminder');
                }
            },
            error: function (xhr) {
                console.error('[Debug] Send Reminder AJAX Error:', xhr); // Debug error
                let errorMessage = `Error sending reminder: ${xhr.status} ${xhr.statusText}`;
                try {
                    const response = JSON.parse(xhr.responseText);
                    errorMessage += ` - ${response.message || 'Server error'}`;
                    console.log('[Debug] Parsed Send Reminder Error:', response); // Debug parsed response
                } catch (e) {
                    errorMessage += ' - Unable to parse server response';
                    console.error('[Debug] Parse Send Reminder Error:', e); // Debug parse failure
                }
                toast.error(errorMessage);
            }
        });
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    if (loading) {
        return <div className="text-center p-4 text-white">Loading bookings...</div>; // Show loading message while fetching bookings
    }

    return (
        <div className="max-w-7xl mx-auto p-6 bg-gray-700 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <h1 className="text-3xl font-semibold text-orange-600">Manage Bookings</h1>
                </div>
                <div className="flex items-center space-x-4 mb-4">
                    <div>
                        <label className="text-gray-300 font-semibold mr-2">Total Bookings:</label>
                        <span className="text-orange-500 font-bold w-full">
                            {filteredBookingsWithSearch.length}
                        </span>
                    </div>
                </div>
            </div>

            <FilterSortBar
                items={searchedBookings}
                setFilteredItems={setFilteredBookingsWithSearch}
                filterOptions={filterOptions}
                sortOptions={sortOptions}
            />

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search by Booking ID, Full Name, Status, Type, Dates, Insurance, Flight Details, Hotel Details, Transaction ID, etc."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {filteredBookingsWithSearch.length === 0 ? (
                <p className="text-center text-gray-300">No bookings found.</p>
            ) : (
                <>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                        {currentBookings.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                paymentDetails={paymentDetails}
                                paymentLoading={paymentLoading}
                                onStatusChange={handleStatusChange}
                                onSendReminder={handleSendReminder}
                                updatingStatus={updatingStatus}
                                isAdminView={true}
                            />
                        ))}
                    </div>

                    <Pagination
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </>
            )}
        </div>
    );
}

export default ManageBookings;