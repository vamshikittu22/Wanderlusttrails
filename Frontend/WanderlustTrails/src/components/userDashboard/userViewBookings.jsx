// Importing required dependencies and components
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import $ from 'jquery'; // Import jQuery for AJAX
import useBookings from '../../hooks/useBookings';
import { useUser } from '../../context/UserContext';
import EditBookingForm from './../forms/EditBookingForm';
import BookingCard from '../BookingCard';
import FilterSortBar from '../FilterSortBar';
import Pagination from './../Pagination';
import ViewDownloadTicket from './../ViewDownloadTicket';
import Popup from './../Popup';

// Custom hook to debounce a value (used in search input)
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler); // Clear timeout on cleanup
        };
    }, [value, delay]);

    return debouncedValue;
};

// Component to display the bookings header section
const BookingHeader = ({ totalBookings }) => (
    <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-semibold text-orange-600">Your Bookings</h1>
        </div>
        <div className="flex items-center space-x-4 mb-4">
            <div>
                <label className="text-gray-200 font-semibold mr-2">Total Bookings:</label>
                <span className="text-orange-500 font-bold w-full">{totalBookings}</span>
            </div>
        </div>
    </div>
);

// Component to render the search bar with debouncing
const SearchBar = ({ searchQuery, setSearchQuery, setCurrentPage }) => {
    const [inputValue, setInputValue] = useState(searchQuery);
    const debouncedSearchQuery = useDebounce(inputValue, 300);

    useEffect(() => {
        setSearchQuery(debouncedSearchQuery);
        setCurrentPage(1); // Reset to first page on search change
    }, [debouncedSearchQuery, setSearchQuery, setCurrentPage]);

    // Handler for updating search input
    const handleSearchChange = (e) => {
        setInputValue(e.target.value);
    };

    return (
        <div className="mb-4">
            <input
                type="text"
                placeholder="Search by Booking ID, Name, Package Name, or Transaction ID"
                value={inputValue}
                onChange={handleSearchChange}
                className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
};

// Component to render list of bookings using BookingCard
const BookingList = ({ currentBookings, paymentDetails, paymentLoading, handleViewTicket, handleEditClick, handleCancelClick, handleSendReminder }) => (
    <div className="grid grid-cols sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {currentBookings.map((booking) => (
            <BookingCard
                key={booking.id}
                booking={booking}
                paymentDetails={paymentDetails}
                paymentLoading={paymentLoading}
                onViewTicket={() => handleViewTicket(booking)}
                onEditClick={() => handleEditClick(booking)}
                onCancelClick={() => handleCancelClick(booking.id)}
                onSendReminder={() => handleSendReminder(booking.id)}
                isAdminView={false}
                disabled={!booking.status || booking.status !== 'confirmed'} // Disable View Ticket if not confirmed
            />
        ))}
    </div>
);

