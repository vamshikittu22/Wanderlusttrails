// Path: Frontend/WanderlustTrails/src/pages/Payment.jsx

import React, { useState, useEffect } from 'react';  // React hooks for state and lifecycle
import { useNavigate, useLocation } from 'react-router-dom';  // Navigation and location hooks from react-router
import { useUser } from '../context/UserContext';  // Custom hook to access user authentication context
import { FaSpinner, FaCreditCard, FaPaypal, FaUniversity } from 'react-icons/fa';  // Icons for payment methods and loading spinner
import { v4 as uuidv4 } from 'uuid';  // UUID generator for unique transaction IDs
import $ from 'jquery';  // jQuery for AJAX requests
import { toast, ToastContainer } from 'react-toastify';  // Toast notifications for user feedback
import 'react-toastify/dist/ReactToastify.css';  // Styles for toast notifications

// ErrorBoundary component to catch JS errors in child components and show fallback UI
const ErrorBoundary = ({ children, navigate }) => { 
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Listen for uncaught errors globally
    const errorHandler = (error, errorInfo) => {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
      setHasError(true); // Set error state to show fallback UI
    };

    window.addEventListener('error', errorHandler);

    // Cleanup listener on unmount
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  // If error caught, show error message with button to go back
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-900 py-8 px-4 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="mb-4">Please try refreshing the page or go back to the previous page.</p>
          <button
            onClick={() => navigate(-1)} // Go back to previous page
            className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // If no error, render child components normally
  return children;
};

// ✅ Custom hook for clean booking data loading
const useBookingData = () => {
  const [bookingInfo, setBookingInfo] = useState({
    totalPrice: 0,
    bookingId: null,
    details: null,
    isPackage: false,
    bookingType: null,
    referrerPage: null
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadData = () => {
      try {
        const data = JSON.parse(sessionStorage.getItem('bookingData') || '{}');
        
        if (data.booking_id && data.total_price > 0) {

// ✅ Determine booking type and referrer page
          let bookingType = data.booking_type;
          let referrerPage = '/';

          console.log('Determining booking type from data:', data);
          // ✅ Smart booking type detection
          if (bookingType === 'package') {
            bookingType = 'package';
            referrerPage = '/TravelPackages';
            console.log('Detected package booking');
          } else if ( bookingType === 'flight_hotel') {
            referrerPage = '/FlightAndHotel';
            console.log('Detected flight and hotel booking');
          } else if ( bookingType === 'itinerary') {
            referrerPage = '/CustomizedItinerary';
            console.log('Detected customised itinerary booking');
          }          

          setBookingInfo({
            totalPrice: parseFloat(data.total_price),
            bookingId: data.booking_id,
            details: {
              package_name: data.package_name || 'Travel Booking',
              persons: data.persons || 1,
              start_date: data.start_date,
              end_date: data.end_date
            },
            isPackage: !!data.package_id,
            bookingType: bookingType,      // ✅ SET THE TYPE
            referrerPage: referrerPage     // ✅ SET THE REFERRER
          });
          setIsLoaded(true);
        }
      } catch (error) {
        console.error('Booking data loading error:', error);
      }
    };

    loadData();
  }, []);

  return { bookingInfo, isLoaded };
};

function Payment() {
  // Destructure user info and authentication state from context
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();  // Hook for navigation
  const location = useLocation();  // Hook for current location
 
  // ✅ Using custom hook for booking data
  const { bookingInfo, isLoaded } = useBookingData();
  const { totalPrice, bookingId, details: bookingDetails, isPackage } = bookingInfo;
  

  const [paymentMethod, setPaymentMethod] = useState('credit_card');  // Default payment method
  // Form fields for different payment types
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    paypalEmail: '',
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
  });
  const [errors, setErrors] = useState({});  // Validation errors
  const [isLoading, setIsLoading] = useState(false);  // Loading state for async operations
  const [termsAccepted, setTermsAccepted] = useState(false);  // Terms and conditions checkbox
  const [transactionId, setTransactionId] = useState(uuidv4());  // Unique transaction ID for payment
  const [timeLeft, setTimeLeft] = useState(90); // Countdown timer in seconds (90 seconds)
  const [isMounted, setIsMounted] = useState(false);  // Track if component is mounted to avoid state updates on unmounted components
  const [retryCount, setRetryCount] = useState(0);  // Retry count for failed attempts
  const MAX_RETRIES = 3;  // Max allowed retries for payment attempts
 

  // ✅ Updated referrer logic to use bookingInfo
  const referrer = location.state?.from || (bookingInfo?.referrerPage) || '/';

