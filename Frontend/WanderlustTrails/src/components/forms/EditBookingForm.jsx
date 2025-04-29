import React, { useState, useEffect } from 'react';
import BookingDetailsForm from './BookingDetailsForm';
import FlightAndHotelForm from './FlightAndHotelForm';
import ItineraryForm from './ItineraryForm';

const EditBookingForm = ({ booking, user, onSubmit, onCancel }) => {
  const [isEditMode] = useState(true);
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [packagesError, setPackagesError] = useState(null);

  useEffect(() => {
    if (booking.booking_type === 'itinerary') {
      const fetchPackages = async () => {
        try {
          const response = await fetch('http://localhost/Wanderlusttrails/Backend/config/AdminDashboard/manageDestinations/viewPackage.php');
          if (!response.ok) {
            throw new Error('Failed to fetch packages');
          }
          const data = await response.json();
          setPackages(data);
          setLoadingPackages(false);
        } catch (err) {
          console.error('Error fetching packages:', err);
          setPackagesError(err.message);
          setLoadingPackages(false);
        }
      };
      fetchPackages();
    } else {
      setLoadingPackages(false); // No packages needed for other booking types
    }
  }, [booking.booking_type]);

  const getInitialData = () => {
    if (booking.booking_type === 'package') {
      const totalPrice = parseFloat(booking.total_price);
      return {
        package_id: booking.package_id || '',
        persons: booking.persons || 1,
        start_date: booking.start_date ? new Date(booking.start_date) : null,
        end_date: booking.end_date ? new Date(booking.end_date) : null,
        totalPrice: isNaN(totalPrice) ? 0 : totalPrice,
      };
    } else if (booking.booking_type === 'itinerary') {
      const selectedPackage = packages.find(pkg => pkg.id === booking.package_id) || null;
      let itineraryDetails = [];
      try {
        itineraryDetails = typeof booking.itinerary_details === 'string'
          ? JSON.parse(booking.itinerary_details)
          : Array.isArray(booking.itinerary_details)
          ? booking.itinerary_details
          : [];
      } catch (error) {
        console.error('Error parsing itinerary_details:', error);
        itineraryDetails = [];
      }
      const totalPrice = parseFloat(booking.total_price);
      return {
        id: booking.id,
        package_id: booking.package_id || '',
        selectedPackage,
        itinerary_details: itineraryDetails,
        persons: booking.persons || 1,
        start_date: booking.start_date ? new Date(booking.start_date) : null,
        end_date: booking.end_date ? new Date(booking.end_date) : null,
        totalPrice: isNaN(totalPrice) ? 0 : totalPrice,
      };
    } else {
      const totalPrice = parseFloat(booking.total_price);
      return {
        from: booking.flight_details?.from || '',
        to: booking.flight_details?.to || '',
        startDate: booking.start_date ? new Date(booking.start_date) : null,
        endDate: booking.end_date ? new Date(booking.end_date) : null,
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
        totalPrice: isNaN(totalPrice) ? 0 : totalPrice,
      };
    }
  };

  // Recompute initialData whenever packages changes
  const initialData = getInitialData();

  const handleSubmit = (formData) => {
    const payload = {
      booking_id: booking.id,
      user_id: user.id,
      changes: formData,
    };
    onSubmit(booking.id, payload);
    onCancel();
  };

  const handleItinerarySubmit = (formData) => {
    const changes = {
      package_id: formData.package_id,
      itinerary_details: formData.itinerary_details,
      start_date: formData.start_date,
      end_date: formData.end_date,
      persons: formData.persons,
      total_price: formData.total_price,
    };
    handleSubmit(changes);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {booking.booking_type === 'package' ? (
        <BookingDetailsForm
          package={booking.package_details || {}}
          isEditMode={isEditMode}
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      ) : booking.booking_type === 'itinerary' ? (
        <ItineraryForm
          initialData={initialData}
          onSubmit={handleItinerarySubmit}
          onCancel={onCancel}
          packages={packages}
          loading={loadingPackages}
          error={packagesError}
        />
      ) : (
        <FlightAndHotelForm
          initialData={initialData}
          isEditMode={isEditMode}
          onSubmit={handleSubmit}
          onCancel={onCancel}
        />
      )}
    </div>
  );
};

export default EditBookingForm;