import React, { useState, useEffect, useMemo } from 'react';
import $ from 'jquery';
import { toast } from 'react-toastify';
import useBookings from '../../hooks/useBookings';
import { useUser } from '../../context/UserContext';
import BookingCard from '../BookingCard';
import FilterSortBar from '../FilterSortBar'; // Import FilterSortBar
import Pagination from './../Pagination';

function ManageBookings() {
    const { user, isAuthenticated } = useUser();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [filteredBookingsWithSearch, setFilteredBookingsWithSearch] = useState([]);
    const itemsPerPage = 6;

    const {
        bookings,
        filteredBookings,
        paymentDetails,
        paymentLoading,
        loading,
        fetchBookings
    } = useBookings(user, isAuthenticated, true);

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
                booking.flight_details.insurance ? 'yes' : 'no'
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
        ];

        return fields
            .filter(field => field !== null && field !== undefined)
            .map(field => field.toString().toLowerCase())
            .join(' ');
    };

    // Memoize the search results to prevent recreation on every render
    const searchedBookings = useMemo(() => {
        return filteredBookings.filter(booking => {
            if (!searchQuery) return true;
            const searchLower = searchQuery.toLowerCase();
            const searchableText = getSearchableText(booking);
            return searchableText.includes(searchLower);
        });
    }, [filteredBookings, searchQuery, paymentDetails]);

    // Memoize filterOptions to prevent recreation on every render
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

    // Memoize sortOptions to prevent recreation on every render
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
        // {
        //     key: 'status',
        //     label: 'Status',
        //     sortFunction: (a, b) => {
        //         const statusOrder = { confirmed: 1, pending: 2, canceled: 3 };
        //         return statusOrder[a.status] - statusOrder[b.status];
        //     }
        // },
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

    const totalItems = filteredBookingsWithSearch.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBookings = filteredBookingsWithSearch.slice(startIndex, endIndex);

    const handleStatusChange = (bookingId, newStatus) => {
        if (!confirm(`Are you sure you want to change the status to ${newStatus}?`)) return;

        setUpdatingStatus(true);
        const currentBooking = bookings.find(b => b.id === bookingId);
        if (!currentBooking) {
            toast.error(`Booking #${bookingId} not found`);
            setUpdatingStatus(false);
            return;
        }
        const oldPrice = currentBooking.total_price;
        const userId = currentBooking.user_id;
        const pendingChanges = currentBooking.pending_changes || {};

        const formattedPendingChanges = { ...pendingChanges };
        if (pendingChanges.startDate) {
            formattedPendingChanges.start_date = new Date(pendingChanges.startDate).toISOString().split('T')[0];
            delete formattedPendingChanges.startDate;
        }
        if (pendingChanges.endDate) {
            formattedPendingChanges.end_date = new Date(pendingChanges.endDate).toISOString().split('T')[0];
            delete formattedPendingChanges.endDate;
        }

        if (!Number.isInteger(Number(bookingId)) || !Number.isInteger(Number(userId))) {
            toast.error('Invalid booking ID or user ID');
            setUpdatingStatus(false);
            return;
        }
        if (!['pending', 'confirmed', 'canceled'].includes(newStatus)) {
            toast.error('Invalid status selected');
            setUpdatingStatus(false);
            return;
        }

        const payload = {
            booking_id: Number(bookingId),
            status: newStatus,
            user_id: Number(userId),
            pending_changes: formattedPendingChanges,
        };

        $.ajax({
            url: 'http://localhost/WanderlustTrails/Backend/config/booking/updateBookingStatus.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    if (response.message === "Status unchanged") {
                        toast.info("Status is already " + newStatus);
                    } else {
                        toast.success('Booking status and pending changes updated successfully!');
                        fetchBookings();
                        const updatedBooking = bookings.find(b => b.id === bookingId);
                        const newPrice = updatedBooking ? updatedBooking.total_price : oldPrice;
                        if (newStatus === 'confirmed' && oldPrice !== newPrice) {
                            const priceChange = newPrice - oldPrice;
                            toast.info(`Price updated: ${priceChange >= 0 ? '+' : ''}$${priceChange.toFixed(2)} (New total: $${newPrice.toFixed(2)})`);
                        }
                    }
                } else {
                    toast.error(response.message || 'Failed to update booking status or pending changes');
                }
            },
            error: function (xhr) {
                let errorMessage = `Error updating booking status: ${xhr.status} ${xhr.statusText}`;
                try {
                    const response = JSON.parse(xhr.responseText);
                    errorMessage += ` - ${response.message || 'Server error'}`;
                } catch (e) {
                    errorMessage += ' - Unable to parse server response';
                }
                toast.error(errorMessage);
            },
            complete: function () {
                setUpdatingStatus(false);
            }
        });
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    if (loading) {
        return <div className="text-center p-4 text-white">Loading bookings...</div>;
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
                    placeholder="Search by Booking ID, Full Name, Status, Type, Dates, Flight Details, Hotel Details, Transaction ID, etc."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {filteredBookingsWithSearch.length === 0 ? (
                <p className="text-center text-gray-300">No bookings found.</p>
            ) : (
                <>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {currentBookings.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                paymentDetails={paymentDetails}
                                paymentLoading={paymentLoading}
                                onStatusChange={handleStatusChange}
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