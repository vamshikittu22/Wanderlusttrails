
import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';

function BookingForm({ pricePerPerson, onSubmit }) {
    const getStoredData = () => {
        const storedData = JSON.parse(sessionStorage.getItem('bookingData')) || {};
        return {
            persons: storedData.persons || 1,
            startDate: storedData.startDate ? new Date(storedData.startDate) : null,
            endDate: storedData.endDate ? new Date(storedData.endDate) : null,
        };
    };

    const [formData, setFormData] = useState(getStoredData());
    const navigate = useNavigate();

    useEffect(() => {
        sessionStorage.setItem('bookingData', JSON.stringify(formData));
    }, [formData]);

    const handleInputChange = (e) => {
        setFormData((prev) => ({ ...prev, persons: parseInt(e.target.value) || 1 }));
    };

    const handleDateChange = (dates) => {
        const [start, end] = dates;
        setFormData((prev) => ({ ...prev, startDate: start, endDate: end }));
    };

    const calculateTotalPrice = () => {
        if (formData.startDate && formData.endDate) {
            const days = Math.ceil((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24)) + 1;
            return days * pricePerPerson * formData.persons;
        }
        return 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const totalPrice = calculateTotalPrice();
        const success = await onSubmit({ ...formData, totalPrice });
        if (success) {
            navigate('/Payment');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-lg p-6 bg-white shadow-lg rounded-lg mt-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Booking Form</h2>
            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Number of Persons:</label>
                <input
                    type="number"
                    value={formData.persons}
                    min="1"
                    max="10"
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg text-gray-800"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Select Date Range:</label>
                <DatePicker
                    selectsRange
                    startDate={formData.startDate}
                    endDate={formData.endDate}
                    minDate={new Date()}
                    onChange={handleDateChange}
                    isClearable
                    dateFormat="MMM d, yyyy"
                    className="w-full p-2 border text-gray-800 rounded-lg"
                />
            </div>
            <p className="text-lg font-semibold text-gray-800 mb-4">
                Total Price: <span className="text-blue-600">${calculateTotalPrice()}</span>
            </p>
            <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700"
            >
                Proceed to Payment
            </button>
        </form>
    );
}

export default BookingForm;