useEffect(() => {
  setIsMounted(true);

  // Check authentication first
  if (!isAuthenticated || !user?.id) {
    setTimeout(() => {
      if (isMounted) {
        toast.error('Please log in to proceed with payment.');
        navigate('/Login');
      }
    }, 100);
    return;
  }

  // ✅ CRITICAL: Don't wait indefinitely - validate after reasonable time
  const validateBooking = () => {
    // ✅ Check if we have valid booking data
    if (!bookingId || !totalPrice || totalPrice <= 0) {
      toast.error('No valid booking found. Please complete booking first.');
      navigate('/');
      return;
    }

    // ✅ Start timer only when we have valid data
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!isLoading) failPayment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      setIsMounted(false);
    };
  };

  // ✅ If hook loaded but no data, redirect immediately
  if (isLoaded && (!bookingId || !totalPrice || totalPrice <= 0)) {
    toast.error('No booking found. Please complete booking first.');
    navigate('/');
    return;
  }

  // ✅ If hook is loaded with valid data, start validation
  if (isLoaded && bookingId && totalPrice > 0) {
    return validateBooking();
  }

  // ✅ TIMEOUT: If hook takes too long to load, assume no data
  const loadingTimeout = setTimeout(() => {
    if (!isLoaded) {
      toast.error('Failed to load booking data. Please try again.');
      navigate('/');
    }
  }, 2000); // 2 second timeout

  return () => {
    clearTimeout(loadingTimeout);
    setIsMounted(false);
  };
}, [navigate, isMounted, isLoading, isLoaded, bookingId, totalPrice]);


  // Function to cancel booking after payment failure or timeout
  const cancelBookingAfterFailure = (reason = 'Payment failed') => {
    if (!bookingId || !user?.id) {
      console.log('Cannot cancel booking: missing booking ID or user ID');
      return;
    }

    // ✅ ADD THIS DEBUG BLOCK
  console.log('=== CANCEL BOOKING DEBUG ===');
  console.log('Booking ID to cancel:', bookingId);
  console.log('User ID to cancel:', user.id, 'Type:', typeof user.id);
  console.log('Parsed User ID:', parseInt(user.id, 10));
  
  // ✅ Check what's in sessionStorage
  const sessionData = JSON.parse(sessionStorage.getItem('bookingData') || '{}');
  console.log('Session booking data:', sessionData);
  console.log('Session booking_id:', sessionData.booking_id);
  console.log('Session user_id:', sessionData.user_id || sessionData.userid);
  
    console.log(`Canceling booking ${bookingId} due to: ${reason}`);
    
    // AJAX POST request to cancel the booking
    $.ajax({
      url: 'http://localhost/wanderlusttrails/Backend/config/booking/cancelBooking.php',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        booking_id: bookingId,
        user_id: parseInt(user.id, 10)
      }),
      success: (cancelResponse) => {
        console.log('Booking auto-cancellation response:', cancelResponse);
        if (cancelResponse.success) {
          console.log(`Booking ${bookingId} successfully canceled after payment failure`);
          // Don't show additional toast here, parent function will handle user feedback
        } else {
          console.error('Failed to cancel booking:', cancelResponse.message);
          // Only log error, don't interrupt user experience with additional error
        }
      },
      error: (xhr, status, error) => {
        console.error('Error canceling booking after payment failure:', error, xhr.responseText);
        // Only log error, don't interrupt user experience with additional error
      }
    });
  };

  // Function to mark payment as failed after timeout (3 minutes)
  const failPayment = () => {
    if (!isMounted) {
      console.log('Component unmounted, skipping failPayment');
      return;
    }

    console.log('Timer expired, marking payment as failed if it exists:', transactionId);
    // AJAX POST request to update payment status to 'failed' on backend
    $.ajax({
      url: 'http://localhost/wanderlusttrails/Backend/config/payment/updatePaymentStatus.php',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ transaction_id: transactionId, payment_status: 'failed' }),
      success: (response) => {
        console.log('Fail response:', response);
        if (isMounted) {
          // Cancel booking after payment timeout
          cancelBookingAfterFailure('Payment timed out after 3 minutes');
          
          toast.error('Payment timed out after 3 minutes. Booking has been canceled.');
          navigate(referrer);
        }
      },
      error: (xhr, status, error) => {
        console.error('Failed to update status:', error, xhr.responseText);
        if (isMounted) {
          // ✅ ADDED: Cancel booking even if payment status update fails
          cancelBookingAfterFailure('Payment timeout error');
          
          // If 404, treat as payment timeout; else show error
          if (xhr.status === 404) {
            toast.error('Payment timed out after 3 minutes. Booking has been canceled.');
          } else {
            toast.error('Error timing out payment. Booking has been canceled.');
          }
          navigate(referrer);
        }
      },
    });
  };

  // Validate form fields based on selected payment method
  const validateForm = () => {
    console.log('Validating:', { paymentMethod, formData });
    const newErrors = {};

    if (['credit_card', 'debit_card'].includes(paymentMethod)) {
      if (!formData.nameOnCard) newErrors.nameOnCard = 'Name required';
      if (!/^\d{4} \d{4} \d{4} \d{4}$/.test(formData.cardNumber)) newErrors.cardNumber = 'Invalid card';

      if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Invalid MM/YY';
      } else {
        const [month, year] = formData.expiryDate.split('/').map(Number);
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        const expiryYear = parseInt(year, 10);
        const expiryMonth = parseInt(month, 10);
        // Expiry date must be valid and not in the past
        if (
          expiryMonth < 1 || expiryMonth > 12 ||
          (expiryYear < currentYear) ||
          (expiryYear === currentYear && expiryMonth < currentMonth)
        ) {
          newErrors.expiryDate = 'Card expired';
        }
      }

      if (!/^\d{3}$/.test(formData.cvv)) newErrors.cvv = 'Invalid CVV';
    } else if (paymentMethod === 'paypal') {
      // Simple email regex for PayPal email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.paypalEmail)) {
        newErrors.paypalEmail = 'Invalid PayPal email';
      }
    } else if (paymentMethod === 'bank_transfer') {
      // Bank transfer fields validation
      if (!formData.accountHolderName) newErrors.accountHolderName = 'Account holder name required';
      if (!formData.bankName) newErrors.bankName = 'Bank name required';
      if (!formData.accountNumber) newErrors.accountNumber = 'Account number required';
      if (!/^\d{9}$/.test(formData.routingNumber)) newErrors.routingNumber = 'Invalid routing number (must be 9 digits)';
    }

    if (!termsAccepted) newErrors.terms = 'Accept terms';

    setErrors(newErrors);
    console.log('Errors:', newErrors);
    // Return true if no errors
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes with formatting (e.g., card number spacing)
  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number as groups of 4 digits separated by spaces
    if (name === 'cardNumber') {
      const cleaned = value.replace(/\D/g, ''); // Remove non-digits
      const parts = cleaned.match(/.{1,4}/g);
      formattedValue = parts ? parts.join(' ') : cleaned;
    } 
    // For routing number and account number, allow digits only
    else if (name === 'routingNumber' || name === 'accountNumber') {
      formattedValue = value.replace(/\D/g, '');
    }

    // Update form data and clear any previous errors on this field
    setFormData({ ...formData, [name]: formattedValue });
    setErrors({ ...errors, [name]: '' });
  };

  // Mask card number except last 4 digits for security display
  const maskCardNumber = (number) => {
    return number ? '**** **** **** ' + number.slice(-4) : '';
  };

