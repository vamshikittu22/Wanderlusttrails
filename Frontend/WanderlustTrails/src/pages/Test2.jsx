// import { useState, useEffect } from 'react';

// function BookingDetails() {
//   const [packageName, setPackageName] = useState('');
//   const [packageLocation, setPackageLocation] = useState('');
//   const [packagePrice, setPackagePrice] = useState('');


//   useEffect(() => {
//     // Retrieve the selected package from the session
//     const storedPackage = JSON.parse(sessionStorage.getItem('selectedPackage'));
//     if (storedPackage) {
//       setPackageName(storedPackage.name);
//       setPackageLocation(storedPackage.location);
//       setPackagePrice(storedPackage.price);

//     }
//   }, []); 

//   return (
//     <div>
//       <h2>Here is your selected package: </h2>
//         <p>Title: {packageName} <br/>
//         Location: {packageLocation} <br/>
//         Price: {packagePrice} </p>
//       {/* ... your booking form ... */}
//     </div>
//   );
// }

// export default BookingDetails;


import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function BookingForm() {
  // Retrieve data from sessionStorage or set default values
  const getStoredData = () => {
    const storedData = JSON.parse(sessionStorage.getItem('bookingData'));
    return storedData || {
      persons: 0,
      startDate: null,
      endDate: null,
      totalPrice: 0
    };
  };

  // State variables for form fields
  const [formData, setFormData] = useState(getStoredData());

  // Update sessionStorage whenever formData changes
  useEffect(() => {
    sessionStorage.setItem('bookingData', JSON.stringify(formData));
  }, [formData]);

  // Calculate total price based on selected dates and number of persons
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const days = Math.ceil((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24)) + 1;
      const pricePerPerson = 100; // Example price per person per day
      setFormData(prev => ({ ...prev, totalPrice: days * pricePerPerson * formData.persons }));
    }
  }, [formData.startDate, formData.endDate, formData.persons]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Booking Form</h2>

        {/* Persons Input */}
        <label className="block text-gray-700 font-medium mb-2">Number of Persons:</label>
        <input
          type="number"
          value={formData.persons}
          min="1"
          max="10"
          onChange={(e) => setFormData(prev => ({ ...prev, persons: parseInt(e.target.value) || 1 }))}
          className="w-full p-2 border rounded-lg text-gray-800 mb-4"
        />

        {/* Date Picker */}
        <label className="block text-gray-700 font-medium mb-2">Select Date Range:</label>
        <DatePicker
          selectsRange
          startDate={formData.startDate}
          endDate={formData.endDate}
          minDate={new Date()}
          onChange={(dates) => setFormData(prev => ({ ...prev, startDate: dates[0], endDate: dates[1] }))}
          isClearable
          dateFormat="MMM d, yyyy"
          className="w-full p-2 border rounded-lg mb-4"
        />

        {/* Total Price */}
        <p className="text-lg font-semibold text-gray-800">
          Total Price: <span className="text-blue-600">${formData.totalPrice}</span>
        </p>

        {/* Proceed Button */}
        <a href="/Payment"
          className="block text-white bg-indigo-600 hover:bg-indigo-700 font-medium py-3 px-6 rounded-md mt-4 text-center"
        >
          Proceed to Payment
        </a>
      </div>
    </div>
  );
}

export default BookingForm;
