import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { FaSpinner, FaCreditCard, FaPaypal, FaUniversity } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import $ from 'jquery';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ErrorBoundary = ({ children, navigate }) => { 
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (error, errorInfo) => {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
      setHasError(true);
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-900 py-8 px-4 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="mb-4">Please try refreshing the page or go back to the previous page.</p>
          <button
            onClick={() => navigate(-1)} // Go back to the previous page
            className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  return children;
};

function Payment() {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [totalPrice, setTotalPrice] = useState(0);
  const [bookingId, setBookingId] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isPackage, setIsPackage] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
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
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [transactionId, setTransactionId] = useState(uuidv4());
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [isMounted, setIsMounted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Determine the referring page
  const referrer = location.state?.from || (bookingDetails?.package_id ? '/TravelPackages' : '/ItineraryBuilder');

  useEffect(() => {
    setIsMounted(true);

    // Check if user is authenticated and has a valid ID
    if (!isAuthenticated || !user?.id) {
      setTimeout(() => {
        if (isMounted) {
          toast.error('Please log in to proceed with payment.');
          navigate('/Login');
        }
      }, 100);
      return;
    }

    // Check if booking data is available in sessionStorage
    try {
      const bookingDataRaw = sessionStorage.getItem('bookingData');
      const selectedPackageRaw = sessionStorage.getItem('selectedPackage');

      console.log('Raw session data:', { bookingDataRaw, selectedPackageRaw });

      let bookingData = null;
      let selectedPackage = null;

      // Parse the booking data and selected package from sessionStorage
      if (bookingDataRaw) {
        bookingData = JSON.parse(bookingDataRaw);
      } else {
        console.warn('No bookingData found in sessionStorage');
      }

      if (selectedPackageRaw) {
        selectedPackage = JSON.parse(selectedPackageRaw);
      } else {
        console.warn('No selectedPackage found in sessionStorage');
      }

      console.log('Parsed session data:', { bookingData, selectedPackage });

      // Check if booking data is valid
      if (bookingData) {
        const price = parseFloat(bookingData.total_price) || 0;
        console.log('Booking total_price:', bookingData.total_price, 'Parsed price:', price);
        if (price <= 0 || isNaN(price)) {
          setTimeout(() => {
            if (isMounted) {
              toast.error('Invalid booking amount. Please select a valid booking.');
              navigate(referrer); // Redirect to the referring page
            }
          }, 100);
          return;
        }
        setTotalPrice(price);
        setBookingId(bookingData.booking_id || null);

        // Check if flight or package booking
        if (bookingData.flight_details) {
          console.log('Flight booking detected');
          setBookingDetails({
            from: bookingData.flight_details?.from || 'N/A',
            to: bookingData.flight_details?.to || 'N/A',
            start_date: bookingData.start_date || bookingData.startDate,
            end_date: bookingData.end_date || bookingData.endDate,
            persons: bookingData.persons || 1,
          });
          setIsPackage(false);
        }
        // Check if package booking 
        else if (bookingData.package_id) {
          console.log('Package booking detected');
          const start = new Date(bookingData.start_date || bookingData.startDate);
          const end = new Date(bookingData.end_date || bookingData.endDate);
          const durationDays = isNaN(start) || isNaN(end)
            ? 'N/A'
            : Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
          setBookingDetails({
            package_id: bookingData.package_id,
            package_name: selectedPackage?.name || bookingData.package_name || 'N/A',
            destination: selectedPackage?.location || 'N/A',
            duration: durationDays === 'N/A' ? 'N/A' : `${durationDays} day${durationDays > 1 ? 's' : ''}`,
            persons: bookingData.persons || 1,
          });
          setIsPackage(true);

          if (!bookingData.booking_id) {
            createBooking(bookingData, selectedPackage);
          }
        } else {
          setTimeout(() => {
            if (isMounted) {
              toast.error('Invalid booking data.');
              navigate(referrer); // Redirect to the referring page
            }
          }, 100);
          return;
        }
      } else {
        setTimeout(() => {
          if (isMounted) {
            toast.error('No booking data found.');
            navigate(referrer); // Redirect to the referring page
          }
        }, 100);
        return;
      }

      // Set up a timer to count down from 3 minutes
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (!isLoading) { // Only fail payment if not currently processing
              failPayment();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
        setIsMounted(false);
      };
    } catch (error) {
      console.error('Error in useEffect:', error);
      setTimeout(() => {
        if (isMounted) {
          toast.error('An error occurred while loading payment data.');
          navigate(referrer); // Redirect to the referring page
        }
      }, 100);
    }
  }, [navigate, isMounted, isLoading]);

  const createBooking = (bookingData, selectedPackage) => {
    const numericUserId = parseInt(user?.id, 10);
    if (isNaN(numericUserId)) {
      console.error('Invalid user_id for booking:', user?.id);
      toast.error('Invalid user ID. Please log in again.');
      navigate('/Login');
      return;
    }

    const bookingPayload = {
      user_id: numericUserId,
      package_id: bookingData.package_id,
      persons: bookingData.persons || 1,
      start_date: bookingData.start_date || bookingData.startDate,
      end_date: bookingData.end_date || bookingData.endDate,
      total_price: bookingData.total_price || 0,
      status: 'pending',
    };

    console.log('Creating booking with payload:', bookingPayload);

    $.ajax({
      url: 'http://localhost/wanderlusttrails/Backend/config/booking/createBooking.php',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(bookingPayload),
      success: (response) => {
        console.log('Create booking response:', response);
        if (response.success && response.booking_id) {
          setBookingId(response.booking_id);
          sessionStorage.setItem('bookingData', JSON.stringify({
            ...bookingData,
            booking_id: response.booking_id,
          }));
        } else {
          toast.error('Failed to create booking: ' + (response.message || 'Unknown error'));
          navigate(referrer); // Redirect to the referring page
        }
      },
      error: (xhr, status, error) => {
        console.error('Error creating booking:', error, xhr.responseText);
        toast.error('Error creating booking: ' + xhr.responseText);
        navigate(referrer); // Redirect to the referring page
      },
    });
  };

  const failPayment = () => {
    if (!isMounted) {
      console.log('Component unmounted, skipping failPayment');
      return;
    }

    console.log('Timer expired, marking payment as failed if it exists:', transactionId);
    $.ajax({
      url: 'http://localhost/wanderlusttrails/Backend/config/payment/updatePaymentStatus.php',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ transaction_id: transactionId, payment_status: 'failed' }),
      success: (response) => {
        console.log('Fail response:', response);
        if (isMounted) {
          toast.error('Payment timed out after 3 minutes.');
          navigate(referrer); // Redirect to the referring page
        }
      },
      error: (xhr, status, error) => {
        console.error('Failed to update status:', error, xhr.responseText);
        if (isMounted) {
          if (xhr.status === 404) {
            toast.error('Payment timed out after 3 minutes.');
          } else {
            toast.error('Error timing out payment: ' + xhr.responseText);
          }
          navigate(referrer); // Redirect to the referring page
        }
      },
    });
  };

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
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.paypalEmail)) {
        newErrors.paypalEmail = 'Invalid PayPal email';
      }
    } else if (paymentMethod === 'bank_transfer') {
      if (!formData.accountHolderName) newErrors.accountHolderName = 'Account holder name required';
      if (!formData.bankName) newErrors.bankName = 'Bank name required';
      if (!formData.accountNumber) newErrors.accountNumber = 'Account number required';
      if (!/^\d{9}$/.test(formData.routingNumber)) newErrors.routingNumber = 'Invalid routing number (must be 9 digits)';
    }

    if (!termsAccepted) newErrors.terms = 'Accept terms';
    setErrors(newErrors);
    console.log('Errors:', newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'cardNumber') {
      const cleaned = value.replace(/\D/g, '');
      const parts = cleaned.match(/.{1,4}/g);
      formattedValue = parts ? parts.join(' ') : cleaned;
    } else if (name === 'routingNumber' || name === 'accountNumber') {
      formattedValue = value.replace(/\D/g, '');
    }
    setFormData({ ...formData, [name]: formattedValue });
    setErrors({ ...errors, [name]: '' });
  };

  const maskCardNumber = (number) => {
    return number ? '**** **** **** ' + number.slice(-4) : '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting:', { paymentMethod, formData, transactionId });
    if (!validateForm()) {
      toast.error('Please fix form errors.');
      return;
    }
    if (!user?.id) {
      console.log('No user ID, redirecting');
      toast.error('Please log in.');
      navigate('/Login');
      return;
    }
    if (!bookingId) {
      console.log('No booking ID, redirecting');
      toast.error('Booking ID is missing. Please try again.');
      navigate(referrer); // Redirect to the referring page
      return;
    }

    const numericUserId = parseInt(user.id, 10);
    console.log('User ID in handleSubmit:', user.id, 'Parsed:', numericUserId);
    if (isNaN(numericUserId)) {
      console.error('Invalid user_id:', user.id);
      toast.error('Invalid user ID. Please log in again.');
      navigate('/Login');
      return;
    }

    setIsLoading(true);

    const paymentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const paymentData = {
      booking_id: bookingId,
      user_id: numericUserId,
      amount: parseFloat(totalPrice),
      payment_method: paymentMethod,
      transaction_id: transactionId,
      payment_date: paymentDate,
    };

    const requiredFields = ['booking_id', 'user_id', 'amount', 'payment_method', 'transaction_id', 'payment_date'];
    const missingFields = requiredFields.filter(field => !paymentData[field] || (field === 'amount' && paymentData[field] <= 0));
    console.log('Payment data before submission:', paymentData);
    if (missingFields.length > 0) {
      console.error('Missing or invalid fields:', missingFields);
      toast.error(`Missing or invalid fields: ${missingFields.join(', ')}`);
      setIsLoading(false);
      return;
    }

    $.ajax({
      url: 'http://localhost/wanderlusttrails/Backend/config/payment/getPaymentDetails.php',
      method: 'GET',
      data: { booking_id: bookingId },
      success: (response) => {
        console.log('Get payment details response:', response);
        if (response.success && response.data) {
          const existingPayment = response.data.find(payment => payment.transaction_id === transactionId);
          if (existingPayment) {
            $.ajax({
              url: 'http://localhost/wanderlusttrails/Backend/config/payment/updatePaymentStatus.php',
              method: 'POST',
              contentType: 'application/json',
              data: JSON.stringify({ transaction_id: transactionId, payment_status: 'completed' }),
              success: (updateResponse) => {
                console.log('Update payment status response:', updateResponse);
                if (updateResponse.success) {
                  completePayment();
                } else {
                  toast.error('Failed to update payment status: ' + updateResponse.message);
                  setIsLoading(false);
                }
              },
              error: (xhr, status, error) => {
                console.error('Error updating payment status:', error, xhr.responseText);
                toast.error('Error updating payment status: ' + xhr.responseText);
                setIsLoading(false);
              },
            });
          } else {
            createPayment(paymentData);
          }
        } else {
          createPayment(paymentData);
        }
      },
      error: (xhr, status, error) => {
        console.error('Error checking existing payments:', error, xhr.responseText);
        createPayment(paymentData);
      },
    });
  };

  const createPayment = (paymentData) => {
    $.ajax({
      url: 'http://localhost/wanderlusttrails/Backend/config/payment/createPayment.php',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(paymentData),
      success: (response) => {
        console.log('Create payment API response:', response);
        if (response.success) {
          completePayment();
        } else {
          if (response.message && response.message.includes('Transaction ID already exists')) {
            if (retryCount >= MAX_RETRIES) {
              console.error('Max retries reached for transaction ID regeneration');
              toast.error('Unable to process payment: Transaction ID conflict. Please try again later.');
              setIsLoading(false);
              return;
            }
            console.log('Duplicate transaction ID detected, regenerating...');
            setTransactionId(uuidv4());
            setRetryCount(prev => prev + 1);
            handleSubmit({ preventDefault: () => {} });
          } else {
            console.log('Payment failed:', response.message);
            toast.error('Payment failed: ' + response.message);
            setIsLoading(false);
          }
        }
      },
      error: (xhr, status, error) => {
        console.error('Error creating payment:', error, xhr.responseText);
        let errorMessage = 'Payment failed: ';
        if (xhr.status === 400) {
          errorMessage += xhr.responseText;
        } else if (xhr.status === 403) {
          errorMessage += 'User does not match booking. Please log in with the correct account.';
        } else if (xhr.status === 405) {
          errorMessage += 'Method not allowed. Please contact support.';
        } else {
          errorMessage += 'Internal server error. Please try again later.';
        }
        toast.error(errorMessage);
        setIsLoading(false);
      },
      complete: () => {
        setIsLoading(false);
      },
    });
  };

  const completePayment = () => {
    const numericUserId = parseInt(user.id, 10);
    $.ajax({
      url: 'http://localhost/wanderlusttrails/Backend/config/booking/updateBookingStatus.php',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ booking_id: bookingId, user_id: numericUserId, status: 'confirmed' }),
      success: (statusRes) => {
        console.log('Status response:', statusRes);
        if (statusRes.success) {
          toast.success(`Payment of $${totalPrice.toFixed(2)} USD successful!`);
          setTimeLeft(0);
          sessionStorage.removeItem('bookingData');
          sessionStorage.removeItem('selectedPackage');

          if (!isAuthenticated) {
            console.error('User is no longer authenticated after payment', {
              isAuthenticated,
              token: localStorage.getItem('token'),
              user: localStorage.getItem('user'),
            });
            toast.error('Session expired. Please log in again.');
            navigate('/Login');
            return;
          }

          const dashboardPath = user.role === 'admin' ? '/AdminDashboard' : '/UserDashboard';
          console.log('Navigating to dashboard:', dashboardPath, { userRole: user.role });
          navigate(dashboardPath);
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
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <ErrorBoundary navigate={navigate}>
      <div className="min-h-screen bg-gray-900 py-8 px-4">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-3">
              <span className="w-6 h-6 bg-gray-700 text-gray-400 rounded-full flex items-center justify-center">1</span>
              <span className="text-gray-400">Details</span>
              <div className="w-8 h-1 bg-gray-700"></div>
              <span className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center">2</span>
              <span className="text-gray-300">Payment</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-indigo-300 mb-6 text-center">Pay Now</h2>

          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600 text-sm mb-4">Time left: {formatTime(timeLeft)}</p>
            {bookingDetails && (
              <div className="mb-4 p-3 bg-gray-100 rounded">
                <h3 className="text-lg font-semibold text-gray-800">Summary</h3>
                {isPackage ? (
                  <>
                    <p className="text-gray-600">Package: {bookingDetails.package_name || 'N/A'}</p>
                    <p className="text-gray-600">Destination: {bookingDetails.destination || 'N/A'}</p>
                    <p className="text-gray-600">Duration: {bookingDetails.duration || 'N/A'}</p>
                  </>
                ) : (
                  <>
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
                <p className="text-gray-600">Persons: {bookingDetails.persons || 'N/A'}</p>
                <p className="text-lg text-blue-600">Total: ${totalPrice.toFixed(2)} USD</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
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
                    <FaCreditCard className={`mr-2 ${paymentMethod === 'credit_card' ? 'text-indigo-600' : 'text-gray-600'}`} />
                    <span className={paymentMethod === 'credit_card' ? 'text-indigo-600 font-medium' : 'text-gray-600'}>
                      Credit Card
                    </span>
                  </button>
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

              {['credit_card', 'debit_card'].includes(paymentMethod) && (
                <>
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
                    {errors.nameOnCard && (
                      <p id="name-on-card-error" className="text-red-500 text-sm">{errors.nameOnCard}</p>
                    )}
                  </div>
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
                  <div className="flex gap-3">
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
                  <p className="text-gray-600 text-sm mt-1">
                    You’ll be redirected to PayPal to complete payment.
                  </p>
                </div>
              )}

              {paymentMethod === 'bank_transfer' && (
                <div className="space-y-3">
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
                {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}
              </div>

              <div className="bg-gray-100 p-4 rounded mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Payment</h3>
                <p className="text-gray-600">
                  Pay <strong>${totalPrice.toFixed(2)} USD</strong> via{' '}
                  <strong>{paymentMethod.replace('_', ' ')}</strong>
                  {['credit_card', 'debit_card'].includes(paymentMethod) && formData.cardNumber && (
                    <span> (Card: {maskCardNumber(formData.cardNumber)})</span>
                  )}
                  {paymentMethod === 'paypal' && formData.paypalEmail && (
                    <span> ({formData.paypalEmail})</span>
                  )}
                  {paymentMethod === 'bank_transfer' && formData.bankName && (
                    <span> (Bank: {formData.bankName})</span>
                  )}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  Payment Date: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                </p>
                <div className="flex gap-3 mt-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`flex-1 bg-indigo-600 text-white py-2 rounded flex items-center justify-center ${
                      isLoading ? 'opacity-50' : 'hover:bg-indigo-700'
                    }`}
                  >
                    {isLoading ? <FaSpinner className="animate-spin mr-2" /> : 'Pay Now'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(referrer)} // Redirect to the referring page
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
    </ErrorBoundary>
  );
}

export default Payment;