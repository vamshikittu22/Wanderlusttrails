//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx

import React, { useState, useEffect } from 'react';
import BookingDetailsForm from './BookingDetailsForm';
import FlightAndHotelForm from './FlightAndHotelForm';

const EditBookingForm = ({ booking, user, navigate, onSubmit, onCancel, fullWidth, relativePosition }) => {
    const [isEditMode, setIsEditMode] = useState(true);
    const [pendingChanges, setPendingChanges] = useState({});
    const [localSummary, setLocalSummary] = useState({});
    const [initialData, setInitialData] = useState({});

    useEffect(() => {
        // Initialize with booking data, converting dates to strings
        const initialData = {
            ...(booking.booking_type === 'package' ? {
                package_id: booking.package_id || '',
                persons: booking.persons || 1,
                start_date: booking.start_date ? new Date(booking.start_date).toLocaleDateString() : '',
                end_date: booking.end_date ? new Date(booking.end_date).toLocaleDateString() : '',
                totalPrice: parseFloat(booking.total_price) || 0,
            } : {
                from: booking.flight_details?.from || '',
                to: booking.flight_details?.to || '',
                startDate: booking.start_date ? new Date(booking.start_date).toLocaleDateString() : '',
                endDate: booking.end_date ? new Date(booking.end_date).toLocaleDateString() : '',
                airline: booking.flight_details?.airline || 'any',
                persons: booking.persons || 1,
                flightClass: booking.flight_details?.flightClass || 'economy',
                hotelStars: booking.hotel_details?.hotelStars || '3',
                roundTrip: booking.flight_details?.roundTrip !== undefined ? booking.flight_details.roundTrip : true,
                insurance: booking.flight_details?.insurance || false,
                carRental: booking.hotel_details?.car_rental || false,
                flightTime: booking.flight_details?.flightTime || 'any',
                amenities: {
                    pool: booking.hotel_details?.amenities?.pool || false,
                    wifi: booking.hotel_details?.amenities?.wifi || false,
                },
                totalPrice: parseFloat(booking.total_price) || 0,
            }),
        };
        setPendingChanges(initialData);
        setLocalSummary(initialData);
        setInitialData(initialData); // Store initial data for change detection
    }, [booking.booking_type, booking.package_id, booking.persons, booking.start_date, booking.end_date, booking.total_price, booking.flight_details, booking.hotel_details]);

    const handleSubmit = (formData) => {
        // Detect changes by comparing with initial data
        const changes = {};
        Object.keys(formData).forEach((key) => {
            if (formData[key] !== initialData[key] && formData[key] !== '' && formData[key] !== null) {
                changes[key] = formData[key];
            }
        });

        if (Object.keys(changes).length === 0) {
            onCancel(); // No changes, just cancel
            return;
        }

        // Map amenities if present
        if (changes.amenities && typeof changes.amenities === 'string') {
            const amenities = {};
            changes.amenities.split(' ').forEach(amenity => {
                amenities[amenity.toLowerCase()] = true;
            });
            changes.amenities = amenities;
        }

        const payload = {
            booking_id: booking.id,
            user_id: user.id, // Assuming user object has an id property
            changes: changes,
        };

        console.log('Submitting payload:', payload); // Debug payload
        onSubmit(booking.id, payload); // Pass the structured payload to parent
        onCancel();
    };

    const handleChange = (changes) => {
        setPendingChanges(prev => {
            const updated = { ...prev, ...changes };
            const newSummary = calculateSummary(updated);
            setLocalSummary(prevSummary => ({ ...prevSummary, ...newSummary }));
            return updated;
        });
    };

    const calculateSummary = (data) => {
        if (booking.booking_type === 'package') {
            const start = data.start_date ? new Date(data.start_date) : booking.start_date ? new Date(booking.start_date) : new Date();
            const end = data.end_date ? new Date(data.end_date) : booking.end_date ? new Date(booking.end_date) : new Date();
            const nights = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
            const pricePerPerson = booking.package_details?.price ? parseFloat(booking.package_details.price) : 100;
            const total = pricePerPerson * (data.persons || booking.persons) * nights;
            return {
                package_id: data.package_id || booking.package_id || '',
                persons: data.persons || booking.persons,
                start_date: start.toLocaleDateString(),
                end_date: end.toLocaleDateString(),
                totalPrice: isNaN(total) ? parseFloat(booking.total_price) || 0 : total,
            };
        } else {
            const basePrice = 100;
            const classMultipliers = { economy: 1, premium_economy: 1.5, business: 2.5, first: 4 };
            const nights = data.roundTrip && data.endDate && data.startDate
                ? Math.ceil((new Date(data.endDate) - new Date(data.startDate)) / (1000 * 60 * 60 * 24))
                : data.roundTrip && booking.end_date && booking.start_date
                ? Math.ceil((new Date(booking.end_date) - new Date(booking.start_date)) / (1000 * 60 * 60 * 24))
                : 1;
            let price = basePrice * (data.persons || booking.persons) * nights * (classMultipliers[data.flightClass || booking.flight_details?.flightClass || 'economy'] || 1) * (parseInt(data.hotelStars || booking.hotel_details?.hotelStars || 3) / 3);
            if (data.insurance || booking.flight_details?.insurance) price += 50;
            if (data.carRental || booking.hotel_details?.car_rental) price += 30 * nights;
            if (data.amenities?.pool || booking.hotel_details?.amenities?.pool) price += 20;
            if (data.amenities?.wifi || booking.hotel_details?.amenities?.wifi) price += 10;
            return {
                from: data.from || booking.flight_details?.from || '',
                to: data.to || booking.flight_details?.to || '',
                startDate: data.startDate ? new Date(data.startDate).toLocaleDateString() : booking.start_date ? new Date(booking.start_date).toLocaleDateString() : '',
                endDate: data.endDate ? new Date(data.endDate).toLocaleDateString() : booking.end_date ? new Date(booking.end_date).toLocaleDateString() : '',
                persons: data.persons || booking.persons,
                totalPrice: isNaN(price) ? parseFloat(booking.total_price) || 0 : price,
            };
        }
    };

    const renderSummary = () => {
        if (booking.booking_type === 'package') {
            return (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900">Pending Changes Summary</h3>
                    
                    <p className="text-gray-800"><strong>Package ID:</strong> {localSummary.package_id || booking.package_id || 'N/A'}</p>
                    <p className="text-gray-800"><strong>Persons:</strong> {localSummary.persons || booking.persons}</p>
                    <p className="text-gray-800"><strong>Start Date:</strong> {localSummary.start_date || (booking.start_date ? new Date(booking.start_date).toLocaleDateString() : '')}</p>
                    <p className="text-gray-800"><strong>End Date:</strong> {localSummary.end_date || (booking.end_date ? new Date(booking.end_date).toLocaleDateString() : '')}</p>
                    <p className="text-gray-800"><strong>New Total Price:</strong> ${parseFloat(localSummary.totalPrice || booking.total_price || 0).toFixed(2)}</p>
                    <p className="text-sm text-red-700">Note: Changes will be applied after admin confirmation.</p>
                    
                </div>
            );
        } else if (booking.booking_type === 'flight_hotel') {
            return (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900">Pending Changes Summary</h3>
                    <p className="text-gray-800"><strong>From:</strong> {localSummary.from || booking.flight_details?.from || 'N/A'}</p>
                    <p className="text-gray-800"><strong>To:</strong> {localSummary.to || booking.flight_details?.to || 'N/A'}</p>
                    <p className="text-gray-800"><strong>Dates:</strong> {localSummary.startDate || (booking.start_date ? new Date(booking.start_date).toLocaleDateString() : '')} {localSummary.endDate ? `to ${localSummary.endDate}` : ' (One-way)'}</p>
                    <p className="text-gray-800"><strong>Persons:</strong> {localSummary.persons || booking.persons}</p>
                    <p className="text-gray-800"><strong>New Total Price:</strong> ${parseFloat(localSummary.totalPrice || booking.total_price || 0).toFixed(2)}</p>
                    <p className="text-sm text-red-700">Note: Changes will be applied after admin confirmation.</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className={`w-full ${fullWidth ? 'max-w-full' : 'max-w-2xl'} mx-auto ${relativePosition ? 'relative' : ''}`}>
            {booking.booking_type === 'package' ? (
                <BookingDetailsForm
                    package={booking.package_details || {}}
                    isEditMode={isEditMode}
                    initialData={{
                        package_id: booking.package_id || '',
                        persons: booking.persons || 1,
                        start_date: booking.start_date ? new Date(booking.start_date) : null,
                        end_date: booking.end_date ? new Date(booking.end_date) : null,
                        totalPrice: parseFloat(booking.total_price) || 0,
                    }}
                    onSubmit={handleSubmit}
                    onCancel={onCancel}
                    onChange={handleChange}
                />
            ) : (
                <FlightAndHotelForm
                    initialData={{
                        from: booking.flight_details?.from || '',
                        to: booking.flight_details?.to || '',
                        startDate: booking.start_date ? new Date(booking.start_date) : null,
                        endDate: booking.end_date ? new Date(booking.end_date) : null,
                        airline: booking.flight_details?.airline || 'any',
                        persons: booking.persons || 1,
                        flightClass: booking.flight_details?.flightClass || 'economy',
                        hotelStars: booking.hotel_details?.hotelStars || '3',
                        roundTrip: booking.flight_details?.roundTrip || true,
                        insurance: booking.flight_details?.insurance || false,
                        carRental: booking.hotel_details?.car_rental || false,
                        flightTime: booking.flight_details?.flightTime || 'any',
                        amenities: {
                            pool: booking.hotel_details?.amenities?.pool || false,
                            wifi: booking.hotel_details?.amenities?.wifi || false,
                        },
                        totalPrice: parseFloat(booking.total_price) || 0,
                    }}
                    isEditMode={isEditMode}
                    onSubmit={handleSubmit}
                    onCancel={onCancel}
                    onChange={handleChange}
                    fullWidth={fullWidth}
                    relativePosition={relativePosition}
                />
            )}
            {renderSummary()}
        </div>
    );
};

export default EditBookingForm;