// src/components/forms/PackageBookingForm.jsx
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function PackageBookingForm({ initialData = {}, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        package_id: initialData.package_id || '',
        startDate: initialData.start_date ? new Date(initialData.start_date) : null,
        endDate: initialData.end_date ? new Date(initialData.end_date) : null,
        persons: initialData.persons || 1,
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'persons' ? parseInt(value) || 1 : value }));
    };

    const handleDateChange = (dates) => {
        const [start, end] = dates;
        setFormData(prev => ({ ...prev, startDate: start, endDate: end }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            package_id: formData.package_id,
            start_date: formData.startDate ? formData.startDate.toISOString().split('T')[0] : '',
            end_date: formData.endDate ? formData.endDate.toISOString().split('T')[0] : '',
            persons: formData.persons,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-700 shadow-lg rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-orange-400">Edit Package Booking</h3>
            <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Package ID</label>
                <input
                    type="number"
                    name="package_id"
                    value={formData.package_id}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-600 text-white border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min="1"
                />
            </div>
            <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Date Range</label>
                <DatePicker
                    selectsRange
                    startDate={formData.startDate}
                    endDate={formData.endDate}
                    minDate={new Date()}
                    onChange={handleDateChange}
                    dateFormat="MMM d, yyyy"
                    className="w-full p-2 bg-gray-600 text-white border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
            </div>
            <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">Persons</label>
                <input
                    type="number"
                    name="persons"
                    value={formData.persons}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-gray-600 text-white border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    min="1"
                    max="10"
                />
            </div>
            <div className="flex space-x-2">
                <button
                    type="submit"
                    className="flex-1 bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 transition-colors"
                >
                    Save Changes
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default PackageBookingForm;