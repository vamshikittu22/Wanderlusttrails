// path: Frontend/WanderlustTrails/src/components/ViewDownloadTicket.jsx
import React, { useRef } from 'react';
import html2pdf from 'html2pdf.js';
import Barcode from 'react-barcode';
import { toast } from 'react-toastify';
import logo from './../assets/Images/wanderlusttrails.jpg';

// Print styles for ticket printing
const printStyles = `
  @media print {
    body > * { display: none !important; }
    .ticket-container { display: block !important; position: static !important; width: 100% !important; border: 2px solid #000 !important; box-shadow: none !important; }
    .watermark { display: block !important; position: absolute !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) rotate(-45deg) !important; opacity: 0.1 !important; font-size: 60px !important; color: #000000 !important; z-index: 0 !important; }
    .barcode-container { display: block !important; overflow: visible !important; }
    .barcode-container svg { display: block !important; width: 100% !important; height: auto !important; }
    * { color: #000 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  }
`;

// Ticket Header component
const TicketHeader = () => (
    <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-4 rounded-t-xl flex items-center justify-between">
        <div>
            <img src={logo} alt="Wanderlust Trails Logo" className="h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white">Travel Ticket</h2>
    </div>
);

// Ticket Barcode component
const TicketBarcode = ({ ticketNumber }) => (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
        <div className="flex flex-col items-center space-y-3">
            <div className="text-center">
                <p className="text-lg font-semibold text-blue-700">
                    <strong>Ticket Number:</strong> {ticketNumber}
                </p>
            </div>
            <div className="barcode-container w-full max-w-xs flex justify-center">
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
    </div>
);

// Booking Details component
const BookingDetails = ({ booking, formattedTotalPrice }) => (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
        <h3 className="text-xl font-semibold text-blue-700 mb-2">Booking Details</h3>
        <div className="space-y-2">
            <p><strong>Booking ID:</strong> #{booking.id}</p>
            <p><strong>Type:</strong> {booking.booking_type === 'package' ? 'Package' : booking.booking_type === 'itinerary' ? 'Itinerary' : 'Flight & Hotel'}</p>
            <p><strong>Start Date:</strong> {new Date(booking.start_date).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> {new Date(booking.end_date).toLocaleDateString()}</p>
            <p><strong>Persons:</strong> {booking.persons}</p>
            <p><strong>Total Price:</strong> ${formattedTotalPrice}</p>
            <p>
                <strong>Status:</strong>{' '}
                <span className={booking.status === 'canceled' ? 'text-red-500' : booking.status === 'confirmed' ? 'text-green-500' : 'text-yellow-500'}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
            </p>
        </div>
    </div>
);

// Package Details component
const PackageDetails = ({ booking }) => (
    booking.booking_type === 'package' && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">Package Details</h3>
            <p><strong>Package Name:</strong> {booking.package_name || 'N/A'}</p>
        </div>
    )
);

// Itinerary Details component
const ItineraryDetails = ({ booking, itineraryDetails }) => (
    booking.booking_type === 'itinerary' && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">Itinerary Details</h3>
            <p><strong>Package Name:</strong> {booking.package_name || 'N/A'}</p>
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
    )
);

// Flight and Hotel Details component
const FlightHotelDetails = ({ booking }) => (
    booking.booking_type === 'flight_hotel' && (
        <>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
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
                                ? Object.entries(value).filter(([_, val]) => val).map(([amenity]) => amenity).join(', ') || 'None'
                                : value !== null && value !== undefined ? value.toString() : 'N/A'}
                        </p>
                    ))
                ) : (
                    <p className="text-gray-700">No hotel details available.</p>
                )}
            </div>
        </>
    )
);

