import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import html2pdf from 'html2pdf.js';
import Barcode from 'react-barcode';
import useBookings from '../../hooks/useBookings';
import { useUser } from '../../context/UserContext';
import EditBookingForm from './../forms/EditBookingForm';
import BookingCard from '../BookingCard';
import FilterSortBar from '../FilterSortBar';
import logo from './../../assets/Images/wanderlusttrails.jpg';
import Pagination from './../Pagination';

// Utility function to deep clean non-serializable data
const cleanNonSerializable = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return obj.toISOString();
    if (Array.isArray(obj)) return obj.map(item => cleanNonSerializable(item));
    const cleanedObj = {};
    for (const [key, value] of Object.entries(obj)) {
        if (key === 'summaryComponent' || key === 'element' || key === 'current' || key.startsWith('__react')) continue;
        if (typeof value === 'function' || (typeof value === 'object' && value instanceof HTMLElement) || (typeof value === 'object' && value && 'stateNode' in value && 'memoizedProps' in value)) continue;
        cleanedObj[key] = cleanNonSerializable(value);
    }
    return cleanedObj;
};

// Print-specific styles for the popup component
const printStyles = `
  @media print {
    body > * { display: none !important; }
    .popup-overlay { display: block !important; background: none !important; position: static !important; width: 100% !important; height: auto !important; }
    .popup-content { display: block !important; position: static !important; width: 100% !important; max-width: none !important; height: auto !important; max-height: none !important; overflow: visible !important; margin: 0 !important; padding: 0 !important; border: none !important; box-shadow: none !important; }
    .ticket-container { display: block !important; position: static !important; width: 100% !important; border: 2px solid #000 !important; box-shadow: none !important; }
    .watermark { display: block !important; position: absolute !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) rotate(-45deg) !important; opacity: 0.1 !important; font-size: 60px !important; color: #000000 !important; z-index: 0 !important; }
    .barcode-container { display: block !important; overflow: visible !important; }
    .barcode-container svg { display: block !important; width: 100% !important; height: auto !important; }
    * { color: #000 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  }
`;

