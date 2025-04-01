// import React, { useState } from 'react';

// const FlightAndHotel = () => {
//   const [flightDetails, setFlightDetails] = useState({
//     from: '',
//     to: '',
//     departureDate: '',
//     returnDate: '',
//     passengers: 1,
//   });

//   const [hotelDetails, setHotelDetails] = useState({
//     destination: '',
//     checkInDate: '',
//     checkOutDate: '',
//     guests: 1,
//   });

//   const handleFlightChange = (e) => {
//     setFlightDetails({
//       ...flightDetails,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleHotelChange = (e) => {
//     setHotelDetails({
//       ...hotelDetails,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Handle form submission logic here
//     console.log('Flight Details:', flightDetails);
//     console.log('Hotel Details:', hotelDetails);
//   };

//   const today = new Date().toISOString().split('T')[0]; // Get today's date in the correct format (YYYY-MM-DD)


//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-gray-400 text-dark shadow-lg rounded-lg">
//       <h2 className="text-2xl font-semibold text-center mb-6">Flight & Hotel Booking</h2>
      
//       <form onSubmit={handleSubmit} className="space-y-8">
        
//         {/* Flight Booking Section */}
//         <div className="border-b-2 pb-6 mb-6">
//           <h3 className="text-xl font-medium mb-4">Flight Details</h3>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">From</label>
//               <input
//                 type="text"
//                 name="from"
//                 value={flightDetails.from}
//                 onChange={handleFlightChange}
//                 className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">To</label>
//               <input
//                 type="text"
//                 name="to"
//                 value={flightDetails.to}
//                 onChange={handleFlightChange}
//                 className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 required
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Departure Date</label>
//               <input
//                 type="date"
//                 name="departureDate"
//                 value={flightDetails.departureDate}
//                 onChange={handleFlightChange}
//                 className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 min={today}
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">Return Date</label>
//               <input
//                 type="date"
//                 name="returnDate"
//                 value={flightDetails.returnDate}
//                 onChange={handleFlightChange}
//                 className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 min={today}
//                 required
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Number of Passengers</label>
//             <input
//               type="number"
//               name="passengers"
//               value={flightDetails.passengers}
//               onChange={handleFlightChange}
//               min="1"
//               className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               required
//             />
//           </div>
//         </div>

//         {/* Hotel Booking Section */}
//         <div className="border-b-2 pb-6 mb-6">
//           <h3 className="text-xl font-medium mb-4">Hotel Details</h3>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Destination</label>
//               <input
//                 type="text"
//                 name="destination"
//                 value={hotelDetails.destination}
//                 onChange={handleHotelChange}
//                 className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">Check-In Date</label>
//               <input
//                 type="date"
//                 name="checkInDate"
//                 value={hotelDetails.checkInDate}
//                 onChange={handleHotelChange}
//                 className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 min={today}
//                 required
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Check-Out Date</label>
//               <input
//                 type="date"
//                 name="checkOutDate"
//                 value={hotelDetails.checkOutDate}
//                 onChange={handleHotelChange}
//                 className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 min={today}
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">Number of Guests</label>
//               <input
//                 type="number"
//                 name="guests"
//                 value={hotelDetails.guests}
//                 onChange={handleHotelChange}
//                 min="1"
//                 className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 required
//               />
//             </div>
//           </div>
//         </div>

//         <div className="text-center">
//           <button
//             type="submit"
//             className="w-full sm:w-auto px-6 py-3 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//           >
//             Book Now
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default FlightAndHotel;

import { useState } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function FlightAndHotel() {
    const { user } = useUser();
    const navigate = useNavigate();
    const [flightDetails, setFlightDetails] = useState({
        from: '',
        to: '',
        passengers: 1,
    });
    const [hotelDetails, setHotelDetails] = useState({
        hotel: '',
    });
    const [dates, setDates] = useState([null, null]); // [startDate, endDate]
    const today = new Date();

    const handleFlightChange = (e) => {
        setFlightDetails({ ...flightDetails, [e.target.name]: e.target.value });
    };

    const handleHotelChange = (e) => {
        setHotelDetails({ ...hotelDetails, [e.target.name]: e.target.value });
    };

    const handleDateChange = (selectedDates) => {
        setDates(selectedDates);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const [startDate, endDate] = dates;
        if (!startDate || !endDate) {
            toast.error('Please select a date range.');
            return;
        }

        const totalPrice = 500; // Placeholder
        const payload = {
            user_id: user.id,
            booking_type: 'flight_hotel',
            flight_details: flightDetails,
            hotel_details: hotelDetails,
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            persons: parseInt(flightDetails.passengers),
            total_price: totalPrice
        };
        console.log("Sending payload to backend:", JSON.stringify(payload, null, 2));
        try {
            const response = await axios.post(
                'http://localhost/Wanderlusttrails/backend/config/booking/createBooking.php',
                payload,
                { headers: { 'Content-Type': 'application/json' } }
            );
            console.log("Response from backend:", response.data);
            if (response.data.success) {
                toast.success('Booking saved! Proceed to payment.', { position: 'top-center', autoClose: 1000 });
                navigate('/Payment');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error("Error details:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers
            });
            toast.error('Error saving booking: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-400 shadow-lg rounded-lg">
            <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">Flight & Hotel Booking</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="border-b-2 pb-6">
                    <h3 className="text-xl font-medium mb-4 text-gray-800">Flight Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">From</label>
                            <input
                                type="text"
                                name="from"
                                value={flightDetails.from}
                                onChange={handleFlightChange}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">To</label>
                            <input
                                type="text"
                                name="to"
                                value={flightDetails.to}
                                onChange={handleFlightChange}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Passengers</label>
                            <input
                                type="number"
                                name="passengers"
                                value={flightDetails.passengers}
                                onChange={handleFlightChange}
                                min="1"
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                                required
                            />
                        </div>
                    </div>
                </div>
                <div className="border-b-2 pb-6">
                    <h3 className="text-xl font-medium mb-4 text-gray-800">Hotel Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Destination</label>
                            <input
                                type="text"
                                name="destination"
                                value={hotelDetails.destination}
                                onChange={handleHotelChange}
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                                required
                            />
                        </div>
                    </div>
                </div>
                <div className="border-b-2 pb-6">
                    <h3 className="text-xl font-medium mb-4 text-gray-800">Travel Dates</h3>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Select Date Range</label>
                            <DatePicker
                                selectsRange
                                startDate={dates[0]}
                                endDate={dates[1]}
                                minDate={today}
                                onChange={handleDateChange}
                                isClearable
                                dateFormat="MMM d, yyyy"
                                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
                                required
                            />
                        </div>
                    </div>
                </div>
                <div className="text-center">
                    <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-3 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                    >
                        Book Now
                    </button>
                </div>
            </form>
        </div>
    );
}

export default FlightAndHotel;