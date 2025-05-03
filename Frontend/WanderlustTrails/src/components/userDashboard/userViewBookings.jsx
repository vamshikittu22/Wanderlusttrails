import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useBookings from '../../hooks/useBookings';
import { useUser } from '../../context/UserContext';
import EditBookingForm from './../forms/EditBookingForm';
import BookingCard from '../BookingCard';
import FilterSortBar from '../FilterSortBar';
import Pagination from './../Pagination';
import ViewDownloadTicket from './../ViewDownloadTicket';
import Popup from './../Popup';

// Custom hook for debouncing
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Header component for the main page
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

// Search Bar component with debouncing
const SearchBar = ({ searchQuery, setSearchQuery, setCurrentPage }) => {
    const [inputValue, setInputValue] = useState(searchQuery);
    const debouncedSearchQuery = useDebounce(inputValue, 300);

    useEffect(() => {
        setSearchQuery(debouncedSearchQuery);
        setCurrentPage(1);
    }, [debouncedSearchQuery, setSearchQuery, setCurrentPage]); // Update search query and reset page when input changes

    //handleSearchChange function to handle search input changes
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

// Booking List component
const BookingList = ({ currentBookings, paymentDetails, paymentLoading, handleViewTicket, handleEditClick, handleCancelClick }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentBookings.map((booking) => (
            <BookingCard
                key={booking.id}
                booking={booking}
                paymentDetails={paymentDetails}
                paymentLoading={paymentLoading}
                onViewTicket={handleViewTicket}
                onEditClick={handleEditClick}
                onCancelClick={handleCancelClick}
                isAdminView={false}
            />
        ))}
    </div>
);

// Main UserViewBookings component
const UserViewBookings = () => {
    const navigate = useNavigate(); // Use useNavigate to navigate
    const { user, isAuthenticated } = useUser(); // Get user and authentication status from context
    const [selectedBooking, setSelectedBooking] = useState(null); // State to manage selected booking for viewing
    const [isViewPopupOpen, setIsViewPopupOpen] = useState(false);  // State to manage view ticket popup
    const [editBooking, setEditBooking] = useState(null); // State to manage booking for editing
    const [isEditPopupOpen, setIsEditPopupOpen] = useState(false); // State to manage edit booking popup
    const [cancelBookingId, setCancelBookingId] = useState(null); // State to manage booking ID for cancellation
    const [isCancelPopupOpen, setIsCancelPopupOpen] = useState(false); // State to manage cancel booking popup
    const [searchQuery, setSearchQuery] = useState(''); // State to manage search query
    const [currentPage, setCurrentPage] = useState(1); // State to manage current page for pagination
    const [filteredBookingsWithSearch, setFilteredBookingsWithSearch] = useState([]); // State to manage filtered bookings with search
    const itemsPerPage = 6; // Number of items to display per page

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            toast.error('Please log in to view your bookings.');
            navigate('/login');
        }
    }, [isAuthenticated, user, navigate]); // Redirect to login if not authenticated

    if (!isAuthenticated || !user?.id) return null;

    const { 
        bookings, 
        paymentDetails, 
        loading, 
        paymentLoading, 
        editBooking: handleEditSubmit, 
        cancelBooking: handleCancelBooking 
    } = useBookings(user, isAuthenticated); // Custom hook to fetch bookings and payment details

    // Function to get booking name based on booking type
    const getBookingName = (booking) => {
        if (booking.booking_type === 'package') return booking.package_name || 'Unnamed Package';
        if (booking.booking_type === 'itinerary') return booking.package_name || 'Custom Itinerary';
        const from = booking.flight_details?.from || 'Unknown';
        const to = booking.flight_details?.to || 'Unknown';
        const hotelName = booking.hotel_details?.name || 'Unknown Hotel';
        return `Flight from ${from} to ${to}, Hotel: ${hotelName}`;
    };

