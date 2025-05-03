
import React, { useState, useEffect } from 'react';
import BookingDetailsForm from './BookingDetailsForm';
import FlightAndHotelForm from './FlightAndHotelForm';
import ItineraryForm from './ItineraryForm';

//edit booking form component
const EditBookingForm = ({ booking, user, onSubmit, onCancel }) => {
  const [isEditMode] = useState(true); //state for edit mode
  const [packages, setPackages] = useState([]); //state for packages
  const [loadingPackages, setLoadingPackages] = useState(true); //state for loading packages
  const [packagesError, setPackagesError] = useState(null); //state for packages error

  // Check if the booking type is 'itinerary' and fetch packages if true
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
      setLoadingPackages(false);
    }
  }, [booking.booking_type]); //fetch packages when booking type is itinerary

  const getInitialData = () => {
    if (booking.booking_type === 'package') {
      const totalPrice = parseFloat(booking.total_price);
      return {
        package_id: booking.package_id || '',
        persons: booking.persons || 1,
        start_date: booking.start_date ? new Date(booking.start_date) : null,
        end_date: booking.end_date ? new Date(booking.end_date) : null,
        insurance: booking.insurance_type || 'none', // Use insurance_type
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
        insurance: booking.insurance_type || 'none', // Use insurance_type
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
        insurance: booking.insurance_type || 'none', // Use insurance_type
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
    
  const initialData = getInitialData();
  const handleSubmit = (formData) => {
    let changes = formData;
  
    // Transform formData for flight_hotel bookings to match backend expectations
    if (booking.booking_type === 'flight_hotel') {
      changes = {
        flight_details: formData.flight_details,
        hotel_details: formData.hotel_details,
        start_date: formData.start_date,
        end_date: formData.end_date,
        persons: formData.persons,
        insurance: formData.insurance !== 'none' ? 1 : 0, // Convert to 0 or 1
        insurance_type: formData.insurance, // Set insurance_type explicitly
        total_price: formData.total_price,
      };
    }
  
    const payload = {
      booking_id: booking.id,
      user_id: user.id,
      changes,
    };
    console.log('Edit Payload:', payload);
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
      insurance: formData.insurance !== 'none' ? 1 : 0, // Set to 1 if insurance is selected, 0 otherwise
      insurance_type: formData.insurance, // Explicitly set insurance_type
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