// Payment Details component
const PaymentDetails = ({ bookingPayments, isPaymentLoading }) => (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-700">
        <h3 className="text-xl font-semibold text-blue-700 mb-2">Payment Details</h3>
        {isPaymentLoading && bookingPayments.length === 0 ? (
            <p className="text-gray-700">Loading payment details...</p>
        ) : bookingPayments.length > 0 ? (
            bookingPayments.map((payment, index) => (
                <div key={index} className="mt-2 border-t border-gray-300 pt-2">
                    <p><strong>Transaction ID:</strong> {payment.transaction_id || 'N/A'}</p>
                    <p><strong>Payment Method:</strong> {payment.payment_method || 'N/A'}</p>
                    <p>
                        <strong>Status:</strong>{' '}
                        <span className={payment.payment_status === 'completed' ? 'text-green-500' : payment.payment_status === 'pending' ? 'text-yellow-500' : 'text-red-500'}>
                            {payment.payment_status ? payment.payment_status.charAt(0).toUpperCase() + payment.payment_status.slice(1) : 'N/A'}
                        </span>
                    </p>
                    <p><strong>Date:</strong> {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'}</p>
                </div>
            ))
        ) : (
            <p className="text-gray-700">No payment details available.</p>
        )}
    </div>
);

// Main ViewDownloadTicket component
const ViewDownloadTicket = ({ booking, paymentDetails, paymentLoading }) => {
    const ticketRef = useRef();

    // Parse itinerary details if the booking is an itinerary
    let itineraryDetails = [];
    if (booking.booking_type === 'itinerary') {
        try {
            itineraryDetails = typeof booking.itinerary_details === 'string'
                ? JSON.parse(booking.itinerary_details)
                : Array.isArray(booking.itinerary_details)
                ? booking.itinerary_details
                : [];
        } catch (error) {
            console.error('Error parsing itinerary_details in ViewDownloadTicket:', error, booking.itinerary_details);
            itineraryDetails = [];
        }
    }

    // Prepare payment details
    const paymentData = paymentDetails[booking.id];
    const bookingPayments = paymentData ? [paymentData] : [];
    const isPaymentLoading = paymentLoading[booking.id] || false;

    // Format total price
    const totalPrice = typeof booking.total_price === 'string' ? parseFloat(booking.total_price) : booking.total_price;
    const formattedTotalPrice = (typeof totalPrice === 'number' && !isNaN(totalPrice)) ? totalPrice.toFixed(2) : '0.00';

    // Generate ticket number
    const ticketType = booking.booking_type === 'package' ? 'WL000PKG' : booking.booking_type === 'itinerary' ? 'WL000ITN' : 'WL0000FH';
    const ticketNumber = `${ticketType}-${booking.id}`;

    // PDF options for printing and downloading
    const pdfOptions = {
        margin: 0.5,
        filename: `Booking_${booking.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    const handlePrint = () => {
        // Add print styles before printing
        const styleSheet = document.createElement('style');
        styleSheet.type = 'text/css';
        styleSheet.innerText = printStyles;
        document.head.appendChild(styleSheet);

        html2pdf()
            .set(pdfOptions)
            .from(ticketRef.current)
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
                        // Remove print styles after printing
                        document.head.removeChild(styleSheet);
                    };
                };
            })
            .catch((error) => {
                console.error('Error generating PDF for printing:', error);
                toast.error('Failed to generate ticket for printing. Please try again.');
                // Ensure styles are removed even if there's an error
                document.head.removeChild(styleSheet);
            });
    };

    const handleDownload = () => {
        html2pdf()
            .set(pdfOptions)
            .from(ticketRef.current)
            .save()
            .then(() => toast.success('Ticket downloaded successfully!'))
            .catch((error) => {
                console.error('Error downloading PDF:', error);
                toast.error('Failed to download ticket. Please try again.');
            });
    };

    return (
        <div ref={ticketRef} className="relative ticket-container">
            <div className="watermark absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] opacity-10 text-[60px] text-gray-800 font-bold pointer-events-none z-0">
                WanderlustTrails
            </div>
            <div className="relative bg-white p-8 rounded-xl shadow-2xl z-10 border border-gray-200">
                <TicketHeader />
                <TicketBarcode ticketNumber={ticketNumber} />
                <BookingDetails booking={booking} formattedTotalPrice={formattedTotalPrice} />
                <PackageDetails booking={booking} />
                <ItineraryDetails booking={booking} itineraryDetails={itineraryDetails} />
                <FlightHotelDetails booking={booking} />
                <PaymentDetails bookingPayments={bookingPayments} isPaymentLoading={isPaymentLoading} />
                <div className="mt-8 flex justify-end space-x-4">
                    <button onClick={handlePrint} className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors shadow-md">
                        Print
                    </button>
                    <button onClick={handleDownload} className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-600 transition-colors shadow-md">
                        Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewDownloadTicket;
