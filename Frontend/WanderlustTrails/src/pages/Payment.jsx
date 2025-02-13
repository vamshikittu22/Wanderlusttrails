import { useState, useEffect } from 'react';

function Payment() {
  // Retrieve total price from sessionStorage
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
  });

  useEffect(() => {
    const storedData = JSON.parse(sessionStorage.getItem('bookingData'));
    if (storedData?.startDate && storedData?.endDate) {
      const days =
        Math.ceil((new Date(storedData.endDate) - new Date(storedData.startDate)) / (1000 * 60 * 60 * 24)) + 1;
      const pricePerPerson = 100;
      setTotalPrice(days * pricePerPerson * storedData.persons);
    }
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handlePayment = (e) => {
    e.preventDefault();
    alert(`Payment of $${totalPrice} successful!`);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Payment Details</h2>
        
        <p className="text-lg font-medium mb-4 text-black">
          <strong>Total Price: </strong>
          <span className="text-blue-600">${totalPrice}</span>
        </p>

        <form onSubmit={handlePayment} className="space-y-4">
          {/* Name on Card */}
          <div>
            <label className="block text-gray-700 font-medium">Name on Card</label>
            <input
              type="text"
              name="nameOnCard"
              value={paymentDetails.nameOnCard}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-lg text-gray-600"
              placeholder="John Doe"
            />
          </div>

          {/* Card Number */}
          <div>
            <label className="block text-gray-700 font-medium">Card Number</label>
            <input
              type="text"
              name="cardNumber"
              value={paymentDetails.cardNumber}
              onChange={handleChange}
              required
              maxLength="16"
              pattern="\d{16}"
              className="w-full p-2 border rounded-lg text-gray-600"
              placeholder="1234 5678 9012 3456"
            />
          </div>

          {/* Expiry Date & CVV */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-gray-700 font-medium">Expiry Date</label>
              <input
                type="text"
                name="expiryDate"
                value={paymentDetails.expiryDate}
                onChange={handleChange}
                required
                pattern="\d{2}/\d{2}"
                className="w-full p-2 border rounded-lg text-gray-600"
                placeholder="MM/YY"
              />
            </div>

            <div className="w-1/2">
              <label className="block text-gray-700 font-medium">CVV</label>
              <input
                type="password"
                name="cvv"
                value={paymentDetails.cvv}
                onChange={handleChange}
                required
                maxLength="3"
                pattern="\d{3}"
                className="w-full p-2 border rounded-lg text-gray-600"
                placeholder="123"
              />
            </div>
          </div>

          {/* Pay Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg"
          >
            Pay ${totalPrice}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Payment;