const Popup = ({ isOpen, onClose, children }) => {
    useEffect(() => {
        if (isOpen) {
            const styleSheet = document.createElement('style');
            styleSheet.type = 'text/css';
            styleSheet.innerText = printStyles;
            document.head.appendChild(styleSheet);
            return () => document.head.removeChild(styleSheet);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[1000] bg-black bg-opacity-50 popup-overlay">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative popup-content">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-xl font-bold"
                    aria-label="Close"
                >
                    ×
                </button>
                {children}
            </div>
        </div>
    );
};

const StyledTicket = ({ booking, paymentDetails, paymentLoading }) => {
    const ticketRef = React.useRef();

    // Parse itinerary_details if booking type is 'itinerary'
    let itineraryDetails = [];
    if (booking.booking_type === 'itinerary') {
        try {
            itineraryDetails = typeof booking.itinerary_details === 'string'
                ? JSON.parse(booking.itinerary_details)
                : Array.isArray(booking.itinerary_details)
                ? booking.itinerary_details
                : [];
        } catch (error) {
            console.error('Error parsing itinerary_details in StyledTicket:', error, booking.itinerary_details);
            itineraryDetails = [];
        }
    }

    const handlePrint = () => {
        const element = ticketRef.current;
        const opt = {
            margin: 0.5,
            filename: `Booking_${booking.id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        };

        html2pdf()
            .set(opt)
            .from(element)
            .toPdf()
            .get('pdf')
            .then((pdf) => {
                const blob = pdf.output('blob');
                const url = URL.createObjectURL(blob);
                const printWindow = window.open(url, '_blank');
                printWindow.onload = () => {
                    printWindow.print();
                    printWindow.onafterprint = () => {
                        printWindow.close();
                        URL.revokeObjectURL(url);
                    };
                };
            })
            .catch((error) => {
                console.error('Error generating PDF for printing:', error);
                toast.error('Failed to generate ticket for printing. Please try again.');
            });
    };

    const handleDownload = () => {
        const element = ticketRef.current;
        const opt = {
            margin: 0.5,
            filename: `Booking_${booking.id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        };
        html2pdf()
            .set(opt)
            .from(element)
            .save()
            .then(() => {
                toast.success('Ticket downloaded successfully!');
            })
            .catch((error) => {
                console.error('Error downloading PDF:', error);
                toast.error('Failed to download ticket. Please try again.');
            });
    };

    const paymentData = paymentDetails[booking.id];
    const bookingPayments = paymentData ? [paymentData] : [];
    const isPaymentLoading = paymentLoading[booking.id] || false;

    const totalPrice = typeof booking.total_price === 'string' ? parseFloat(booking.total_price) : booking.total_price;
    const formattedTotalPrice = (typeof totalPrice === 'number' && !isNaN(totalPrice)) ? totalPrice.toFixed(2) : '0.00';

    const ticketType = booking.booking_type === 'package' ? 'WL000PKG' : booking.booking_type === 'itinerary' ? 'WL000ITN' : 'WL0000FH';
    const ticketNumber = `${ticketType}-${booking.id}`;

    return (
        <div ref={ticketRef} className="relative ticket-container">
            <div className="watermark absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] opacity-10 text-[60px] text-gray-800 font-bold pointer-events-none z-0">
                WanderlustTrails
            </div>

            <div className="relative bg-white p-8 rounded-xl shadow-2xl z-10 border border-gray-200">
                <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-4 rounded-t-xl flex items-center justify-between">
                    <div>
                        <img src={logo} alt="Wanderlust Trails Logo" className="h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Travel Ticket</h2>
                </div>

                <div className="mt-6 flex justify-between items-center">
                    <div>
                        <p className="text-gray-700 font-semibold">
                            <strong>Ticket Number:</strong> {ticketNumber}
                        </p>
                    </div>
                    <div className="barcode-container flex justify-center">
                        <Barcode
                            value={ticketNumber}
                            format="CODE128"
                            width={2}
                            height={50}
                            displayValue={false}
                            background="transparent"
                        />
                    </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-semibold text-blue-700 mb-2">Booking Details</h3>
                    <div className="space-y-2">
                        <p className="text-gray-700">
                            <strong>Booking ID:</strong> #{booking.id}
                        </p>
                        <p className="text-gray-700">
                            <strong>Type:</strong> {booking.booking_type === 'package' ? 'Package' : booking.booking_type === 'itinerary' ? 'Itinerary' : 'Flight & Hotel'}
                        </p>
                        <p className="text-gray-700">
                            <strong>Start Date:</strong> {new Date(booking.start_date).toLocaleDateString()}
                        </p>
                        <p className="text-gray-700">
                            <strong>End Date:</strong> {new Date(booking.end_date).toLocaleDateString()}
                        </p>
                        <p className="text-gray-700">
                            <strong>Persons:</strong> {booking.persons}
                        </p>
                        <p className="text-gray-700">
                            <strong>Total Price:</strong> ${formattedTotalPrice}
                        </p>
                        <p className="text-gray-700">
                            <strong>Status:</strong>{' '}
                            <span
                                className={
                                    booking.status === 'canceled'
                                        ? 'text-red-500'
                                        : booking.status === 'confirmed'
                                        ? 'text-green-500'
                                        : 'text-yellow-500'
                                }
                            >
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                        </p>
                    </div>
                </div>

                {booking.booking_type === 'package' && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-xl font-semibold text-blue-700 mb-2">Package Details</h3>
                        <p className="text-gray-700">
                            <strong>Package Name:</strong> {booking.package_name || 'N/A'}
                        </p>
                    </div>
                )}

                {booking.booking_type === 'itinerary' && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-xl font-semibold text-blue-700 mb-2">Itinerary Details</h3>
                        <p className="text-gray-700">
                            <strong>Package Name:</strong> {booking.package_name || 'N/A'}
                        </p>
                        <div className="mt-2">
                            <strong className="text-gray-700">Activities:</strong>
                            {itineraryDetails.length > 0 ? (
                                <ul className="list-disc pl-5 mt-1">
                                    {itineraryDetails.map((activity, index) => (
                                        <li key={index} className="text-gray-700">
                                            {activity.name} ({activity.duration}, ${activity.price})
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-700">No activities selected.</p>
                            )}
                        </div>
                    </div>
                )}

                {booking.booking_type === 'flight_hotel' && (
                    <>
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-xl font-semibold text-blue-700 mb-2">Flight Details</h3>
                            {booking.flight_details ? (
                                Object.entries(booking.flight_details).map(([key, value]) => (
                                    <p key={key} className="text-gray-700">
                                        <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{' '}
                                        {value !== null && value !== undefined ? value.toString() : 'N/A'}
                                    </p>
                                ))
                            ) : (
                                <p className="text-gray-700">No flight details available.</p>
                            )}
                        </div>
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-xl font-semibold text-blue-700 mb-2">Hotel Details</h3>
                            {booking.hotel_details ? (
                                Object.entries(booking.hotel_details).map(([key, value]) => (
                                    <p key={key} className="text-gray-700" style={{ fontFamily: 'Vidaloka, serif' }}>
                                        <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{' '}
                                        {key === 'amenities' && value
                                            ? Object.entries(value)
                                                .filter(([_, val]) => val)
                                                .map(([amenity]) => amenity)
                                                .join(', ') || 'None'
                                            : value !== null && value !== undefined
                                            ? value.toString()
                                            : 'N/A'}
                                    </p>
                                ))
                            ) : (
                                <p className="text-gray-700">No hotel details available.</p>
                            )}
                        </div>
                    </>
                )}

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-xl font-semibold text-blue-700 mb-2">Payment Details</h3>
                    {isPaymentLoading && bookingPayments.length === 0 ? (
                        <p className="text-gray-700">Loading payment details...</p>
                    ) : bookingPayments.length > 0 ? (
                        bookingPayments.map((payment, index) => (
                            <div key={index} className="mt-2 border-t border-gray-300 pt-2">
                                <p className="text-gray-700">
                                    <strong>Transaction ID:</strong> {payment.transaction_id || 'N/A'}
                                </p>
                                <p className="text-gray-700">
                                    <strong>Payment Method:</strong> {payment.payment_method || 'N/A'}
                                </p>
                                <p className="text-gray-700">
                                    <strong>Status:</strong>{' '}
                                    <span
                                        className={
                                            payment.payment_status === 'completed'
                                                ? 'text-green-500'
                                                : payment.payment_status === 'pending'
                                                ? 'text-yellow-500'
                                                : 'text-red-500'
                                        }
                                    >
                                        {payment.payment_status ? payment.payment_status.charAt(0).toUpperCase() + payment.payment_status.slice(1) : 'N/A'}
                                    </span>
                                </p>
                                <p className="text-gray-700">
                                    <strong>Date:</strong>{' '}
                                    {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-700">No payment details available.</p>
                    )}
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                    <button
                        onClick={handlePrint}
                        className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors shadow-md"
                    >
                        Print
                    </button>
                    <button
                        onClick={handleDownload}
                        className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors shadow-md"
                    >
                        Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

const CancelConfirmationPopup = ({ isOpen, onClose, onConfirm, bookingId }) => {
    useEffect(() => {
        if (isOpen) {
            const styleSheet = document.createElement('style');
            styleSheet.type = 'text/css';
            styleSheet.innerText = printStyles;
            document.head.appendChild(styleSheet);
            return () => document.head.removeChild(styleSheet);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[1000] bg-black bg-opacity-50 popup-overlay">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto relative popup-content">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-xl font-bold"
                    aria-label="Close"
                >
                    ×
                </button>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Confirm Cancellation</h2>
                <p className="text-gray-600 mb-6">Are you sure you want to cancel Booking #{bookingId}?</p>
                <div className="flex space-x-4">
                    <button
                        onClick={onConfirm}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                    >
                        Yes, Cancel
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                    >
                        No
                    </button>
                </div>
            </div>
        </div>
    );
};

const UserViewBookings = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useUser();
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

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            toast.error('Please log in to view your bookings.');
            navigate('/login');
        }
    }, [isAuthenticated, user, navigate]);

    if (!isAuthenticated || !user?.id) return null;

    const {
        bookings,
        paymentDetails,
        loading,
        paymentLoading,
        editBooking: handleEditSubmit,
        cancelBooking: handleCancelBooking,
    } = useBookings(user, isAuthenticated);

    const getBookingName = (booking) => {
        if (booking.booking_type === 'package') {
            return booking.package_name || 'Unnamed Package';
        } else if (booking.booking_type === 'itinerary') {
            return booking.package_name || 'Custom Itinerary';
        } else {
            const from = booking.flight_details?.from || 'Unknown';
            const to = booking.flight_details?.to || 'Unknown';
            const hotelName = booking.hotel_details?.name || 'Unknown Hotel';
            return `Flight from ${from} to ${to}, Hotel: ${hotelName}`;
        }
    };

    // Memoize the searched bookings to prevent recreation on every render
    const searchedBookings = useMemo(() => {
        return bookings.filter((booking) => {
            const searchLower = searchQuery.toLowerCase();
            const bookingIdMatch = booking.id.toString().includes(searchLower);
            const bookingNameMatch = getBookingName(booking).toLowerCase().includes(searchLower);
            const packageNameMatch = (booking.booking_type === 'package' || booking.booking_type === 'itinerary') && booking.package_name
                ? booking.package_name.toLowerCase().includes(searchLower)
                : false;
            const transactionIdMatch = paymentDetails[booking.id]?.transaction_id?.toLowerCase().includes(searchLower) || false;
            return bookingIdMatch || bookingNameMatch || packageNameMatch || transactionIdMatch;
        });
    }, [bookings, searchQuery, paymentDetails]);

    // Memoize filterOptions and sortOptions to prevent recreation on every render
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
        }
    ], []);

    const totalItems = filteredBookingsWithSearch.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBookings = filteredBookingsWithSearch.slice(startIndex, endIndex);

    const handleViewTicket = (booking) => {
        setSelectedBooking(booking);
        setIsViewPopupOpen(true);
    };

    const handleEditClick = (booking) => {
        setEditBooking(booking);
        setIsEditPopupOpen(true);
    };

    const handleCancelClick = (bookingId) => {
        setCancelBookingId(bookingId);
        setIsCancelPopupOpen(true);
    };

    const handleConfirmCancel = () => {
        if (cancelBookingId) {
            handleCancelBooking(cancelBookingId, () => {
                setIsCancelPopupOpen(false);
                setCancelBookingId(null);
            });
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    if (loading) {
        return <div className="text-center text-gray-600">Loading bookings...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-4 bg-gray-700 shadow-md rounded-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                    <h1 className="text-3xl font-semibold text-orange-600">Your Bookings</h1>
                </div>
                <div className="flex items-center space-x-4 mb-4">
                    <div>
                        <label className="text-gray-200 font-semibold mr-2">Total Bookings:</label>
                        <span className="text-orange-500 font-bold w-full">{filteredBookingsWithSearch.length}</span>
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
                    placeholder="Search by Booking ID, Name, Package Name, or Transaction ID"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full p-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="relative">
                {filteredBookingsWithSearch.length === 0 ? (
                    <p className="text-center text-gray-600">No bookings found.</p>
                ) : (
                    <>
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

                        <Pagination
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </>
                )}

                <Popup isOpen={isViewPopupOpen} onClose={() => setIsViewPopupOpen(false)}>
                    {selectedBooking && (
                        <StyledTicket
                            booking={selectedBooking}
                            paymentDetails={paymentDetails}
                            paymentLoading={paymentLoading}
                        />
                    )}
                </Popup>

                <Popup isOpen={isEditPopupOpen} onClose={() => setIsEditPopupOpen(false)}>
                    {editBooking && (
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
                    )}
                </Popup>

                <CancelConfirmationPopup
                    isOpen={isCancelPopupOpen}
                    onClose={() => setIsCancelPopupOpen(false)}
                    onConfirm={handleConfirmCancel}
                    bookingId={cancelBookingId}
                />
            </div>
        </div>
    );
};

UserViewBookings.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.number.isRequired,
    }),
    isAuthenticated: PropTypes.bool.isRequired,
};

export default UserViewBookings;