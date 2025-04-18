// path: Frontend/WanderlustTrails/src/pages/PackageBookingDetails.jsx
import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import BookingForm from '../components/forms/BookingDetailsForm';
import UserDetails from '../components/UserDetails';

function PackageBookingDetails() {
    const { user, isAuthenticated } = useUser();
    const navigate = useNavigate();
    
    const [packageDetails, setPackageDetails] = useState({ id: '', name: '', location: '', price: '', imageUrl: '' });

    useEffect(() => {
        console.log('[PackageBookingDetails] useEffect:', { isAuthenticated, userId: user?.id });
        const storedPackage = JSON.parse(sessionStorage.getItem('selectedPackage'));
        console.log('[PackageBookingDetails] storedPackage:', storedPackage);
        if (storedPackage) {
            setPackageDetails({
                id: storedPackage.id, 
                name: storedPackage.name,
                location: storedPackage.location,
                price: parseFloat(storedPackage.price),
                imageUrl: storedPackage.imageUrl
            });
        } else {
            console.log('[PackageBookingDetails] No package selected, redirecting to /TravelPackages');
            toast.error('No package selected. Please choose a package.');
            navigate('/TravelPackages');
        }
    }, [navigate]);

    const handleBookingSubmit = async (formData) => {
        console.log('[PackageBookingDetails] handleBookingSubmit:', { formData, userId: user?.id });
        const payload = {
            user_id: user.id,
            booking_type: 'package',
            package_id: packageDetails.id,
            package_name: packageDetails.name, 
            start_date: formData.startDate.toISOString().split('T')[0],
            end_date: formData.endDate.toISOString().split('T')[0],
            persons: formData.persons,
            total_price: formData.totalPrice
        };
        console.log('[PackageBookingDetails] Booking data being sent:', payload);
        try {
            const response = await axios.post(
                'http://localhost/WanderlustTrails/backend/config/booking/createBooking.php',
                payload,
                { headers: { 'Content-Type': 'application/json' } }
            );
            console.log('[PackageBookingDetails] Booking response:', response.data);
            if (response.data.success) {
                const updatedBookingData = { ...payload, booking_id: response.data.booking_id };
                sessionStorage.setItem('bookingData', JSON.stringify(updatedBookingData));
                console.log('[PackageBookingDetails] Booking data stored:', sessionStorage.getItem('bookingData'));
                toast.success('Booking saved! Proceed to payment.', { position: 'top-center', autoClose: 1000 });
                navigate('/Payment');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('[PackageBookingDetails] Error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
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
            <UserDetails user={user} />
        </div>
    );
}

export default PackageBookingDetails;