// Path: Frontend/WanderlustTrails/src/pages/PackageBookingDetails.jsx

import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import $ from 'jquery'; // For AJAX requests
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import BookingForm from '../components/forms/BookingDetailsForm';
import UserDetails from '../components/UserDetails';

function PackageBookingDetails() {
  const { user, isAuthenticated } = useUser(); // Get user context and auth state
  const navigate = useNavigate();

  // State for selected package details
  const [packageDetails, setPackageDetails] = useState({
    id: '',
    name: '',
    location: '',
    price: '',
    imageUrl: '',
  });

  // Load selected package from sessionStorage on component mount
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
        imageUrl: storedPackage.imageUrl,
      });
    } else {
      // If no package is selected, notify user and redirect to package selection
      console.log('[PackageBookingDetails] No package selected, redirecting to /TravelPackages');
      toast.error('No package selected. Please choose a package.');
      navigate('/TravelPackages');
    }
  }, [navigate]);

  // Handle submission of booking form
  const handleBookingSubmit = (formData) => {
    console.log('[PackageBookingDetails] handleBookingSubmit:', { formData, userId: user?.id });

    // Validate insurance type with predefined valid options
    const validInsuranceTypes = ['none', 'basic', 'premium', 'elite'];
    const insuranceType = validInsuranceTypes.includes(formData.insurance) ? formData.insurance : 'none';

    // Prepare payload for backend API
    const payload = {
      user_id: user.id,
      booking_type: 'package',
      package_id: packageDetails.id,
      package_name: packageDetails.name,
      start_date: formData.start_date,
      end_date: formData.end_date,
      persons: formData.persons,
      insurance: insuranceType !== 'none' ? 1 : 0,
      insurance_type: insuranceType,
      total_price: formData.total_price, // Use total price calculated in form
    };
    console.log('[PackageBookingDetails] Booking data being sent:', payload);

    // Send booking data to backend
    $.ajax({
      url: 'http://localhost/WanderlustTrails/backend/config/booking/createBooking.php',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(payload),
      success: (response) => {
        console.log('[PackageBookingDetails] Booking response:', response);

        if (response.success) {
          // Append booking_id to stored booking data
          const updatedBookingData = {
            ...payload,
            booking_id: response.booking_id,
            total_price: formData.total_price, // Confirm total price from formData
          };

          // Save booking data in sessionStorage
          try {
            sessionStorage.setItem('bookingData', JSON.stringify(updatedBookingData));
            const storedData = sessionStorage.getItem('bookingData');
            console.log('[PackageBookingDetails] Booking data stored:', storedData);
            if (!storedData) {
              throw new Error('Failed to store bookingData in sessionStorage');
            }
          } catch (error) {
            console.error('[PackageBookingDetails] Error storing bookingData:', error);
            toast.error('Failed to store booking data. Please try again.');
            return;
          }

          // Check if user is authenticated before allowing payment
          if (!isAuthenticated || !user?.id) {
            toast.error('Please log in to proceed with payment.');
            navigate('/Login');
            return;
          }

          // Notify user and navigate to payment page
          toast.success('Booking saved! Proceed to payment.', { position: 'top-center', autoClose: 1000 });
          setTimeout(() => {
            console.log('[PackageBookingDetails] Navigating to /Payment');
            navigate('/Payment', { replace: false });
          }, 1200);
        } else {
          // Display backend error message
          toast.error(response.message);
        }
      },
      error: (xhr, status, error) => {
        console.error('[PackageBookingDetails] Error:', {
          status,
          error,
          response: xhr.responseText,
        });

        // Try parsing backend error response for detailed message
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

  return (
    <div className="min-h-screen p-6 flex flex-col items-center bg-gray-100">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Booking Details</h1>

      <div className="flex flex-wrap justify-between bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
        {/* Display package information */}
        <div className="w-full md:w-1/3 mb-4">
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">Your Selected Package</h2>
          <p className="text-gray-700">
            <strong>Title:</strong> {packageDetails.name}
          </p>
          <p className="text-gray-700">
            <strong>Location:</strong> {packageDetails.location}
          </p>
          <p className="text-gray-700">
            <strong>Price:</strong> ${packageDetails.price} Per Head
          </p>
        </div>

        {/* Package image */}
        <div
          className="w-full md:w-2/3 h-64 bg-cover bg-center rounded-lg"
          style={{ backgroundImage: `url(/assets/Images/packages/${packageDetails.imageUrl}.jpg)` }}
        ></div>

        {/* Booking form */}
        <BookingForm pricePerPerson={packageDetails.price} onSubmit={handleBookingSubmit} />
      </div>

      {/* User details section */}
      <UserDetails user={user} />
    </div>
  );
}

export default PackageBookingDetails;
