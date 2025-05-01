
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import ItineraryForm from '../components/forms/ItineraryForm.jsx';
import mockData from '../data/mockData.js'; // Adjust the path as necessary
import $ from 'jquery'; // Import jQuery if installed via npm; otherwise, ensure it's loaded via CDN

const CustomizedItinerary = () => {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleSubmit = (formData) => {
    if (!isAuthenticated || !user?.id) {
      toast.error('Please log in to proceed with booking.');
      navigate('/Login');
      return;
    }

    const bookingData = {
      user_id: user.id,
      booking_type: 'itinerary',
      package_id: formData.package_id,
      itinerary_details: formData.itinerary_details,
      start_date: formData.start_date,
      end_date: formData.end_date,
      persons: formData.persons,
      total_price: formData.total_price,
      insurance: formData.insurance !== 'none' ? 1 : 0, // Set to 1 if insurance is selected, 0 otherwise
    insurance_type: formData.insurance, // Directly use the selected insurance type
    };

    $.ajax({
      url: 'http://localhost/Wanderlusttrails/Backend/config/booking/createBooking.php',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(bookingData),
      dataType: 'json',
      success: (response) => {
        console.log('Booking response:', response);
        if (response.success) {
          const updatedBookingData = { ...bookingData, booking_id: response.booking_id };
          sessionStorage.setItem('bookingData', JSON.stringify(updatedBookingData));
          sessionStorage.setItem('selectedPackage', JSON.stringify(formData.selectedPackage));
          toast.success('Itinerary saved! Proceeding to payment.', { position: 'top-center', autoClose: 1000 });
          navigate('/Payment');
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

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-300 mb-8 text-center">
          Design Your Itinerary
        </h1>
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