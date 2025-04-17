import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import $ from 'jquery';
import html2pdf from 'html2pdf.js';
import Barcode from 'react-barcode'; // Import react-barcode for generating barcodes
import useBookings from '../../hooks/useBookings';
import { useUser } from '../../context/UserContext';
import EditBookingForm from './../forms/EditBookingForm';
import logo from './../../assets/Images/wanderlusttrails.jpg'; // Import logo image

// Print-specific styles for the popup, including watermark for print
const printStyles = `
  @media print {
    .popup-overlay {
      background: none !important;
      position: absolute !important;
    }
    .popup-content {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      box-shadow: none !important;
    }
    body > *:not(.popup-overlay),
    .popup-overlay > *:not(.popup-content) {
      display: none !important;
    }
    .watermark {
      display: block !important;
      position: absolute !important;
      opacity: 0.1 !important;
      font-size: 60px !important;
      color: #000000 !important;
      transform: rotate(-45deg) !important;
      z-index: 0 !important;
    }
    .ticket-container {
      border: 2px solid #000 !important;
      box-shadow: none !important;
    }
  }
`;

// Popup component defined inline
const Popup = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    // Inject print styles when the popup is open
    if (isOpen) {
      const styleSheet = document.createElement('style');
      styleSheet.type = 'text/css';
      styleSheet.innerText = printStyles;
      document.head.appendChild(styleSheet);

      return () => {
        document.head.removeChild(styleSheet);
      };
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

// Styled Ticket component for the popup
const StyledTicket = ({ booking, paymentDetails, paymentLoading }) => {
  const ticketRef = React.useRef();

  const handlePrint = () => {
    window.print();
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
    html2pdf().set(opt).from(element).save();
  };

  // Access payment details for the specific booking
  const paymentData = paymentDetails[booking.id];

  // Convert paymentData to an array for rendering
  const bookingPayments = paymentData ? [paymentData] : [];

  // Check if payment details are still loading for this specific booking
  const isPaymentLoading = paymentLoading[booking.id] || false;

  // Ensure totalPrice is a number before calling toFixed
  const totalPrice = typeof booking.totalPrice === 'string' ? parseFloat(booking.totalPrice) : booking.totalPrice;
  const formattedTotalPrice = (typeof totalPrice === 'number' && !isNaN(totalPrice)) ? totalPrice.toFixed(2) : '0.00';

  // Determine ticket type and barcode value
  const ticketType = booking.booking_type === 'package' ? 'WL000PKG' : 'WL0000FH';
  const ticketNumber = `${ticketType}-${booking.id}`;

  return (
    <div ref={ticketRef} className="relative ticket-container">
   

      {/* Ticket Content */}
      <div className="relative bg-white p-8 rounded-xl shadow-2xl z-10 border border-gray-200">

           {/* Watermark */}
      <div className="watermark absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] opacity-10 text-[60px] text-gray-800 font-bold pointer-events-none z-0">
        WanderlustTrails
      </div>

        {/* Header with Logo and Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-4 rounded-t-xl flex items-center justify-between">
          <div>
            <img
              src={logo}
              alt="Wanderlust Trails Logo"
              className="h-10"
            />
          </div>
          <h2 className="text-2xl font-bold text-white">Travel Ticket</h2>
        </div>

        {/* Ticket Number and Barcode */}
        <div className="mt-6 flex justify-between items-center">
          <div>
            <p className="text-gray-700 font-semibold">
              <strong>Ticket Number:</strong> {ticketNumber}
            </p>
          </div>
          <div className="flex justify-center">
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

        {/* Booking Details Section */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold text-blue-700 mb-2">Booking Details</h3>
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Booking ID:</strong> #{booking.id}
            </p>
            <p className="text-gray-700">
              <strong>Type:</strong> {booking.booking_type === 'package' ? 'Package' : 'Flight & Hotel'}
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
                  booking.status === 'cancelled'
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

        {/* Package or Flight/Hotel Details */}
        {booking.booking_type === 'package' ? (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">Package Details</h3>
            <p className="text-gray-700">
              <strong>Package Name:</strong> {booking.package_name || 'N/A'}
            </p>
          </div>
        ) : (
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
                  <p key={key} className="text-gray-700">
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

        {/* Payment Details Section */}
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
                  <strong>Amount:</strong> ${payment.amount ? parseFloat(payment.amount).toFixed(2) : '0.00'}
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

        {/* Footer with Print/Download Buttons */}
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

// Cancel Confirmation Popup component
const CancelConfirmationPopup = ({ isOpen, onClose, onConfirm, bookingId }) => {
  useEffect(() => {
    // Inject print styles when the popup is open
    if (isOpen) {
      const styleSheet = document.createElement('style');
      styleSheet.type = 'text/css';
      styleSheet.innerText = printStyles;
      document.head.appendChild(styleSheet);

      return () => {
        document.head.removeChild(styleSheet);
      };
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

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      toast.error('Please log in to view your bookings.');
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || !user?.id) {
    return null;
  }

  const {
    bookings,
    filteredBookings,
    paymentDetails,
    loading,
    paymentLoading,
    statusFilter,
    setStatusFilter,
    fetchBookings,
  } = useBookings(user, isAuthenticated);

  const handleCancelBooking = (bookingId) => {
    console.log('Cancel booking initiated for booking ID:', bookingId);
    $.ajax({
      url: `http://localhost/WanderlustTrails/Backend/config/booking/cancelBooking.php`,
      type: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ booking_id: bookingId, user_id: user.id }),
      success: function (response) {
        console.log('Cancel booking response:', response);
        if (response.success) {
          fetchBookings();
          toast.success('Booking canceled successfully!');
        } else {
          toast.error(response.message || 'Failed to cancel booking.');
        }
      },
      error: function (xhr) {
        console.error('Error canceling booking:', xhr);
        let errorMessage = 'Failed to cancel booking: Server error';
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          errorMessage = errorResponse.message || 'Server error';
        } catch (e) {
          errorMessage = xhr.statusText || 'Server error';
        }
        toast.error(errorMessage);
      },
    });
  };

  const handleConfirmCancel = () => {
    if (cancelBookingId) {
      handleCancelBooking(cancelBookingId);
      setIsCancelPopupOpen(false);
      setCancelBookingId(null);
    }
  };

  const handleCancelClick = (bookingId) => {
    setCancelBookingId(bookingId);
    setIsCancelPopupOpen(true);
  };

  const handleEditClick = (booking) => {
    setEditBooking(booking);
    setIsEditPopupOpen(true);
  };

  const handleEditSubmit = (bookingId, payload) => {
    console.log('Received payload from EditBookingForm:', payload);
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
          fetchBookings();
          setIsEditPopupOpen(false);
          setEditBooking(null);
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
        console.error('AJAX Error:', xhr);
        toast.error(errorMessage);
      },
    });
  };

  const handleViewTicket = (booking) => {
    setSelectedBooking(booking);
    setIsViewPopupOpen(true);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const getBookingName = (booking) => {
    if (booking.booking_type === 'package') {
      return booking.package_name || 'Unnamed Package';
    } else {
      const from = booking.flight_details?.from || 'Unknown';
      const to = booking.flight_details?.to || 'Unknown';
      const hotelName = booking.hotel_details?.name || 'Unknown Hotel';
      return `Flight from ${from} to ${to}, Hotel: ${hotelName}`;
    }
  };

  if (loading) {
    return <div className="text-center text-gray-600">Loading bookings...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 bg-slate-600 shadow-md rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-semibold text-orange-600">Your Bookings</h1>
        </div>
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center">
            <label className="text-gray-700 font-semibold">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="bg-white border border-gray-300 rounded px-3 py-1 text-gray-700 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
          <div>
            <label className="text-gray-700 font-semibold mr-2">Total Bookings:</label>
            <span className="text-orange-500 font-bold w-full">{filteredBookings.length}</span>
          </div>
        </div>
      </div>

      <div className="relative">
        {filteredBookings.length === 0 ? (
          <p className="text-center text-gray-600">No bookings found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-800">Booking #{booking.id}</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-700">
                  <strong>Name:</strong> {getBookingName(booking)}
                </p>
                <p className="text-gray-700">
                  <strong>Type:</strong>{' '}
                  {booking.booking_type === 'package' ? 'Package' : 'Flight & Hotel'}
                </p>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => handleViewTicket(booking)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                  >
                    View Ticket
                  </button>
                  <button
                    onClick={() => handleCancelClick(booking.id)}
                    disabled={booking.status === 'cancelled'}
                    className={`px-3 py-1 rounded transition-colors ${
                      booking.status === 'cancelled'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleEditClick(booking)}
                    disabled={booking.status === 'cancelled'}
                    className={`px-3 py-1 rounded transition-colors ${
                      booking.status === 'cancelled'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                    }`}
                  >
                    Edit Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
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
              onSubmit={handleEditSubmit}
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