const handleSubmit = (e) => {
  e.preventDefault(); // Prevent default form submission behavior
  console.log('Submitting:', { paymentMethod, formData, transactionId });

  // Validate the form inputs before proceeding
  if (!validateForm()) {
    toast.error('Please fix form errors.');
    return;
  }

  // Check if user is logged in (user ID must exist)
  if (!user?.id) {
    console.log('No user ID, redirecting');
    toast.error('Please log in.');
    navigate('/Login');
    return;
  }

  // Check if booking ID is present
  if (!bookingId) {
    console.log('No booking ID, redirecting');
    toast.error('Booking ID is missing. Please try again.');
    navigate(referrer); // Redirect user back to referring page
    return;
  }

  // Parse user ID to numeric value and validate
  const numericUserId = parseInt(user.id, 10);
  console.log('User ID in handleSubmit:', user.id, 'Parsed:', numericUserId);
  if (isNaN(numericUserId)) {
    console.error('Invalid user_id:', user.id);
    toast.error('Invalid user ID. Please log in again.');
    navigate('/Login');
    return;
  }

  setIsLoading(true); // Show loading indicator

  // Format current date and time for payment_date field
  const paymentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

  // Prepare payment data object for submission
  const paymentData = {
    booking_id: bookingId,
    user_id: numericUserId,
    amount: parseFloat(totalPrice),
    payment_method: paymentMethod,
    transaction_id: transactionId,
    payment_date: paymentDate,
  };

  // Check for any missing or invalid required payment fields
  const requiredFields = ['booking_id', 'user_id', 'amount', 'payment_method', 'transaction_id', 'payment_date'];
  const missingFields = requiredFields.filter(field => !paymentData[field] || (field === 'amount' && paymentData[field] <= 0));
  console.log('Payment data before submission:', paymentData);
  if (missingFields.length > 0) {
    console.error('Missing or invalid fields:', missingFields);
    toast.error(`Missing or invalid fields: ${missingFields.join(', ')}`);
    setIsLoading(false);
    return;
  }

  // First, check if a payment with this booking ID already exists
  $.ajax({
    url: 'http://localhost/wanderlusttrails/Backend/config/payment/getPaymentDetails.php',
    method: 'GET',
    data: { booking_id: bookingId },
    success: (response) => {
      console.log('Get payment details response:', response);
      if (response.success && response.data) {
        // Look for an existing payment with the same transaction ID
        const existingPayment = response.data.find(payment => payment.transaction_id === transactionId);
        if (existingPayment) {
          // If found, update the payment status to 'completed'
          $.ajax({
            url: 'http://localhost/wanderlusttrails/Backend/config/payment/updatePaymentStatus.php',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ transaction_id: transactionId, payment_status: 'completed' }),
            success: (updateResponse) => {
              console.log('Update payment status response:', updateResponse);
              if (updateResponse.success) {
                completePayment(); // Proceed to finalize the payment
              } else {
                // ✅ ADDED: Cancel booking if payment status update fails
                console.log('Payment status update failed:', updateResponse.message);
                cancelBookingAfterFailure('Payment status update failed');
                
                toast.error('Failed to update payment status: ' + updateResponse.message + '. Booking has been canceled.');
                navigate(referrer);
                setIsLoading(false);
              }
            },
            error: (xhr, status, error) => {
              // ✅ ADDED: Cancel booking if payment status update has error
              console.error('Error updating payment status:', error, xhr.responseText);
              cancelBookingAfterFailure('Payment status update error');
              
              toast.error('Error updating payment status. Booking has been canceled.');
              navigate(referrer);
              setIsLoading(false);
            },
          });
        } else {
          // No existing payment with this transaction ID, create a new payment record
          createPayment(paymentData);
        }
      } else {
        // No existing payments found, create new payment
        createPayment(paymentData);
      }
    },
    error: (xhr, status, error) => {
      // On error fetching payment details, fallback to creating new payment
      console.error('Error checking existing payments:', error, xhr.responseText);
      createPayment(paymentData);
    },
  });
};

