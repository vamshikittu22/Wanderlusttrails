// path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/FlightAndHotel.jsx
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import $ from 'jquery'; // Add jQuery import for AJAX calls
import FlightAndHotelForm from '../components/forms/FlightAndHotelForm';

function FlightAndHotel() {
  const navigate = useNavigate(); // Hook to programmatically navigate
  const { user } = useUser(); // Get current user info from context

  // Handles form submission for booking flight and hotel
  const handleSubmit = async (formData) => {
    // Check if user is logged in
    if (!user?.id) {
      toast.error('Please log in to book.');
      navigate('/Login'); // Redirect to login if not authenticated
      return;
    }
  
    // Validate start and end dates before processing
    const startDate = formData.start_date ? new Date(formData.start_date) : null;
    const endDate = formData.end_date ? new Date(formData.end_date) : null;
  
    if (!startDate || isNaN(startDate.getTime())) {
      toast.error('Invalid start date. Please select a valid date.');
      return;
    }
  
    // If round-trip, validate end date
    if (formData.roundTrip && (!endDate || isNaN(endDate.getTime()))) {
      toast.error('Invalid end date. Please select a valid date for round-trip.');
      return;
    }
  
    // Prepare payload object to send to backend API
    const payload = {
      user_id: user.id,
      booking_type: 'flight_hotel',
      flight_details: {
        from: formData.flight_details.from,
        to: formData.flight_details.to,
        class: formData.flight_details.flightClass,
        preferred_time: formData.flight_details.flightTime,
        airline: formData.flight_details.airline === 'any' ? null : formData.flight_details.airline,
        duration: formData.flight_details.duration,
        insurance: formData.insurance,
      },
      hotel_details: {
        destination: formData.flight_details.to,
        star_rating: parseInt(formData.hotel_details.hotelStars),
        amenities: formData.hotel_details.amenities,
        car_rental: formData.hotel_details.car_rental,
      },
      start_date: startDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
      end_date: formData.roundTrip && endDate ? endDate.toISOString().split('T')[0] : null,
      persons: parseInt(formData.persons),
      total_price: formData.total_price,
    };
  
    console.log('Payload:', payload);
    
    // AJAX POST request to create booking on backend
    $.ajax({
      url: 'http://localhost/WanderlustTrails/Backend/config/booking/createBooking.php',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(payload),
      success: (response) => {
        console.log('Booking response:', response);

        if (response.success) {
          // Store booking data in session storage for later use (e.g., payment)
          const updatedBookingData = { ...payload, booking_id: response.booking_id, total_price: formData.total_price };
          sessionStorage.setItem('bookingData', JSON.stringify(updatedBookingData));
          toast.success('Booking saved! Proceed to payment.', { position: 'top-center', autoClose: 1000 });
          navigate('/Payment'); // Navigate to payment page
        } else {
          toast.error('Error saving booking: ' + response.message);
        }
      },
      error: (xhr, status, error) => {
        console.error('Booking error:', { status, error, response: xhr.responseText });
        // Try parsing backend error message from response JSON
        let errorMessage = 'Error saving booking: ';
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          errorMessage += errorResponse.message || error;
        } catch (e) {
          errorMessage += error;
        }
        toast.error(errorMessage);
      },
    });
  };

  // Handler for cancel button - go back to previous page
  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Step indicator UI */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-full">1</span>
              <span className="ml-2 text-gray-300 font-medium">Details</span>
            </div>
            <div className="w-12 h-1 bg-gray-700"></div>
            <div className="flex items-center">
              <span className="w-8 h-8 flex items-center justify-center bg-gray-700 text-gray-400 rounded-full">2</span>
              <span className="ml-2 text-gray-400">Payment</span>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-indigo-300 mb-8 text-center">
          Book Flight + Hotel
        </h2>
        {/* Render the booking form and pass handlers */}
        <FlightAndHotelForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}

export default FlightAndHotel;
