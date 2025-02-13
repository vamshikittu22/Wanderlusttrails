import React from 'react'
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useUser } from '../../context/UserContext';
import { toast } from 'react-toastify';


function BookingDetailsStickyForm() {
    const { user } = useUser(); // Extract user details from context  
    const [packageName, setPackageName] = useState('');
    const [packageLocation, setPackageLocation] = useState('');
    const [packagePrice, setPackagePrice] = useState('');
    const [imageSrc, setImageSrc] = useState(''); // State for image source
    
    useEffect(() => {
        // Retrieve the selected package from the session
        const storedPackage = JSON.parse(sessionStorage.getItem('selectedPackage'));
    
        if (storedPackage) {
          setPackageName(storedPackage.name);
          setPackageLocation(storedPackage.location);
          setPackagePrice(parseFloat(storedPackage.price));
          
        }
        
      }, []);

    const getStoredData = () => {
    const storedData = JSON.parse(sessionStorage.getItem('bookingData'));
    if (storedData) {
        return {
          persons: storedData.persons || 1,
          startDate: storedData.startDate ? new Date(storedData.startDate) : null,
          endDate: storedData.endDate ? new Date(storedData.endDate) : null,
        };
      }
      return { persons: 1, startDate: null, endDate: null };
    };

    const [formData, setFormData] = useState(getStoredData());


    // Update sessionStorage whenever formData changes
    useEffect(() => {
        sessionStorage.setItem('bookingData', JSON.stringify(formData));
    }, [formData]);


    // Handle input changes
    const handleInputChange = (e) => {
        setFormData((prev) => ({ ...prev, persons: parseInt(e.target.value) || 1 }));
    };

    // Handle date selection
    const handleDateChange = (dates) => {
        const [start, end] = dates;
        setFormData((prev) => ({ ...prev, startDate: start, endDate: end }));
    };


  // Calculate total price based on form data
    const calculateTotalPrice = () => {
    if (formData.startDate && formData.endDate) {
      const days = Math.ceil((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24)) + 1;
      return days * packagePrice * formData.persons;
    }
    return 0;
  };

  return (
    <>
    <div className=" bg-white shadow-lg rounded-lg p-6 w-full max-w-lg top-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Booking Form</h2>

        {/* Persons Input */}
        <label className="block text-gray-700 font-medium mb-2">Number of Persons:</label>
        <input
            type="number"
            value={formData.persons}
            min="1"
            max="10"
            onChange={handleInputChange}
            className="w-full p-2 border rounded-lg text-gray-800 mb-4"
        />

        {/* Date Picker */}
        <label className="block text-gray-700 font-medium mb-2">Select Date Range:</label>
        <DatePicker
            selectsRange
            startDate={formData.startDate}
            endDate={formData.endDate}
            minDate={new Date()}
            onChange={handleDateChange}
            isClearable
            dateFormat="MMM d, yyyy"
            className="w-full p-2 border  text-gray-800 rounded-lg mb-4"
        />

        {/* Total Price */}
        <p className="text-lg font-semibold text-gray-800">
            Total Price: <span className="text-blue-600">${calculateTotalPrice()}</span>
        </p>

        {/* Proceed Button */}
        <a href="/Payment"
            type="submit"
            className="block text-white bg-indigo-600 hover:bg-indigo-700 font-medium py-3 px-6 rounded-md mt-4 text-center"
            onClick= {() => toast.success('Almost there! make Payment and enjoy your trip!', {
              position: "top-center",
              autoClose: 1000,
            })}
        >
            Proceed to Payment
        </a>
    </div>
    </>  
);
}



export default BookingDetailsStickyForm