// Main component for displaying user bookings
const UserViewBookings = () => {
    const navigate = useNavigate(); // For programmatic navigation
    const { user, isAuthenticated } = useUser(); // Get user data from context

    // Local state declarations
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isViewPopupOpen, setIsViewPopupOpen] = useState(false);
    const [editBooking, setEditBooking] = useState(null);
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
    const [cancelBookingId, setCancelBookingId] = useState(null);
    const [isCancelPopupOpen, setIsCancelPopupOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredBookingsWithSearch, setFilteredBookingsWithSearch] = useState([]);

    const itemsPerPage = 6;

    // Redirect to login if user is not authenticated
    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            toast.error('Please log in to view your bookings.');
            navigate('/login');
        }
    }, [isAuthenticated, user, navigate]);

    // Prevent render if not authenticated
    if (!isAuthenticated || !user?.id) return null;

    // Custom hook to retrieve booking data
    const {
        bookings,
        paymentDetails,
        loading,
        paymentLoading,
        editBooking: handleEditSubmit,
        cancelBooking: handleCancelBooking
    } = useBookings(user, isAuthenticated);

    // Generate booking name based on booking type
    const getBookingName = (booking) => {
        if (booking.booking_type === 'package') return booking.package_name || 'Unnamed Package';
        if (booking.booking_type === 'itinerary') return booking.package_name || 'Custom Itinerary';
        const from = booking.flight_details?.from || 'Unknown';
        const to = booking.flight_details?.to || 'Unknown';
        const hotelName = booking.hotel_details?.name || 'Unknown Hotel';
        return `Flight from ${from} to ${to}, Hotel: ${hotelName}`;
    };

    // Filter bookings using the search query
    const searchedBookings = useMemo(() => {
        return bookings.filter((booking) => {
            const searchLower = searchQuery.toLowerCase();
            const bookingIdMatch = booking.id.toString().includes(searchLower);
            const bookingNameMatch = getBookingName(booking).toLowerCase().includes(searchLower);
            const packageNameMatch = (booking.booking_type === 'package' || booking.booking_type === 'itinerary') &&
                booking.package_name?.toLowerCase().includes(searchLower);
            const transactionIdMatch = paymentDetails[booking.id]?.transaction_id?.toLowerCase().includes(searchLower);
            return bookingIdMatch || bookingNameMatch || packageNameMatch || transactionIdMatch;
        });
    }, [bookings, searchQuery, paymentDetails]);

    // Predefined filter options
    const filterOptions = useMemo(() => [
        { key: 'status-all', label: 'All', filterFunction: () => true },
        { key: 'status-pending', label: 'Pending', filterFunction: booking => booking.status === 'pending' },
        { key: 'status-confirmed', label: 'Confirmed', filterFunction: booking => booking.status === 'confirmed' },
        { key: 'status-canceled', label: 'Canceled', filterFunction: booking => booking.status === 'canceled' },
    ], []);

    // Predefined sorting options
    const sortOptions = useMemo(() => [
        { key: 'id-asc', label: 'Booking ID (Asc)', sortFunction: (a, b) => a.id - b.id },
        { key: 'id-desc', label: 'Booking ID (Desc)', sortFunction: (a, b) => b.id - a.id },
        { key: 'totalPrice-asc', label: 'Total Price (Asc)', sortFunction: (a, b) => (a.total_price || 0) - (b.total_price || 0) },
        { key: 'totalPrice-desc', label: 'Total Price (Desc)', sortFunction: (a, b) => (b.total_price || 0) - (a.total_price || 0) },
        { key: 'createdAt-asc', label: 'Created At (Asc)', sortFunction: (a, b) => new Date(a.created_at) - new Date(b.created_at) },
        { key: 'createdAt-desc', label: 'Created At (Desc)', sortFunction: (a, b) => new Date(b.created_at) - new Date(a.created_at) },
    ], []);

    // Pagination calculations
    const totalItems = filteredBookingsWithSearch.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBookings = filteredBookingsWithSearch.slice(startIndex, endIndex);

    // View ticket handler with status check
    const handleViewTicket = (booking) => {
        if (!booking.status || booking.status !== 'confirmed') {
            toast.error('View Ticket is only available for confirmed bookings.', { autoClose: 3000 });
            return;
        }
        setSelectedBooking(booking);
        setIsViewPopupOpen(true);
    };

    // Edit booking handler
    const handleEditClick = (booking) => {
        setEditBooking(booking);
        setIsEditPopupOpen(true);
    };

    // Cancel booking handler
    const handleCancelClick = (bookingId) => {
        setCancelBookingId(bookingId);
        setIsCancelPopupOpen(true);
    };

    // Confirm cancellation handler
    const handleConfirmCancel = () => {
        if (cancelBookingId) {
            handleCancelBooking(cancelBookingId, () => {
                setIsCancelPopupOpen(false);
                setCancelBookingId(null);
            });
        }
    };

    // Send reminder handler
    const handleSendReminder = (bookingId) => {
        const currentBooking = bookings.find(b => b.id === bookingId);
        if (!currentBooking) {
            toast.error(`Booking #${bookingId} not found`);
            return;
        }

        const currentDate = new Date().toISOString().split('T')[0];
        const startDate = currentBooking.start_date;
        const endDate = currentBooking.end_date;

        if (startDate && startDate < currentDate) {
            toast.error('Cannot send reminder: Start date is in the past.');
            return;
        }
        if (endDate && endDate < currentDate) {
            toast.error('Cannot send reminder: End date is in the past.');
            return;
        }

        const payload = {
            bookingid: Number(bookingId),
            user_id: Number(user.id),
            userFullName: user.fullName || 'Guest',
            start_date: currentBooking.start_date,
            end_date: currentBooking.end_date
        };

            console.log("Debug Send Reminder Initiated", bookingId, payload);

        $.ajax({
            url: 'http://localhost/WanderlustTrails/Backend/config/booking/sendBookingReminder.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            dataType: 'json',
            timeout: 10000, // 10 seconds timeout
            success: function (response) {
                            console.log("✅ Server response received:", response);

                if (response && response.success) {
                toast.success("✅ Reminder sent successfully!");
            } else if (response && response.message) {
                console.error("❌ Server returned error:", response.message);
                toast.error(response.message);
            } else {
                toast.error("Unknown server response");
            }
            },
            error: function(xhr, status, error) {
            console.error("❌ AJAX Error:", { 
                status: xhr.status, 
                statusText: xhr.statusText,
                error: error,
                responseText: xhr.responseText 
            });

            let errorMessage = "";

            // Handle different HTTP status codes
            switch(xhr.status) {
                case 400:
                    errorMessage = "Bad Request: ";
                    break;
                case 404:
                    errorMessage = "Not Found: ";
                    break;
                case 500:
                    errorMessage = "Server Error: ";
                    break;
                default:
                    errorMessage = `HTTP ${xhr.status}: `;
            }

            // Try to parse JSON error response
            try {
                const response = JSON.parse(xhr.responseText);
                if (response.message) {
                    errorMessage += response.message;
                } else {
                    errorMessage += "Unknown error";
                }
            } catch (parseError) {
                // If JSON parsing fails, use status text
                errorMessage += xhr.statusText || "Unable to parse server response";
            }

            console.error("❌ Final error message:", errorMessage);
            toast.error(errorMessage);
        }
    });
    };

    // Close view popup
    const handleCloseViewPopup = () => {
        setIsViewPopupOpen(false);
        setSelectedBooking(null);
    };

    // Close edit popup
    const handleCloseEditPopup = () => {
        setIsEditPopupOpen(false);
        setEditBooking(null);
    };

    // Show loading while fetching bookings
    if (loading) return <div className="text-center text-gray-600">Loading bookings...</div>;

    // Render main UI
    return (
        <div className="max-w-6xl mx-auto p-4 bg-gray-700 shadow-md rounded-lg">
            <BookingHeader totalBookings={filteredBookingsWithSearch.length} />
            <FilterSortBar
                items={searchedBookings}
                setFilteredItems={setFilteredBookingsWithSearch}
                filterOptions={filterOptions}
                sortOptions={sortOptions}
            />
            <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} setCurrentPage={setCurrentPage} />
            <div className="relative">
                {filteredBookingsWithSearch.length === 0 ? (
                    <p className="text-center text-gray-600">No bookings found.</p>
                ) : (
                    <>
                        <BookingList
                            currentBookings={currentBookings}
                            paymentDetails={paymentDetails}
                            paymentLoading={paymentLoading}
                            handleViewTicket={handleViewTicket}
                            handleEditClick={handleEditClick}
                            handleCancelClick={handleCancelClick}
                            handleSendReminder={handleSendReminder}
                        />
                        <Pagination
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </>
                )}

                {/* View Ticket Popup */}
                {isViewPopupOpen && selectedBooking && (
                    <Popup isOpen={isViewPopupOpen} onClose={handleCloseViewPopup}>
                        <ViewDownloadTicket
                            booking={selectedBooking}
                            paymentDetails={paymentDetails}
                            paymentLoading={paymentLoading}
                        />
                    </Popup>
                )}

                {/* Edit Booking Popup */}
                {isEditPopupOpen && editBooking && (
                    <Popup isOpen={isEditPopupOpen} onClose={handleCloseEditPopup}>
                        <EditBookingForm
                            booking={editBooking}
                            user={user}
                            navigate={navigate}
                            onSubmit={(bookingId, payload) =>
                                handleEditSubmit(bookingId, payload, () => {
                                    // ✅ FIX: Wait a bit for fetchBookings to complete
                                    setTimeout(() => {
                                        setIsEditPopupOpen(false);
                                        setEditBooking(null);
                                    }, 500); // 500ms delay to ensure refetch completes
                                                })
                            }
                            onCancel={() => setIsEditPopupOpen(false)}
                            fullWidth={true}
                            relativePosition={true}
                        />
                    </Popup>
                )}

                {/* Cancel Booking Confirmation Popup */}
                <Popup isOpen={isCancelPopupOpen} onClose={() => setIsCancelPopupOpen(false)}>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Cancellation</h2>
                    <p className="text-gray-600 mb-6">Are you sure you want to cancel Booking #{cancelBookingId}?</p>
                    <div className="flex space-x-4">
                        <button
                            onClick={handleConfirmCancel}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                        >
                            Yes, Cancel
                        </button>
                        <button
                            onClick={() => setIsCancelPopupOpen(false)}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                        >
                            No
                        </button>
                    </div>
                </Popup>
            </div>
        </div>
    );
};

export default UserViewBookings;