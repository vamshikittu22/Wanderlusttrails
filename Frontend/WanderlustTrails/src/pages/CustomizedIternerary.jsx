// path: Frontend/WanderlustTrails/src/pages/CustomisedItinerary.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import ItineraryForm from '../components/forms/ItineraryForm.jsx';
import mockData from '../data/mockData.js'; // Adjust the path as necessary
import $ from 'jquery'; // Import jQuery if installed via npm; otherwise, ensure it's loaded via CDN

const CustomizedItinerary = () => {
  // Get current user and authentication status from context
  const { user, isAuthenticated } = useUser();
  // Hook to navigate programmatically
  const navigate = useNavigate();
  // State to hold available packages fetched from backend
  const [packages, setPackages] = useState([]);
  // Loading state to show spinner or loading message
  const [loading, setLoading] = useState(true);
  // State to capture any error during fetching
  const [error, setError] = useState(null);

  // Fetch packages once on component mount
  useEffect(() => {
    const fetchPackages = () => {
      $.ajax({
        url: 'http://localhost/Wanderlusttrails/Backend/config/AdminDashboard/manageDestinations/viewPackage.php',
        type: 'GET',
        dataType: 'json',
        success: (data) => {
          console.log('Fetched packages:', data);
          setPackages(data);
          setLoading(false);
        },
        error: (xhr, status, err) => {
          console.error('Error fetching packages:', err);
          setError('Failed to fetch packages');
          setLoading(false);
        },
      });
    };

    fetchPackages();
  }, []);

  // Handler for form submission of itinerary booking
  const handleSubmit = (formData) => {
    // Check if user is authenticated
    if (!isAuthenticated || !user?.id) {
      toast.error('Please log in to proceed with booking.');
      navigate('/Login');
      return;
    }

    // Prepare booking data for the backend
    const bookingData = {
      user_id: user.id,
      booking_type: 'itinerary',
      package_id: formData.package_id,
      itinerary_details: formData.itinerary_details,
      start_date: formData.start_date,
      end_date: formData.end_date,
      persons: formData.persons,
      total_price: formData.total_price,
      insurance: formData.insurance !== 'none' ? 1 : 0, // Convert insurance choice to boolean flag
      insurance_type: formData.insurance, // Insurance type string
    };

    // Post booking data to backend API
    $.ajax({
      url: 'http://localhost/Wanderlusttrails/Backend/config/booking/createBooking.php',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(bookingData),
      dataType: 'json',
      success: (response) => {
        console.log('Booking response:', response);
        if (response.success) {
          // Save booking and package info in sessionStorage for next page use
          const updatedBookingData = { ...bookingData, booking_id: response.booking_id };
          sessionStorage.setItem('bookingData', JSON.stringify(updatedBookingData));
          sessionStorage.setItem('selectedPackage', JSON.stringify(formData.selectedPackage));
          toast.success('Itinerary saved! Proceeding to payment.', { position: 'top-center', autoClose: 1000 });
          navigate('/Payment'); // Navigate to payment page
        } else {
          toast.error(response.message);
        }
      },
      error: (xhr, status, error) => {
        console.error('Error saving booking:', error);
        let errorMessage = 'Error saving itinerary';
        try {
          const response = JSON.parse(xhr.responseText);
          errorMessage = response.message || errorMessage;
        } catch (e) {
          errorMessage = xhr.responseText || error;
        }
        toast.error(errorMessage);
      },
    });
  };

  // Handler for cancel action to navigate home
  const handleCancel = () => {
    navigate('/');
  };

  return (
    // Page container with padding and background color
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page title */}
        <h1 className="text-3xl font-bold text-indigo-300 mb-8 text-center">
          Design Your Itinerary
        </h1>
        {/* Itinerary form component */}
        <ItineraryForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          packages={packages}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default CustomizedItinerary;
