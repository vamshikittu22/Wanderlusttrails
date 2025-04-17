//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx

import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const BookingDetailsForm = ({ package: initialPackage, isEditMode, initialData = {}, onSubmit, onCancel, onChange }) => {
    // Initialize formData based on mode (new booking or edit)
    const [formData, setFormData] = useState(() => {
        if (isEditMode && initialData) {
            return {
                package_id: initialData.package_id || '',
                persons: initialData.persons || 1,
                startDate: initialData.start_date ? new Date(initialData.start_date) : null,
                endDate: initialData.end_date ? new Date(initialData.end_date) : null,
                totalPrice: initialData.totalPrice || 0,
                pending_changes: initialData.pending_changes || null,
            };
        } else {
            const selectedPackage = JSON.parse(sessionStorage.getItem('selectedPackage')) || {};
            return {
                package_id: selectedPackage.id || '',
                persons: 1,
                startDate: null,
                endDate: null,
                totalPrice: 0,
                pending_changes: null,
            };
        }
    });

    // Store form data in sessionStorage for new bookings
    useEffect(() => {
        if (!isEditMode) {
            sessionStorage.setItem('bookingData', JSON.stringify(formData));
        }
    }, [formData, isEditMode]);

    // Update formData only in edit mode when initialData changes
    useEffect(() => {
        if (isEditMode && initialData) {
            setFormData({
                package_id: initialData.package_id || '',
                persons: initialData.persons || 1,
                startDate: initialData.start_date ? new Date(initialData.start_date) : null,
                endDate: initialData.end_date ? new Date(initialData.end_date) : null,
                totalPrice: initialData.totalPrice || 0,
                pending_changes: initialData.pending_changes || null,
            });
        }
    }, [isEditMode, initialData]);

    const handleInputChange = (e) => {
        const updatedData = { ...formData, persons: parseInt(e.target.value) || 1 };
        setFormData(updatedData);
        if (onChange) onChange(updatedData);
    };

    const handleDateChange = (dates) => {
        const [start, end] = dates;
        const updatedData = { ...formData, startDate: start, endDate: end };
        setFormData(updatedData);
        if (onChange) onChange(updatedData);
    };

    const calculateTotalPrice = () => {
        if (formData.startDate && formData.endDate) {
            const selectedPackage = JSON.parse(sessionStorage.getItem('selectedPackage')) || {};
            const pricePerPerson = isEditMode && initialPackage?.price
                ? parseFloat(initialPackage.price)
                : selectedPackage.price
                ? parseFloat(selectedPackage.price)
                : 100;
            const days = Math.ceil((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24)) + 1;
            return days * pricePerPerson * formData.persons;
        }
        return 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const totalPrice = calculateTotalPrice();
        onSubmit({ ...formData, totalPrice });
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-lg p-6 bg-white shadow-lg rounded-lg py-4">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {isEditMode ? 'Edit Booking' : 'Booking Details'}
            </h2>
            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Package ID:</label>
                <input
                    type="text"
                    name="package_id"
                    value={formData.package_id}
                    disabled
                    className="w-full p-2 border rounded-lg text-gray-800 bg-gray-100 cursor-not-allowed"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Number of Persons:</label>
                <input
                    type="number"
                    name="persons"
                    value={formData.persons}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    disabled={isEditMode} // Editable only for new bookings
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
                    disabled={isEditMode} // Editable only for new bookings
                    className="w-full p-2 border rounded-lg text-gray-800"
                />
            </div>

            {/* Summary Section */}
            <div className="p-4 rounded-lg mt-4 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Booking Summary</h3>
                <p className="text-gray-700"><strong>Package ID:</strong> {formData.package_id}</p>
                <p className="text-gray-700"><strong>Persons:</strong> {formData.persons}</p>
                <p className="text-gray-700">
                    <strong>Date Range:</strong>{' '}
                    {formData.startDate?.toLocaleDateString() || 'N/A'}
                    {formData.endDate ? ` to ${formData.endDate.toLocaleDateString()}` : ''}
                </p>
                <p className="text-lg font-semibold text-gray-800 mt-2">
                    Total Price: <span className="text-blue-600">${calculateTotalPrice().toFixed(2)}</span>
                </p>
                {formData.pending_changes && isEditMode && (
                    <div className="mt-2">
                        <p className="text-gray-700"><strong>Pending Changes:</strong></p>
                        <ul className="list-disc pl-5 text-gray-700">
                            {Object.entries(formData.pending_changes).map(([key, value]) => (
                                <li key={key}>{`${key}: ${JSON.stringify(value)}`}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="flex space-x-4 mt-4">
                <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700"
                >
                    {isEditMode ? 'Save Changes' : 'Proceed to Payment'}
                </button>
                {isEditMode && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 bg-gray-500 text-white py-3 rounded-md hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
};

export default BookingDetailsForm;