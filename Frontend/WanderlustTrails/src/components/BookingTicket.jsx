import React, { useRef, useState, memo } from 'react';
import PropTypes from 'prop-types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Barcode from 'react-barcode';
import logo from './../assets/Images/WanderlustTrails.jpg';

// Memoized Ticket Content Component to prevent unnecessary re-renders
const TicketContent = memo(({ booking, paymentDetails }) => {
    const barcodeValue = `WL${booking.id.toString().padStart(8, '0')}`;
    const calculateNewPrice = (pendingChanges) => {
        if (!pendingChanges) return booking.total_price;
        if (booking.booking_type === 'package') {
            const nights = pendingChanges.end_date && pendingChanges.start_date
                ? Math.max(1, Math.ceil((new Date(pendingChanges.end_date) - new Date(pendingChanges.start_date)) / (1000 * 60 * 60 * 24)) + 1)
                : Math.max(1, Math.ceil((new Date(booking.end_date) - new Date(booking.start_date)) / (1000 * 60 * 60 * 24)) + 1);
            const pricePerPerson = booking.package_details?.price ? parseFloat(booking.package_details.price) : 100;
            return pricePerPerson * (pendingChanges.persons || booking.persons) * nights;
        } else {
            const basePrice = 100;
            const classMultipliers = { economy: 1, premium_economy: 1.5, business: 2.5, first: 4 };
            const nights = pendingChanges.end_date && pendingChanges.start_date && pendingChanges.roundTrip
                ? Math.ceil((new Date(pendingChanges.end_date) - new Date(pendingChanges.start_date)) / (1000 * 60 * 60 * 24))
                : booking.end_date !== booking.start_date
                ? Math.ceil((new Date(booking.end_date) - new Date(booking.start_date)) / (1000 * 60 * 60 * 24))
                : 1;
            let price = basePrice * (pendingChanges.persons || booking.persons) * nights * (classMultipliers[pendingChanges.flightClass || booking.flight_details?.class || 'economy'] || 1) * (parseInt(pendingChanges.hotelStars || booking.hotel_details?.star_rating || 3) / 3);
            if (pendingChanges.insurance || booking.flight_details?.insurance) price += 50;
            if (pendingChanges.carRental || booking.hotel_details?.car_rental) price += 30 * nights;
            if (pendingChanges.amenities?.pool || booking.hotel_details?.amenities?.pool) price += 20;
            if (pendingChanges.amenities?.wifi || booking.hotel_details?.amenities?.wifi) price += 10;
            return price > 0 ? price : 0;
        }
    };

    return (
        <div className="relative bg-white text-gray-800 rounded-lg shadow-xl max-w-sm mx-auto overflow-hidden border border-gray-200 font-mono h-[480px] flex flex-col print:h-auto print:max-w-full">
            {/* Watermark */}
            <div
                className="absolute inset-0 opacity-10 z-0"
                style={{
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><text x="100" y="100" font-size="40" fill="blue" transform="rotate(45 100 100)" text-anchor="middle" dominant-baseline="middle">Wanderlust</text></svg>')`,
                }}
            />

            {/* Perpendicular Ticket Number and Transaction ID */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 z-10">
                <p className="text-[9px] font-mono text-gray-500 tracking-wider">
                    TICKET NO. {booking.id} | TRANS. ID: {paymentDetails[booking.id]?.transaction_id?.slice(0, 8) || 'N/A'}
                </p>
            </div>

            {/* Ticket Header */}
            <div className="bg-blue-800 text-white p-2 flex items-center space-x-2 relative z-10 h-[70px] shrink-0">
                <img
                    src={logo}
                    alt="Destination"
                    className="w-8 h-8 rounded-full object-cover border-2 border-white"
                />
                <div>
                    <h3 className="text-sm font-bold print:text-xs">
                        {booking.booking_type === 'package' ? 'Package Ticket' : 'Flight & Hotel Ticket'}
                    </h3>
                    <p className="text-[10px] print:text-[9px]">{booking.package_name || booking.flight_details.to || 'N/A'}</p>
                </div>
                <span
                    className={`absolute top-2 right-2 text-[9px] px-1 py-0.5 rounded-full font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-500' : booking.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                    } z-10 print:text-[8px]`}
                >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
            </div>

            {/* Ticket Body */}
            <div className="p-2 relative flex-1 z-10 print:h-auto">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-gray-200 print:w-1" style={{ background: 'radial-gradient(circle, transparent 50%, #e5e7eb 50%) 0 0 / 8px 8px' }} />
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-gray-200 print:w-1" style={{ background: 'radial-gradient(circle, transparent 50%, #e5e7eb 50%) 0 0 / 8px 8px' }} />

                <div className="ml-4 mr-4 font-mono text-[10px] print:text-[9px]">
                    {booking.booking_type === 'package' ? (
                        <div className="grid grid-cols-2 gap-1">
                            <div>
                                <p className="text-gray-500 uppercase">Package</p>
                                <p className="font-semibold">{booking.package_name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 uppercase">Travel Dates</p>
                                <p className="font-semibold">{booking.start_date} - {booking.end_date}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 uppercase">Persons</p>
                                <p className="font-semibold">{booking.persons}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 uppercase">Total</p>
                                <p className="font-semibold text-blue-600">${booking.total_price}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-1">
                            <div>
                                <p className="text-gray-500 uppercase">From</p>
                                <p className="font-semibold">{booking.flight_details.from || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 uppercase">To</p>
                                <p className="font-semibold">{booking.flight_details.to || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 uppercase">Dates</p>
                                <p className="font-semibold">
                                    {booking.start_date}{booking.end_date !== booking.start_date ? ` - ${booking.end_date}` : ' (One-Way)'}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 uppercase">Airline</p>
                                <p className="font-semibold">{booking.flight_details.airline || 'Any'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 uppercase">Class</p>
                                <p className="font-semibold">{booking.flight_details.class || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 uppercase">Time</p>
                                <p className="font-semibold">{booking.flight_details.preferred_time || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 uppercase">Hotel</p>
                                <p className="font-semibold">{booking.hotel_details.destination || 'N/A'} ({booking.hotel_details.star_rating || 'N/A'}★)</p>
                            </div>
                            <div>
                                <p className="text-gray-500 uppercase">Add-ons</p>
                                <p className="font-semibold text-[9px] print:text-[8px]">
                                    {booking.flight_details.insurance || booking.hotel_details.car_rental || booking.hotel_details.amenities?.pool || booking.hotel_details.amenities?.wifi
                                        ? `${booking.flight_details.insurance ? 'Insurance ' : ''}${booking.hotel_details.car_rental ? 'Car ' : ''}${booking.hotel_details.amenities?.pool ? 'Pool ' : ''}${booking.hotel_details.amenities?.wifi ? 'Wi-Fi' : ''}`
                                        : 'None'}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-gray-500 uppercase">Total</p>
                                <p className="font-semibold text-blue-600">${booking.total_price}</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-1 border-t border-dashed border-gray-400 pt-1 print:mt-0.5 print:pt-0.5">
                        <p className="text-gray-500 uppercase font-semibold">Payment</p>
                        {paymentDetails[booking.id] ? (
                            <div className="grid grid-cols-2 gap-0.5 mt-0.5 text-[9px] print:text-[8px] print:mt-0.5">
                                <div>
                                    <p className="text-gray-500 uppercase">Method</p>
                                    <p className="font-semibold">{paymentDetails[booking.id].payment_method || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 uppercase">Amount</p>
                                    <p className="font-semibold">${paymentDetails[booking.id].amount ? parseFloat(paymentDetails[booking.id].amount).toFixed(2) : '0.00'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 uppercase">Status</p>
                                    <p className={`font-semibold ${
                                        paymentDetails[booking.id].payment_status === 'completed'
                                            ? 'text-green-500'
                                            : paymentDetails[booking.id].payment_status === 'pending'
                                            ? 'text-yellow-500'
                                            : 'text-red-500'
                                    }`}>
                                        {paymentDetails[booking.id].payment_status
                                            ? paymentDetails[booking.id].payment_status.charAt(0).toUpperCase() + paymentDetails[booking.id].payment_status.slice(1)
                                            : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 uppercase">Trans. ID</p>
                                    <p className="font-semibold">{paymentDetails[booking.id].transaction_id?.slice(0, 8) || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 uppercase">Date</p>
                                    <p className="font-semibold">
                                        {paymentDetails[booking.id].payment_date
                                            ? new Date(paymentDetails[booking.id].payment_date).toLocaleDateString()
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-600 italic text-[9px] print:text-[8px]">No payment details available</p>
                        )}
                    </div>

                    {booking.pending_changes && (
                        <div className="mt-1 border-t border-dashed border-gray-400 pt-1 print:mt-0.5 print:pt-0.5">
                            <p className="text-[9px] text-yellow-600 font-semibold uppercase print:text-[8px]">Pending Changes</p>
                            <ul className="text-[9px] text-gray-700 list-disc pl-3 print:text-[8px]">
                                {Object.entries(booking.pending_changes).map(([key, value]) => (
                                    <li key={key}>{key}: {value.toString()}</li>
                                ))}
                                <li>New Price: ${calculateNewPrice(booking.pending_changes).toFixed(2)}</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Ticket Footer with Barcode */}
            <div className="bg-gray-100 p-2 border-t border-dashed border-gray-400 flex justify-center z-10 h-[50px] shrink-0 print:p-2 print:h-auto">
                <Barcode
                    value={barcodeValue}
                    format="CODE128"
                    height={25}
                    width={1}
                    fontSize={9}
                    margin={0}
                    className="print:h-20 print:fontSize-8"
                />
            </div>
        </div>
    );
});

TicketContent.propTypes = {
    booking: PropTypes.object.isRequired,
    paymentDetails: PropTypes.object.isRequired,
};

// Popup Component for reusability
const Popup = ({ isOpen, onClose, children, title, maxWidth = 'max-w-md', showCloseButton = true }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden">
            <div className={`bg-white rounded-lg shadow-xl p-6 ${maxWidth} w-full max-h-[80vh] flex flex-col items-center justify-center overflow-y-auto relative`}>
                {showCloseButton && (
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                    >
                        ×
                    </button>
                )}
                {title && <h3 className="text-lg font-bold mb-4 text-center text-gray-800">{title}</h3>}
                {children}
            </div>
        </div>
    );
};

Popup.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    title: PropTypes.string,
    maxWidth: PropTypes.string,
    showCloseButton: PropTypes.bool,
};

const BookingTicket = ({ booking, paymentDetails }) => {
    const popupRef = useRef();
    const [isPopupOpen, setIsPopupOpen] = useState(true); // Always open in this context
    const [isGenerating, setIsGenerating] = useState(false);

    const capturePopupAsImage = async () => {
        const element = popupRef.current;
        if (!element) {
            console.error("No element found for capturing popup for ticket:", booking.id);
            return null;
        }

        try {
            const clonedElement = element.cloneNode(true);
            document.body.appendChild(clonedElement);
            clonedElement.style.position = 'absolute';
            clonedElement.style.left = '-9999px';
            clonedElement.style.backgroundColor = '#ffffff';
            clonedElement.querySelector('.h-\\\[480px\\\]')?.classList.remove('h-[480px]');
            clonedElement.classList.remove('max-w-sm');
            clonedElement.classList.add('max-w-full');

            const canvas = await html2canvas(clonedElement, {
                scale: 1,
                useCORS: true,
                backgroundColor: '#ffffff',
            });

            document.body.removeChild(clonedElement);
            return canvas.toDataURL('image/png');
        } catch (error) {
            console.error("Error capturing popup as image for ticket:", booking.id, error);
            return null;
        }
    };

    const handlePrint = async () => {
        console.log("Print button clicked for ticket:", booking.id);
        const imgData = await capturePopupAsImage();
        if (!imgData) return;

        try {
            const iframe = document.createElement('iframe');
            document.body.appendChild(iframe);
            iframe.style.position = 'absolute';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = 'none';

            const doc = iframe.contentWindow.document;
            doc.open();
            doc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { margin: 0; font-family: monospace; background-color: #ffffff; }
                        .ticket-container { width: 100%; max-width: 500px; margin: 0 auto; padding: 10px; background-color: #ffffff; }
                        @media print {
                            body { padding: 0; margin: 0; }
                            .ticket-container { max-width: none; width: 100%; padding: 5mm; }
                            img { max-width: 100%; height: auto; }
                        }
                    </style>
                </head>
                <body>
                    <div class="ticket-container">
                        <img src="${imgData}" style="width: 100%; height: auto;" />
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(() => {
                                window.parent.document.body.removeChild(document.querySelector('iframe'));
                            }, 1000);
                        };
                    </script>
                </body>
                </html>
            `);
            doc.close();
        } catch (error) {
            console.error("Error printing ticket:", booking.id, error);
        }
    };

    const handleDownloadPDF = async () => {
        console.log("Download button clicked for ticket:", booking.id);
        setIsGenerating(true);
        const imgData = await capturePopupAsImage();
        if (!imgData) {
            setIsGenerating(false);
            return;
        }

        try {
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const imgWidth = 180;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = imgData;

            await new Promise((resolve) => {
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    resolve();
                };
            });

            const imgHeight = (img.height * imgWidth) / img.width;
            pdf.addImage(imgData, 'PNG', 15, 15, imgWidth, imgHeight > 277 ? 277 : imgHeight);
            pdf.save(`Ticket_${booking.id}.pdf`);
        } catch (error) {
            console.error("Error generating PDF for ticket:", booking.id, error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="relative bg-white text-gray-800 rounded-lg shadow-xl max-w-md mx-auto overflow-hidden border border-gray-200 font-mono h-[480px] flex flex-col">
            <TicketContent booking={booking} paymentDetails={paymentDetails} />

            {/* Ticket View Popup */}
            <Popup
                isOpen={isPopupOpen}
                onClose={() => setIsPopupOpen(false)}
                title="Your Ticket"
            >
                <div ref={popupRef} className="ticket-content">
                    <TicketContent booking={booking} paymentDetails={paymentDetails} />
                </div>
                <div className="flex justify-center space-x-4 mt-4">
                    <button
                        onClick={handlePrint}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors text-sm font-mono uppercase"
                    >
                        Print
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors text-sm font-mono uppercase disabled:opacity-50"
                        disabled={isGenerating}
                    >
                        {isGenerating ? 'Generating...' : 'Download'}
                    </button>
                </div>
            </Popup>
        </div>
    );
};

BookingTicket.propTypes = {
    booking: PropTypes.object.isRequired,
    paymentDetails: PropTypes.object.isRequired,
};

export default BookingTicket;