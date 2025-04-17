//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx

import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import BookingForm from '../components/forms/BookingDetailsForm';
import UserDetails from '../components/UserDetails';


function PackageBookingDetails() {
    const { user } = useUser();
        const navigate = useNavigate();
    
    const [packageDetails, setPackageDetails] = useState({ id: '',name: '', location: '', price: '', imageUrl: '' });

    useEffect(() => {
        const storedPackage = JSON.parse(sessionStorage.getItem('selectedPackage'));
        if (storedPackage) {
            setPackageDetails({
                id: storedPackage.id, 
                name: storedPackage.name,
                location: storedPackage.location,
                price: parseFloat(storedPackage.price),
                imageUrl: storedPackage.imageUrl
            });
        }
    }, []);

    const handleBookingSubmit = async (formData) => {
        const payload = {
            user_id: user.id,
            booking_type: 'package',
            package_id: packageDetails.id,
            package_name: packageDetails.name, 
            start_date: formData.startDate.toISOString().split('T')[0],
            end_date: formData.endDate.toISOString().split('T')[0],
            persons: formData.persons,
            total_price: formData.totalPrice
            // Add any other necessary fields from formData
        };
        console.log("Booking data being sent:", payload);
        try {
            const response = await axios.post(
                'http://localhost/WanderlustTrails/backend/config/booking/createBooking.php',
                payload,
                { headers: { 'Content-Type': 'application/json' } }
            );
            console.log("Booking response:", response.data);
            if (response.data.success) {
                const updatedBookingData = { ...payload, booking_id: response.data.booking_id };
                sessionStorage.setItem('bookingData', JSON.stringify(updatedBookingData));
                console.log("Booking data stored in sessionStorage:", sessionStorage.getItem('bookingData'));
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
            return false; 
        }
       
    };

    return (
        <div className="min-h-screen p-6 flex flex-col items-center bg-gray-100">
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">Booking Details</h1>
            <div className="flex flex-wrap justify-between bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
                <div className="w-full md:w-1/3 mb-4">
                    <h2 className="text-2xl font-semibold text-gray-600 mb-4">Your Selected Package</h2>
                    <p className="text-gray-700"><strong>Title:</strong> {packageDetails.name}</p>
                    <p className="text-gray-700"><strong>Location:</strong> {packageDetails.location}</p>
                    <p className="text-gray-700"><strong>Price:</strong> ${packageDetails.price} Per Head</p>
                </div>
                <div className="w-full md:w-2/3 h-64 bg-cover bg-center rounded-lg" style={{ backgroundImage: `url(/assets/Images/packages/${packageDetails.imageUrl}.jpg)` }}></div>
                <BookingForm pricePerPerson={packageDetails.price} onSubmit={handleBookingSubmit} />
            </div>

            {/* User Details */}
//         <UserDetails user={user} />
        </div>
    );
}

export default PackageBookingDetails;