const createPayment = (paymentData) => {
  // Create a new payment record by sending payment data to backend
  $.ajax({
    url: 'http://localhost/wanderlusttrails/Backend/config/payment/createPayment.php',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(paymentData),
    success: (response) => {
      console.log('Create payment API response:', response);
      if (response.success) {
        completePayment(); // Finalize payment process
      } else {
        // Handle duplicate transaction ID errors with retry logic
        if (response.message && response.message.includes('Transaction ID already exists')) {
          if (retryCount >= MAX_RETRIES) {
            console.error('Max retries reached for transaction ID regeneration');
            
            // ✅ ADDED: Cancel booking after max retries exceeded
            cancelBookingAfterFailure('Max payment retries exceeded');
            
            toast.error('Unable to process payment: Transaction ID conflict. Booking has been canceled.');
            navigate(referrer);
            setIsLoading(false);
            return;
          }
          console.log('Duplicate transaction ID detected, regenerating...');
          setTransactionId(uuidv4()); // Generate new UUID for transaction ID
          setRetryCount(prev => prev + 1); // Increment retry count
          handleSubmit({ preventDefault: () => {} }); // Retry submission recursively without event
        } else {
          // ✅ ENHANCED: Cancel booking when payment creation fails
          console.log('Payment failed:', response.message);
          cancelBookingAfterFailure('Payment creation failed: ' + response.message);
          
          toast.error('Payment failed: ' + response.message + '. Booking has been canceled.');
          navigate(referrer);
          setIsLoading(false);
        }
      }
    },
    error: (xhr, status, error) => {
      console.error('Error creating payment:', error, xhr.responseText);
      
      // ✅ ADDED: Cancel booking when payment creation has AJAX error
      let errorMessage = 'Payment failed: ';
      // Customize error message based on status code
      if (xhr.status === 400) {
        errorMessage += xhr.responseText;
      } else if (xhr.status === 403) {
        errorMessage += 'User does not match booking. Please log in with the correct account.';
      } else if (xhr.status === 405) {
        errorMessage += 'Method not allowed. Please contact support.';
      } else {
        errorMessage += 'Internal server error. Please try again later.';
      }
      
      // Cancel booking after any payment error
      cancelBookingAfterFailure('Payment AJAX error: ' + error);
      
      toast.error(errorMessage + ' Booking has been canceled.');
      navigate(referrer);
      setIsLoading(false);
    },
    complete: () => {
      setIsLoading(false); // Hide loading spinner regardless of success or failure
    },
  });
};

  const completePayment = () => {
    const numericUserId = parseInt(user.id, 10);
    
    setTimeLeft(0); // Reset any payment countdown timer

    // Update booking status to 'confirmed' after successful payment
    $.ajax({
      url: 'http://localhost/wanderlusttrails/Backend/config/booking/updateBookingStatus.php',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ booking_id: bookingId, user_id: numericUserId, status: 'confirmed' }),
      success: (statusRes) => {
        console.log('Status response:', statusRes);
        if (statusRes.success) {
            const rate = totalPrice.toFixed(2);
            //  Show success toast with better configuration
            toast.success(`Payment of $${totalPrice.toFixed(2)} USD successful!`, {
                      position: "top-center",
                      autoClose: 2500,
                      hideProgressBar: false,
                      theme: "colored"
                    });        
            // window.alert(`Payment of $${rate} USD successful! Booking confirmed.`);
          
          sessionStorage.removeItem('bookingData'); // Clear booking session data
          sessionStorage.removeItem('selectedPackage'); // Clear package selection session data
          // Check if user session is still valid

          if (!isAuthenticated) {
            console.error('User is no longer authenticated after payment', {
              isAuthenticated,
              token: localStorage.getItem('token'),
              user: localStorage.getItem('user'),
            });
            toast.error('Session expired. Please log in again.');
            navigate('/Login'); // Redirect to login
            return;
          }

          toast.info('Redirecting to your dashboard...');

          // Redirect user to appropriate dashboard based on role
          const dashboardPath = user.role === 'admin' ? '/AdminDashboard' : '/UserDashboard';
          console.log('Navigating to dashboard:', dashboardPath, { userRole: user.role });
          navigate(dashboardPath);

          // setTimeout(() => {
          //   const dashboardPath = user.role === 'admin' ? '/AdminDashboard' : '/UserDashboard';
          //   console.log('Navigating to dashboard:', dashboardPath);
          //   navigate(dashboardPath);
          // }, 2000);  // 2 second delay

        } else {
          console.log('Status failed:', statusRes.message);
          toast.error('Payment recorded, but status update failed: ' + statusRes.message);
        }
      },
      error: (xhr, status, error) => {
        console.error('Status error:', error, xhr.responseText);
        toast.error('Status update failed: ' + xhr.responseText);
      },
      complete: () => {
        setIsLoading(false);
      },
    });
  };

  const formatTime = (seconds) => {
    // Convert seconds to MM:SS format for display
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    // Wrap everything in an ErrorBoundary component to catch errors and navigate accordingly
    <ErrorBoundary navigate={navigate}>
      {/* Main container with min height, background color, and padding */}
      <div className="min-h-screen bg-gray-900 py-8 px-4">
        {/* Centered container with max width */}
        <div className="max-w-3xl mx-auto">
          {/* Step indicator bar */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-3">
              {/* Step 1 circle and label */}
              <span className="w-6 h-6 bg-gray-700 text-gray-400 rounded-full flex items-center justify-center">1</span>
              <span className="text-gray-400">Details</span>
              {/* Connecting bar between steps */}
              <div className="w-8 h-1 bg-gray-700"></div>
              {/* Step 2 circle and label (current step) */}
              <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center">2</span>
              <span className="text-gray-300">Payment</span>
            </div>
          </div>

          {/* Page title */}
          <h2 className="text-2xl font-bold text-indigo-300 mb-6 text-center">Pay Now</h2>

          {/* Payment form container with white background, rounded corners, padding, and max width */}
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            {/* Display countdown timer in red text */}
            <p className="text-red-600 text-sm mb-4">Time left: {formatTime(timeLeft)}</p>

            {/* Display booking summary if bookingDetails exist */}
            {bookingDetails && (
              <div className="mb-4 p-3 bg-gray-100 rounded">
                <h3 className="text-lg font-semibold text-gray-800">Summary</h3>
                {/* Show package details if isPackage is true */}
                {isPackage ? (
                  <>
                    <p className="text-gray-600">Package: {bookingDetails.package_name || 'N/A'}</p>
                    <p className="text-gray-600">Destination: {bookingDetails.destination || 'N/A'}</p>
                    <p className="text-gray-600">Duration: {bookingDetails.duration || 'N/A'}</p>
                  </>
                ) : (
                  <>
                    {/* Show travel dates and locations if not a package */}
                    <p className="text-gray-600">From: {bookingDetails.from || 'N/A'}</p>
                    <p className="text-gray-600">To: {bookingDetails.to || 'N/A'}</p>
                    <p className="text-gray-600">
                      Dates:{' '}
                      {bookingDetails.start_date
                        ? new Date(bookingDetails.start_date).toLocaleDateString()
                        : 'N/A'}{' '}
                      {bookingDetails.end_date
                        ? `- ${new Date(bookingDetails.end_date).toLocaleDateString()}`
                        : ''}
                    </p>
                  </>
                )}
                {/* Number of persons */}
                <p className="text-gray-600">Persons: {bookingDetails.persons || 'N/A'}</p>
                {/* Total price displayed in blue */}
                <p className="text-lg text-blue-600">Total: ${totalPrice.toFixed(2)} USD</p>
              </div>
            )}

            {/* Payment form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Payment method selection */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Select Payment Method
                </label>
                {/* Buttons for different payment methods arranged in grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Credit Card payment button */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`flex items-center p-3 border rounded-lg transition-all duration-200 ${
                      paymentMethod === 'credit_card'
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-300 hover:border-indigo-300'
                    }`}
                    aria-label="Select Credit Card payment method"
                  >
                    {/* Credit card icon */}
                    <FaCreditCard className={`mr-2 ${paymentMethod === 'credit_card' ? 'text-indigo-600' : 'text-gray-600'}`} />
                    {/* Label */}
                    <span className={paymentMethod === 'credit_card' ? 'text-indigo-600 font-medium' : 'text-gray-600'}>
                      Credit Card
                    </span>
                  </button>

                  {/* Debit Card payment button */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('debit_card')}
                    className={`flex items-center p-3 border rounded-lg transition-all duration-200 ${
                      paymentMethod === 'debit_card'
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-300 hover:border-indigo-300'
                    }`}
                    aria-label="Select Debit Card payment method"
                  >
                    <FaCreditCard className={`mr-2 ${paymentMethod === 'debit_card' ? 'text-indigo-600' : 'text-gray-600'}`} />
                    <span className={paymentMethod === 'debit_card' ? 'text-indigo-600 font-medium' : 'text-gray-600'}>
                      Debit Card
                    </span>
                  </button>

                  {/* PayPal payment button */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`flex items-center p-3 border rounded-lg transition-all duration-200 ${
                      paymentMethod === 'paypal'
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-300 hover:border-indigo-300'
                    }`}
                    aria-label="Select PayPal payment method"
                  >
                    <FaPaypal className={`mr-2 ${paymentMethod === 'paypal' ? 'text-indigo-600' : 'text-gray-600'}`} />
                    <span className={paymentMethod === 'paypal' ? 'text-indigo-600 font-medium' : 'text-gray-600'}>
                      PayPal
                    </span>
                  </button>

                  {/* Bank Transfer payment button */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`flex items-center p-3 border rounded-lg transition-all duration-200 ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-300 hover:border-indigo-300'
                    }`}
                    aria-label="Select Bank Transfer payment method"
                  >
                    <FaUniversity className={`mr-2 ${paymentMethod === 'bank_transfer' ? 'text-indigo-600' : 'text-gray-600'}`} />
                    <span className={paymentMethod === 'bank_transfer' ? 'text-indigo-600 font-medium' : 'text-gray-600'}>
                      Bank Transfer
                    </span>
                  </button>
                </div>
              </div>

              {/* Credit Card or Debit Card payment form fields */}
              {['credit_card', 'debit_card'].includes(paymentMethod) && (
                <>
                  {/* Name on Card input */}
                  <div>
                    <label className="block text-gray-700 font-medium" htmlFor="name-on-card">
                      Name on Card
                    </label>
                    <input
                      id="name-on-card"
                      type="text"
                      name="nameOnCard"
                      value={formData.nameOnCard}
                      onChange={handleChange}
                      className="w-full p-2 border rounded text-gray-600"
                      placeholder="John Doe"
                      aria-label="Name on card"
                      aria-describedby={errors.nameOnCard ? "name-on-card-error" : undefined}
                    />
                    {/* Show validation error if exists */}
                    {errors.nameOnCard && (
                      <p id="name-on-card-error" className="text-red-500 text-sm">{errors.nameOnCard}</p>
                    )}
                  </div>

                  {/* Card Number input */}
                  <div>
                    <label className="block text-gray-700 font-medium" htmlFor="card-number">
                      Card Number
                    </label>
                    <input
                      id="card-number"
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      maxLength="19"
                      className="w-full p-2 border rounded text-gray-600"
                      placeholder="1234 1234 1234 1234"
                      aria-label="Card number"
                      aria-describedby={errors.cardNumber ? "card-number-error" : undefined}
                    />
                    {errors.cardNumber && (
                      <p id="card-number-error" className="text-red-500 text-sm">{errors.cardNumber}</p>
                    )}
                  </div>

                  {/* Expiry date and CVV fields in a flex container */}
                  <div className="flex gap-3">
                    {/* Expiry Date input */}
                    <div className="w-1/2">
                      <label className="block text-gray-700 font-medium" htmlFor="expiry-date">
                        Expiry
                      </label>
                      <input
                        id="expiry-date"
                        type="text"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        className="w-full p-2 border rounded text-gray-600"
                        placeholder="MM/YY"
                        aria-label="Expiry date"
                        aria-describedby={errors.expiryDate ? "expiry-date-error" : undefined}
                      />
                      {errors.expiryDate && (
                        <p id="expiry-date-error" className="text-red-500 text-sm">{errors.expiryDate}</p>
                      )}
                    </div>

                    {/* CVV input */}
                    <div className="w-1/2">
                      <label className="block text-gray-700 font-medium" htmlFor="cvv">
                        CVV
                      </label>
                      <input
                        id="cvv"
                        type="password"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleChange}
                        maxLength="3"
                        className="w-full p-2 border rounded text-gray-600"
                        placeholder="123"
                        aria-label="CVV"
                        aria-describedby={errors.cvv ? "cvv-error" : undefined}
                      />
                      {errors.cvv && (
                        <p id="cvv-error" className="text-red-500 text-sm">{errors.cvv}</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* PayPal email input if PayPal is selected */}
              {paymentMethod === 'paypal' && (
                <div>
                  <label className="block text-gray-700 font-medium" htmlFor="paypal-email">
                    PayPal Email
                  </label>
                  <input
                    id="paypal-email"
                    type="email"
                    name="paypalEmail"
                    value={formData.paypalEmail}
                    onChange={handleChange}
                    className="w-full p-2 border rounded text-gray-600"
                    placeholder="user@example.com"
                    aria-label="PayPal email"
                    aria-describedby={errors.paypalEmail ? "paypal-email-error" : undefined}
                  />
                  {errors.paypalEmail && (
                    <p id="paypal-email-error" className="text-red-500 text-sm">{errors.paypalEmail}</p>
                  )}
                  {/* Inform user about redirect to PayPal */}
                  <p className="text-gray-600 text-sm mt-1">
                    You&apos;ll be redirected to PayPal to complete payment.
                  </p>
                </div>
              )}

              {/* Bank Transfer fields if bank_transfer selected */}
              {paymentMethod === 'bank_transfer' && (
                <div className="space-y-3">
                  {/* Account Holder Name input */}
                  <div>
                    <label className="block text-gray-700 font-medium" htmlFor="account-holder-name">
                      Account Holder Name
                    </label>
                    <input
                      id="account-holder-name"
                      type="text"
                      name="accountHolderName"
                      value={formData.accountHolderName}
                      onChange={handleChange}
                      className="w-full p-2 border rounded text-gray-600"
                      placeholder="John Doe"
                      aria-label="Account holder name"
                      aria-describedby={errors.accountHolderName ? "account-holder-name-error" : undefined}
                    />
                    {errors.accountHolderName && (
                      <p id="account-holder-name-error" className="text-red-500 text-sm">{errors.accountHolderName}</p>
                    )}
                  </div>

                  {/* Bank Name input */}
                  <div>
                    <label className="block text-gray-700 font-medium" htmlFor="bank-name">
                      Bank Name
                    </label>
                    <input
                      id="bank-name"
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      className="w-full p-2 border rounded text-gray-600"
                      placeholder="Bank of America"
                      aria-label="Bank name"
                      aria-describedby={errors.bankName ? "bank-name-error" : undefined}
                    />
                    {errors.bankName && (
                      <p id="bank-name-error" className="text-red-500 text-sm">{errors.bankName}</p>
                    )}
                  </div>

                  {/* Account Number input */}
                  <div>
                    <label className="block text-gray-700 font-medium" htmlFor="account-number">
                      Account Number
                    </label>
                    <input
                      id="account-number"
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      className="w-full p-2 border rounded text-gray-600"
                      placeholder="1234567890"
                      aria-label="Account number"
                      aria-describedby={errors.accountNumber ? "account-number-error" : undefined}
                    />
                    {errors.accountNumber && (
                      <p id="account-number-error" className="text-red-500 text-sm">{errors.accountNumber}</p>
                    )}
                  </div>

                  {/* Routing Number input */}
                  <div>
                    <label className="block text-gray-700 font-medium" htmlFor="routing-number">
                      Routing Number
                    </label>
                    <input
                      id="routing-number"
                      type="text"
                      name="routingNumber"
                      value={formData.routingNumber}
                      onChange={handleChange}
                      className="w-full p-2 border rounded text-gray-600"
                      placeholder="123456789"
                      maxLength="9"
                      aria-label="Routing number"
                      aria-describedby={errors.routingNumber ? "routing-number-error" : undefined}
                    />
                    {errors.routingNumber && (
                      <p id="routing-number-error" className="text-red-500 text-sm">{errors.routingNumber}</p>
                    )}
                  </div>

                  {/* Bank info and payment details */}
                  <div className="text-gray-600 text-sm">
                    <p><strong>Bank:</strong> Wanderlust Bank</p>
                    <p><strong>Account:</strong> 1234-5678-9012-3456</p>
                    <p><strong>SWIFT:</strong> WLBKUS33XXX</p>
                    <p className="mt-2">
                      Payments take 1-3 days. Use Transaction ID: {transactionId.slice(0, 8)}.
                    </p>
                  </div>
                </div>
              )}

              {/* Terms and conditions checkbox */}
              <div>
                <label className="flex items-center text-gray-700">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mr-2"
                    aria-label="Accept terms and conditions"
                  />
                  I agree to the <a href="/terms" className="text-blue-600 ml-1">terms</a>
                </label>
                {/* Show error if terms not accepted */}
                {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}
              </div>

              {/* Confirm payment section */}
              <div className="bg-gray-100 p-4 rounded mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Payment</h3>
                <p className="text-gray-600">
                  Pay <strong>${totalPrice.toFixed(2)} USD</strong> via{' '}
                  <strong>{paymentMethod.replace('_', ' ')}</strong>
                  {/* Show masked card number if credit/debit card */}
                  {['credit_card', 'debit_card'].includes(paymentMethod) && formData.cardNumber && (
                    <span> (Card: {maskCardNumber(formData.cardNumber)})</span>
                  )}
                  {/* Show PayPal email if PayPal */}
                  {paymentMethod === 'paypal' && formData.paypalEmail && (
                    <span> ({formData.paypalEmail})</span>
                  )}
                  {/* Show Bank name if bank transfer */}
                  {paymentMethod === 'bank_transfer' && formData.bankName && (
                    <span> (Bank: {formData.bankName})</span>
                  )}
                </p>
                {/* Current date and time displayed */}
                <p className="text-gray-600 text-sm mt-1">
                  Payment Date: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                </p>
                {/* Submit and Go Back buttons side-by-side */}
                <div className="flex gap-3 mt-3">
                  {/* Submit button disabled if loading, shows spinner */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex-1 bg-indigo-600 text-white py-2 rounded flex items-center justify-center ${
                      isLoading ? 'opacity-50' : 'hover:bg-indigo-700'
                    }`}
                  >
                    {isLoading ? <FaSpinner className="animate-spin mr-2" /> : 'Pay Now'}
                  </button>

                  {/* Go Back button navigates to referrer page */}
                  <button
                    type="button"
                    onClick={() => navigate(referrer)}
                    className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Toast notification container */}
      <ToastContainer />
    </ErrorBoundary>
  );
}
export default Payment;