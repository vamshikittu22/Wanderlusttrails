//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/Payment.jsx
import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { FaSpinner, FaCreditCard, FaPaypal, FaUniversity } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import $ from 'jquery';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 py-8 px-4 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="mb-4">Please try refreshing the page or go back to the homepage.</p>
            <button
              onClick={() => this.props.navigate('/')}
              className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Payment() {
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();
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
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [transactionId, setTransactionId] = useState(uuidv4());
  const [timeLeft, setTimeLeft] = useState(90);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    try {
      const bookingDataRaw = sessionStorage.getItem('bookingData');
      const selectedPackageRaw = sessionStorage.getItem('selectedPackage');

      console.log('Raw session data:', { bookingDataRaw, selectedPackageRaw });

      let bookingData = null;
      let selectedPackage = null;

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

      if (bookingData) {
        const price = parseFloat(bookingData.total_price) || 0;
        console.log('Booking totalPrice:', bookingData.totalPrice, 'Parsed price:', price);
        if (price <= 0) {
          setTimeout(() => {
            if (isMounted) {
              toast.error('Invalid booking amount. Please select a valid booking.');
              navigate('/');
            }
          }, 100);
          return;
        }
        setTotalPrice(price);
        setBookingId(bookingData.booking_id || null);

        if (bookingData.flight_details) {
          console.log('Flight booking detected');
          setBookingDetails({
            from: bookingData.flight_details?.from || 'N/A',
            to: bookingData.flight_details?.to || 'N/A',
            start_date: bookingData.startDate || bookingData.start_date,
            end_date: bookingData.endDate || bookingData.end_date,
            persons: bookingData.persons || 1,
          });
          setIsPackage(false);
        } else if (bookingData.package_id) {
          console.log('Package booking detected');
          const start = new Date(bookingData.startDate || bookingData.start_date);
          const end = new Date(bookingData.endDate || bookingData.end_date);
          const durationDays = isNaN(start) || isNaN(end)
            ? 'N/A'
            : Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
          setBookingDetails({
            package_name: selectedPackage?.name || 'N/A',
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
              navigate('/');
            }
          }, 100);
        }
      } else {
        setTimeout(() => {
          if (isMounted) {
            toast.error('No booking data found.');
            navigate('/');
          }
        }, 100);
      }

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            failPayment();
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
          navigate('/');
        }
      }, 100);
    }
  }, [navigate, isMounted]);

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
      start_date: bookingData.startDate || bookingData.start_date,
      end_date: bookingData.endDate || bookingData.end_date,
      total_price: bookingData.totalPrice || 0,
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
          navigate('/');
        }
      },
      error: (xhr, status, error) => {
        console.error('Error creating booking:', error, xhr.responseText);
        toast.error('Error creating booking: ' + xhr.responseText);
        navigate('/');
      },
    });
  };

  const failPayment = () => {
    console.log('Timer expired, marking payment as failed:', transactionId);
    $.ajax({
      url: 'http://localhost/wanderlusttrails/Backend/config/payment/updatePaymentStatus.php',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ transaction_id: transactionId, payment_status: 'failed' }),
      success: (response) => {
        console.log('Fail response:', response);
        if (isMounted) {
          toast.error('Payment timed out after 90 seconds.');
          navigate('/');
        }
      },
      error: (xhr, status, error) => {
        console.error('Failed to update status:', error, xhr.responseText);
        if (isMounted) {
          toast.error('Error timing out payment.');
          navigate('/');
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
      if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) newErrors.expiryDate = 'Invalid MM/YY';
      if (!/^\d{3}$/.test(formData.cvv)) newErrors.cvv = 'Invalid CVV';
    }
    if (paymentMethod === 'paypal') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.paypalEmail)) {
        newErrors.paypalEmail = 'Invalid PayPal email';
      }
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
      navigate('/');
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
    const paymentData = {
      booking_id: bookingId,
      user_id: numericUserId,
      amount: parseFloat(totalPrice),
      payment_method: paymentMethod,
      transaction_id: transactionId,
      payment_date: new Date().toISOString(),
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
      url: 'http://localhost/wanderlusttrails/Backend/config/payment/createPayment.php',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(paymentData),
      success: (response) => {
        console.log('API response:', response);
        if (response.success) {
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

                // Check authentication state before navigation
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

                // Navigate based on user.role
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
          });
        } else {
          if (response.message && response.message.includes('Duplicate entry')) {
            console.log('Duplicate transaction ID detected, regenerating...');
            setTransactionId(uuidv4());
            handleSubmit(e);
          } else {
            console.log('Payment failed:', response.message);
            toast.error('Payment failed: ' + response.message);
          }
        }
      },
      error: (xhr, status, error) => {
        console.error('Error:', error, xhr.responseText);
        if (xhr.status === 400) {
          toast.error('Bad Request: ' + xhr.responseText);
        } else if (xhr.status === 405) {
          toast.error('Method not allowed. Please contact support.');
        } else {
          toast.error('Internal Server Error: ' + xhr.responseText);
        }
        setIsLoading(false);
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
                <label className="block text-gray-700 font-medium" htmlFor="payment-method">
                  Payment Method
                </label>
                <select
                  id="payment-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 border rounded text-gray-600"
                >
                  <option value="credit_card">Credit Card <FaCreditCard className="inline" /></option>
                  <option value="debit_card">Debit Card <FaCreditCard className="inline" /></option>
                  <option value="paypal">PayPal <FaPaypal className="inline" /></option>
                  <option value="bank_transfer">Bank Transfer <FaUniversity className="inline" /></option>
                </select>
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
                    />
                    {errors.nameOnCard && <p className="text-red-500 text-sm">{errors.nameOnCard}</p>}
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
                    />
                    {errors.cardNumber && <p className="text-red-500 text-sm">{errors.cardNumber}</p>}
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
                      />
                      {errors.expiryDate && <p className="text-red-500 text-sm">{errors.expiryDate}</p>}
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
                      />
                      {errors.cvv && <p className="text-red-500 text-sm">{errors.cvv}</p>}
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
                  />
                  {errors.paypalEmail && <p className="text-red-500 text-sm">{errors.paypalEmail}</p>}
                  <p className="text-gray-600 text-sm mt-1">
                    You’ll be redirected to PayPal to complete payment.
                  </p>
                </div>
              )}

              {paymentMethod === 'bank_transfer' && (
                <div className="text-gray-600 text-sm">
                  <p><strong>Bank:</strong> Wanderlust Bank</p>
                  <p><strong>Account:</strong> 1234-5678-9012-3456</p>
                  <p><strong>SWIFT:</strong> WLBKUS33XXX</p>
                  <p className="mt-2">
                    Payments take 1-3 days. Use Transaction ID: {transactionId.slice(0, 8)}.
                  </p>
                </div>
              )}

              <div>
                <label className="flex items-center text-gray-700">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mr-2"
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
                  {['credit_card', 'debit_card'].includes(paymentMethod) && (
                    <span> (Card: {maskCardNumber(formData.cardNumber)})</span>
                  )}
                  {paymentMethod === 'paypal' && formData.paypalEmail && (
                    <span> ({formData.paypalEmail})</span>
                  )}
                  {paymentMethod === 'bank_transfer' && (
                    <span> (Bank: Wanderlust Bank)</span>
                  )}.
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
                    onClick={() => navigate('/')}
                    className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
                  >
                    Cancel
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