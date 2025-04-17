//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx

import React from 'react';
import PropTypes from 'prop-types';
import Barcode from 'react-barcode';
import logo from './../assets/Images/WanderlustTrails.jpg'; // Adjust path if different

const TicketPrint = React.forwardRef(({ booking, paymentDetails }, ref) => {
    const barcodeValue = `WL${booking.id.toString().padStart(8, '0')}`;

    return (
        <div ref={ref} className="relative bg-white text-gray-800 rounded-lg shadow-xl max-w-sm mx-auto overflow-hidden border border-gray-200 font-mono h-[500px] flex flex-col">
            {/* Watermark */}
            <div
                className="absolute inset-0 opacity-10 z-0"
                style={{
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><text x="100" y="100" font-size="40" fill="blue" transform="rotate(45 100 100)" text-anchor="middle" dominant-baseline="middle">Wanderlust</text></svg>')`,
                }}
            ></div>

            {/* Perpendicular Ticket Number and Transaction ID */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 z-10">
                <p className="text-xs font-mono text-gray-500 tracking-wider">
                    TICKET NO. {booking.id} | TRANS. ID: {paymentDetails[booking.id]?.transaction_id?.slice(0, 8) || 'N/A'}
                </p>
            </div>

            {/* Ticket Header */}
            <div className="bg-blue-800 text-white p-4 flex items-center space-x-4 relative z-10">
                <img
                    src={logo}
                    alt="Destination"
                    className="w-12 h-12 rounded-full object-cover border-2 border-white"
                />
                <div>
                    <h3 className="text-lg font-bold">
                        {booking.booking_type === 'package' ? 'Package Ticket' : 'Flight & Hotel Ticket'}
                    </h3>
                    <p className="text-sm">{booking.package_name || booking.flight_details.to || 'N/A'}</p>
                </div>
                <span
                    className={`absolute top-4 right-4 text-xs px-2 py-1 rounded-full font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-500' : booking.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                    } z-10`}
                >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
            </div>

            {/* Ticket Body */}
            <div className="p-4 relative flex-1 z-10">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-gray-200" style={{ background: 'radial-gradient(circle, transparent 50%, #e5e7eb 50%) 0 0 / 10px 10px' }}></div>
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-gray-200" style={{ background: 'radial-gradient(circle, transparent 50%, #e5e7eb 50%) 0 0 / 10px 10px' }}></div>

                <div className="ml-4 mr-4 font-mono text-sm">
                    {booking.booking_type === 'package' ? (
                        <div className="grid grid-cols-2 gap-3">
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
                        <div className="grid grid-cols-2 gap-3">
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
                                <p className="font-semibold text-xs">
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

                    <div className="mt-3 border-t border-dashed border-gray-400 pt-2">
                        <p className="text-gray-500 uppercase font-semibold">Payment</p>
                        {paymentDetails[booking.id] ? (
                            <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                                <div>
                                    <p className="text-gray-500 uppercase">Method</p>
                                    <p className="font-semibold">{paymentDetails[booking.id].payment_method || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 uppercase">Status</p>
                                    <p className="font-semibold">{paymentDetails[booking.id].payment_status || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 uppercase">Trans. ID</p>
                                    <p className="font-semibold">{paymentDetails[booking.id].transaction_id?.slice(0, 8) || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 uppercase">Date</p>
                                    <p className="font-semibold">{paymentDetails[booking.id].payment_date || 'N/A'}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-600 italic">No payment details</p>
                        )}
                    </div>

                    {booking.pending_changes && (
                        <div className="mt-3 border-t border-dashed border-gray-400 pt-2">
                            <p className="text-xs text-yellow-600 font-semibold uppercase">Pending Changes</p>
                            <ul className="text-xs text-gray-700 list-disc pl-4">
                                {Object.entries(booking.pending_changes).map(([key, value]) => (
                                    <li key={key}>{key}: {value.toString()}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Ticket Footer with Barcode */}
            <div className="bg-gray-100 p-4 border-t border-dashed border-gray-400 flex justify-center z-10">
                <Barcode
                    value={barcodeValue}
                    format="CODE128"
                    height={40}
                    width={1}
                    fontSize={12}
                    margin={0}
                />
            </div>
        </div>
    );
});

TicketPrint.displayName = 'TicketPrint';

TicketPrint.propTypes = {
    booking: PropTypes.object.isRequired,
    paymentDetails: PropTypes.object.isRequired
};

export default TicketPrint;