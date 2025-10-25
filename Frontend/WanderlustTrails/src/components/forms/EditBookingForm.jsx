import React, { useState, useEffect } from 'react';
import BookingDetailsForm from './BookingDetailsForm';
import FlightAndHotelForm from './FlightAndHotelForm';
import ItineraryForm from './ItineraryForm';

//edit booking form component
const EditBookingForm = ({ booking, user, onSubmit, onCancel }) => {
  const [isEditMode] = useState(true);
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [packagesError, setPackagesError] = useState(null);

  // ✅ Debug: Log the booking data we receive
  useEffect(() => {
    console.log('📦 EditBookingForm received booking:', booking);
    console.log('📦 Booking type:', booking.booking_type);
    console.log('📦 Flight details:', booking.flight_details);
  }, [booking]);

  // Fetch packages for itinerary bookings
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
  }, [booking.booking_type]);

  const getInitialData = () => {
    if (booking.booking_type === 'package') {
      const totalPrice = parseFloat(booking.total_price);
      return {
        package_id: booking.package_id || '',
        persons: booking.persons || 1,
        start_date: booking.start_date ? new Date(booking.start_date) : null,
        end_date: booking.end_date ? new Date(booking.end_date) : null,
        insurance: booking.insurance_type || 'none',
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
        insurance: booking.insurance_type || 'none',
        totalPrice: isNaN(totalPrice) ? 0 : totalPrice,
      };
    } else {
      // ✅ FLIGHT_HOTEL - FIXED VERSION
      const totalPrice = parseFloat(booking.total_price);
      
      // Parse flight_details if it's a JSON string
      let flightDetails = {};
      try {
        flightDetails = typeof booking.flight_details === 'string'
          ? JSON.parse(booking.flight_details)
          : booking.flight_details || {};
      } catch (error) {
        console.error('Error parsing flight_details:', error);
        flightDetails = {};
      }

      // Parse hotel_details if it's a JSON string
      let hotelDetails = {};
      try {
        hotelDetails = typeof booking.hotel_details === 'string'
          ? JSON.parse(booking.hotel_details)
          : booking.hotel_details || {};
      } catch (error) {
        console.error('Error parsing hotel_details:', error);
        hotelDetails = {};
      }

      const initialData = {
        // ✅ Nested structure (what FlightAndHotelForm expects)
        flight_details: {
          from: flightDetails.from || '',
          to: flightDetails.to || '',
          fromAirport: flightDetails.fromAirport || null, // ✅ CRITICAL: Airport objects
          toAirport: flightDetails.toAirport || null,     // ✅ CRITICAL: Airport objects
          roundTrip: flightDetails.roundTrip !== undefined ? flightDetails.roundTrip : true,
          airline: flightDetails.airline || 'any',
          flightClass: flightDetails.flightClass || 'economy',
          flightTime: flightDetails.flightTime || 'any',
          duration: flightDetails.duration || 'N/A',
          distance: flightDetails.distance || '0 miles',
        },
        hotel_details: {
          hotelStars: hotelDetails.hotelStars || '3',
          amenities: {
            pool: hotelDetails.amenities?.pool || false,
            wifi: hotelDetails.amenities?.wifi || false,
          },
          car_rental: hotelDetails.car_rental || false,
        },
        // ✅ Top-level fields (for backward compatibility)
        from: flightDetails.from || '',
        to: flightDetails.to || '',
        start_date: booking.start_date,
        end_date: booking.end_date,
        startDate: booking.start_date ? new Date(booking.start_date) : null,
        endDate: booking.end_date ? new Date(booking.end_date) : null,
        persons: booking.persons || 1,
        insurance: booking.insurance_type || 'none',
        carRental: hotelDetails.car_rental || false,
        amenities: {
          pool: hotelDetails.amenities?.pool || false,
          wifi: hotelDetails.amenities?.wifi || false,
        },
        totalPrice: isNaN(totalPrice) ? 0 : totalPrice,
        total_price: totalPrice,
      };

      console.log('✅ Flight & Hotel initialData prepared:', initialData);
      return initialData;
    }
  };
    
  const initialData = getInitialData();
  
const handleSubmit = (formData) => {

  console.log('🔍 RAW formData from form:', {
    flight_details: formData.flight_details,
    start_date: formData.start_date,
    end_date: formData.end_date,
    roundTrip: formData.flight_details?.roundTrip
  });
  
  console.log('📝 Edit form data received:', formData);
  
  let changes = {};

  if (booking.booking_type === 'flight_hotel') {
    // ✅ FIX: Properly structure the changes object with actual values
    changes = {
      flight_details: {
        from: formData.flight_details?.from || '',
        to: formData.flight_details?.to || '',
        fromAirport: formData.flight_details?.fromAirport || null,
        toAirport: formData.flight_details?.toAirport || null,
        roundTrip: formData.flight_details?.roundTrip, // ✅ FIX: Include roundTrip
        airline: formData.flight_details?.airline || 'any',
        flightClass: formData.flight_details?.flightClass || 'economy',
        flightTime: formData.flight_details?.flightTime || 'any',
        duration: formData.flight_details?.duration || 'N/A',
        distance: formData.flight_details?.distance || '0 miles',
        // Also include old field names for backward compatibility
        class: formData.flight_details?.flightClass || 'economy',
        preferred_time: formData.flight_details?.flightTime || 'any',
      },
      hotel_details: {
        hotelStars: formData.hotel_details?.hotelStars || '3',
        star_rating: parseInt(formData.hotel_details?.hotelStars || '3'),
        amenities: formData.hotel_details?.amenities || { pool: false, wifi: false },
        car_rental: formData.hotel_details?.car_rental || false,
        destination: formData.flight_details?.to || '',
      },
      start_date: formData.start_date,
      end_date: formData.end_date, // ✅ FIX: Don't set to null, pass actual value
      persons: formData.persons,
      insurance: formData.insurance !== 'none' ? 1 : 0,
      insurance_type: formData.insurance,
      total_price: formData.total_price,
    };
    
    console.log('✅ Changes prepared:', changes);
  } else if (booking.booking_type === 'package') {
    changes = {
      package_id: formData.package_id,
      start_date: formData.start_date,
      end_date: formData.end_date,
      persons: formData.persons,
      insurance: formData.insurance !== 'none' ? 1 : 0,
      insurance_type: formData.insurance,
      total_price: formData.total_price,
    };
  } else if (booking.booking_type === 'itinerary') {
    changes = {
      package_id: formData.package_id,
      itinerary_details: formData.itinerary_details,
      start_date: formData.start_date,
      end_date: formData.end_date,
      persons: formData.persons,
      insurance: formData.insurance !== 'none' ? 1 : 0,
      insurance_type: formData.insurance,
      total_price: formData.total_price,
    };
  }

  const payload = {
    booking_id: booking.id,
    user_id: user.id,
    changes,
  };
  
  console.log('📤 Final edit payload:', payload);
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
      insurance: formData.insurance !== 'none' ? 1 : 0,
      insurance_type: formData.insurance,
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