//Memoized function to filter bookings based on search query
    const searchedBookings = useMemo(() => { 
        return bookings.filter((booking) => {
            const searchLower = searchQuery.toLowerCase();
            const bookingIdMatch = booking.id.toString().includes(searchLower);
            const bookingNameMatch = getBookingName(booking).toLowerCase().includes(searchLower);
            const packageNameMatch = (booking.booking_type === 'package' || booking.booking_type === 'itinerary') && booking.package_name
                ? booking.package_name.toLowerCase().includes(searchLower)
                : false;
            const transactionIdMatch = paymentDetails[booking.id]?.transaction_id?.toLowerCase().includes(searchLower) || false;
            return bookingIdMatch || bookingNameMatch || packageNameMatch || transactionIdMatch; // return true if any of the conditions match
        }); //
    }, [bookings, searchQuery, paymentDetails]); 

    //filteroptions and sortOptions for filter and sort functionality
    const filterOptions = useMemo(() => [
        { key: 'status-all', label: 'All', filterFunction: () => true },
        { key: 'status-pending', label: 'Pending', filterFunction: booking => booking.status === 'pending' },
        { key: 'status-confirmed', label: 'Confirmed', filterFunction: booking => booking.status === 'confirmed' },
        { key: 'status-canceled', label: 'Canceled', filterFunction: booking => booking.status === 'canceled' },
    ], []);

    const sortOptions = useMemo(() => [
        { key: 'id-asc', label: 'Booking ID (Asc)', sortFunction: (a, b) => a.id - b.id },
        { key: 'id-desc', label: 'Booking ID (Desc)', sortFunction: (a, b) => b.id - a.id },
        { key: 'totalPrice-asc', label: 'Total Price (Asc)', sortFunction: (a, b) => (a.total_price || 0) - (b.total_price || 0) },
        { key: 'totalPrice-desc', label: 'Total Price (Desc)', sortFunction: (a, b) => (b.total_price || 0) - (a.total_price || 0) },
        { key: 'createdAt-asc', label: 'Created At (Asc)', sortFunction: (a, b) => new Date(a.created_at) - new Date(b.created_at) },
        { key: 'createdAt-desc', label: 'Created At (Desc)', sortFunction: (a, b) => new Date(b.created_at) - new Date(a.created_at) },
    ], []);

    //pagination 
    const totalItems = filteredBookingsWithSearch.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBookings = filteredBookingsWithSearch.slice(startIndex, endIndex);
    

    //handleviewticket function to handle viewing ticket details
    const handleViewTicket = (booking) => {
        setSelectedBooking(booking);
        setIsViewPopupOpen(true);
    };

    //handleEditClick function to handle editing booking details
    const handleEditClick = (booking) => {
        setEditBooking(booking);
        setIsEditPopupOpen(true);
    };

    //handleCancelClick function to handle booking cancellation
    const handleCancelClick = (bookingId) => {
        setCancelBookingId(bookingId);
        setIsCancelPopupOpen(true);
    };

    //handleConfirmCancel function to handle booking cancellation
    const handleConfirmCancel = () => {
        if (cancelBookingId) {
            handleCancelBooking(cancelBookingId, () => {
                setIsCancelPopupOpen(false);
                setCancelBookingId(null);
            });
        }
    };

    // Reset popup states when closing to ensure data consistency
    const handleCloseViewPopup = () => {
        setIsViewPopupOpen(false);
        setSelectedBooking(null);
    };
    
    //handleCloseEditPopup function to handle closing edit booking popup
    const handleCloseEditPopup = () => {
        setIsEditPopupOpen(false);
        setEditBooking(null);
    };

    // looding state to show loading message
    if (loading) return <div className="text-center text-gray-600">Loading bookings...</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 bg-gray-700 shadow-md rounded-lg">
            <BookingHeader totalBookings={filteredBookingsWithSearch.length} />
            <FilterSortBar items={searchedBookings} setFilteredItems={setFilteredBookingsWithSearch} filterOptions={filterOptions} sortOptions={sortOptions} />
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
                        />
                        <Pagination totalItems={totalItems} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={(page) => setCurrentPage(page)} />
                    </>
                )}
                {/* Ticket View Popup - Only render when both isOpen and selectedBooking are valid */}
                {isViewPopupOpen && selectedBooking && (
                    <Popup isOpen={isViewPopupOpen} onClose={handleCloseViewPopup}>
                        <ViewDownloadTicket booking={selectedBooking} paymentDetails={paymentDetails} paymentLoading={paymentLoading} />
                    </Popup>
                )}
                {/* Edit Booking Popup - Only render when both isOpen and editBooking are valid */}
                {isEditPopupOpen && editBooking && (
                    <Popup isOpen={isEditPopupOpen} onClose={handleCloseEditPopup}>
                        <EditBookingForm
                            booking={editBooking}
                            user={user}
                            navigate={navigate}
                            onSubmit={(bookingId, payload) =>
                                handleEditSubmit(bookingId, payload, () => {
                                    setIsEditPopupOpen(false);
                                    setEditBooking(null);
                                })
                            }
                            onCancel={() => setIsEditPopupOpen(false)}
                            fullWidth={true}
                            relativePosition={true}
                        />
                    </Popup>
                )}
                {/* Cancel Confirmation Popup */}
                <Popup isOpen={isCancelPopupOpen} onClose={() => setIsCancelPopupOpen(false)}>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Cancellation</h2>
                    <p className="text-gray-600 mb-6">Are you sure you want to cancel Booking #{cancelBookingId}?</p>
                    <div className="flex space-x-4">
                        <button onClick={handleConfirmCancel} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
                            Yes, Cancel
                        </button>
                        <button onClick={() => setIsCancelPopupOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors">
                            No
                        </button>
                    </div>
                </Popup>
            </div>
        </div>
    );
};

export default UserViewBookings;