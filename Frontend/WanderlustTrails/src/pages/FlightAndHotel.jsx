//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/FlightAndHotel.jsx
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import FlightAndHotelForm from '../components/forms/FlightAndHotelForm';

function FlightAndHotel() {
  const navigate = useNavigate();
  const { user } = useUser();

  const handleSubmit = async (formData) => {
    if (!user?.id) {
      toast.error('Please log in to book.');
      navigate('/Login');
      return;
    }

    const payload = {
      user_id: user.id,
      booking_type: 'flight_hotel',
      flight_details: {
        from: formData.from,
        to: formData.to,
        class: formData.flightClass,
        preferred_time: formData.flightTime,
        airline: formData.airline === 'any' ? null : formData.airline,
        duration: formData.flightDuration, // Set by form
        insurance: formData.insurance,
      },
      hotel_details: {
        destination: formData.to,
        star_rating: parseInt(formData.hotelStars),
        amenities: formData.amenities,
        car_rental: formData.carRental,
      },
      start_date: formData.startDate.toISOString().split('T')[0],
      end_date: formData.roundTrip && formData.endDate
        ? formData.endDate.toISOString().split('T')[0]
        : null,
      persons: parseInt(formData.persons),
      total_price: formData.totalPrice,
    };

    console.log('Payload:', payload);

    try {
      const response = await axios.post(
        'http://localhost/WanderlustTrails/Backend/config/booking/createBooking.php',
        payload,
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('Booking response:', response.data);

      if (response.data.success) {
        const updatedBookingData = { ...payload, booking_id: response.data.booking_id, total_price: formData.totalPrice };
        sessionStorage.setItem('bookingData', JSON.stringify(updatedBookingData));
        toast.success('Booking saved! Proceed to payment.', { position: 'top-center', autoClose: 1000 });
        navigate('/Payment');
      } else {
        toast.error('Error saving booking: ' + response.data.message);
      }
    } catch (error) {
      console.error('Booking error:', error.response || error);
      toast.error('Error saving booking: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
        <FlightAndHotelForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}

export default FlightAndHotel;