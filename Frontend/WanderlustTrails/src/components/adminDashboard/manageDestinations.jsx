import React, { useState, useEffect } from 'react';
import $ from 'jquery';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Pagination from './../Pagination'; // Import the Pagination component
import Popup from './../Popup'; // Import the Popup component for delete confirmation

// Function to manage destinations
const ManageDestinations = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        price: '',
        image: null,
        image_url: '',
    });
    
    const [errors, setErrors] = useState({}); // State to manage form errors
    const [showFormModal, setShowFormModal] = useState(false); // State to manage form modal visibility
    const [packages, setPackages] = useState([]); // State to manage packages
    const [isEditing, setIsEditing] = useState(false); // State to manage editing mode
    const [currentEditId, setCurrentEditId] = useState(null); // State to manage current editing package ID
    const [deletePopupVisible, setDeletePopupVisible] = useState(false); // State to manage delete confirmation popup visibility
    const [packageToDelete, setPackageToDelete] = useState(null); // State to manage package to delete
    const [loading, setLoading] = useState(true); // State to manage loading state
    const [currentPage, setCurrentPage] = useState(1); // Pagination state
    const itemsPerPage = 6; // Number of packages per page

    useEffect(() => {
        fetchPackages();
    }, []); // Fetch packages when the component mounts

    const fetchPackages = () => {
        console.log('Fetching packages');
        $.ajax({ // Fetch packages from the server
            url: 'http://localhost/WanderlustTrails/Backend/config/AdminDashboard/manageDestinations/viewPackage.php',
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json',
            success: function (response) {
                console.log('Fetched packages:', response);
                if (Array.isArray(response)) {
                    setPackages(
                        response.map(pkg => ({
                            ...pkg,
                            id: Number(pkg.id),
                            price: Number(pkg.price),
                        }))
                    ); 
                } else { //else handle unexpected response format
                    console.error('Unexpected response format:', response);
                    toast.error(response.message || 'Unexpected response format'); 
                }
            },
            error: function (xhr) {  //Ajax error handling
                console.error('Error fetching packages:', xhr);
                let errorMessage = 'Error fetching packages: Server error';
                try {
                    const response = JSON.parse(xhr.responseText);
                    errorMessage = 'Error fetching packages: ' + (response.message || 'Server error');
                } catch (e) {
                    errorMessage = xhr.statusText || 'Server error';
                }
                toast.error(errorMessage);
            },
            complete: function () { // Set loading state to false after fetching packages
                setLoading(false);
            },
        });
    };

    // Validate form data before submission
    const validateForm = () => {
        const newErrors = {}; // Initialize an empty object to store validation errors
        if (!formData.name.trim()) newErrors.name = 'Package name is required.';
        if (!formData.description.trim()) newErrors.description = 'Description is required.';
        if (!formData.location.trim()) newErrors.location = 'Location is required.';
        if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be a positive number.';
        // if (!isEditing && !formData.image && !formData.image_url) newErrors.image = 'Image is required.';
        setErrors(newErrors); // Update errors state with new errors
        return Object.keys(newErrors).length === 0;
    }; 

    // Handle input changes in the form
    const handleInputChange = e => {
        const { name, value } = e.target; 
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));  // Dynamically update form data based on input name
    };

    // Handle image file selection
    const handleImageChange = e => {
        setFormData(prevData => ({
            ...prevData,
            image: e.target.files[0],
            image_url: '',
        })); // Update form data with selected image file
    };

    // Handle form submission
    const handleSubmit = e => {
        e.preventDefault(); // Prevent default form submission behavior
        if (!validateForm()) {
            toast.error('Please fix form errors before submitting.');
            return; // Validate form data before submission
        }

        // Prepare form data for submission
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('location', formData.location);
        data.append('price', formData.price);
        if (formData.image) {
            data.append('image', formData.image);
        } 
        if (formData.image_url) {
            data.append('image_url', formData.image_url);
        } 
        if (isEditing && currentEditId) {
            data.append('id', currentEditId);
        } 

        console.log('Submitting data:', [...data.entries()], 'isEditing:', isEditing, 'currentEditId:', currentEditId);

        // Determine URL based on editing mode
        const url = isEditing
            ? 'http://localhost/WanderlustTrails/Backend/config/AdminDashboard/manageDestinations/editPackage.php'
            : 'http://localhost/WanderlustTrails/Backend/config/AdminDashboard/manageDestinations/insertPackage.php';

        $.ajax({ // Submit form data to the server
            url: url,
            type: 'POST',
            data: data,
            processData: false,
            contentType: false,
            dataType: 'json',
            success: function (response) {
                console.log('Response:', response);
                if (response.success) {
                    toast.success(isEditing ? 'Package updated successfully!' : 'Package added successfully!');
                    fetchPackages();
                    resetForm();
                    setCurrentPage(1); // Reset to first page after adding/editing
                } else {
                    toast.error(response.message || 'Failed to submit package');
                }
            },
            error: function (xhr) { //Ajax error handling
                console.error('Error submitting package:', xhr);
                let errorMessage = 'Error submitting package: Server error';
                try {
                    const response = JSON.parse(xhr.responseText);
                    errorMessage = 'Error submitting package: ' + (response.message || 'Server error');
                } catch (e) {
                    errorMessage = xhr.statusText || 'Server error';
                }
                toast.error(errorMessage);
            },
        });
    };

    // Reset form data and close modal
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            location: '',
            price: '',
            image: null,
            image_url: '',
        });
        setErrors({});
        setIsEditing(false);
        setCurrentEditId(null);
        setShowFormModal(false);
    };

    // Handle edit button click
    const handleEdit = packageId => {
        console.log('Editing package ID:', packageId);
        const packageToEdit = packages.find(pkg => pkg.id === packageId);
        console.log('Found package:', packageToEdit);
        if (packageToEdit) { // Check if package exists
            setFormData({  // Set form data with package details
                name: packageToEdit.name,
                description: packageToEdit.description,
                location: packageToEdit.location,
                price: packageToEdit.price,
                image: null,
                image_url: packageToEdit.image_url,
            });
            setIsEditing(true);
            setCurrentEditId(packageId);
            setShowFormModal(true);
        } else {
            toast.error('Package not found');
        }
    };

    // Handle delete button click
    const handleDelete = packageId => {
        console.log('Deleting package ID:', packageId);
        $.ajax({ // Send delete request to the server
            url: 'http://localhost/WanderlustTrails/Backend/config/AdminDashboard/manageDestinations/deletePackage.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ id: packageId }),
            dataType: 'json',
            success: function (response) { // Handle successful delete response
                console.log('Delete response:', response);
                if (response.success) {
                    setPackages(prevPackages => prevPackages.filter(pkg => pkg.id !== packageId)); // Remove deleted package from state
                    setDeletePopupVisible(false);
                    setPackageToDelete(null);
                    toast.success('Package deleted successfully!');
                    // Adjust current page if necessary
                    const totalItemsAfterDelete = packages.length - 1;
                    const totalPagesAfterDelete = Math.ceil(totalItemsAfterDelete / itemsPerPage);
                    if (currentPage > totalPagesAfterDelete && totalPagesAfterDelete > 0) {
                        setCurrentPage(totalPagesAfterDelete); 
                    }
                } else {
                    toast.error(response.message || 'Failed to delete package');
                }
            },
            error: function (xhr) { //Ajax error handling
                console.error('Error deleting package:', xhr);
                let errorMessage = 'Error deleting package: Server error';
                try {
                    const response = JSON.parse(xhr.responseText);
                    errorMessage = 'Error deleting package: ' + (response.message || 'Server error');
                } catch (e) {
                    errorMessage = xhr.statusText || 'Server error';
                }
                toast.error(errorMessage);
            },
        });
    };

    // Handle form modal toggle
    const toggleFormModal = () => {
        console.log('Toggling form modal, current showFormModal:', showFormModal);
        if (!showFormModal) {
            setFormData({
                name: '',
                description: '',
                location: '',
                price: '',
                image: null,
                image_url: '',
            });
            setIsEditing(false);
            setCurrentEditId(null);
            setErrors({});
        }
        setShowFormModal(!showFormModal);// Toggle form modal visibility
    };

    // Pagination logic
    const totalItems = packages.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPackages = packages.slice(startIndex, endIndex);

    if (loading) {
        return <div className="text-center p-4 text-white">Loading packages...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-6 bg-gray-700 rounded-lg shadow-md text-white">
            <ToastContainer />
            <h2 className="text-3xl font-semibold text-orange-600 mb-6">Manage Destinations</h2>

            <button
                onClick={toggleFormModal}
                className="w-full sm:w-auto bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md mb-6"
            >
                Add New Package
            </button>

            {/* Form Modal using Popup */}
            <Popup isOpen={showFormModal} onClose={resetForm}>
                <h3 className="text-xl font-semibold text-orange-600 mb-6">
                    {isEditing ? 'Edit Package' : 'Add New Package'}
                </h3>
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-blue-500" htmlFor="name">
                                Package Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter package name"
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-blue-500" htmlFor="location">
                                Package Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                id="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter package location"
                            />
                            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-blue-500" htmlFor="description">
                            Package Description
                        </label>
                        <textarea
                            name="description"
                            id="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter package description"
                            rows="4"
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-blue-500" htmlFor="price">
                                Package Price
                            </label>
                            <input
                                type="number"
                                name="price"
                                id="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter package price"
                                min="0"
                            />
                            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1 text-blue-500" htmlFor="image">
                                Package Image
                            </label>
                            {isEditing && formData.image_url && !formData.image && (
                                <div className="mb-4">
                                    <p className="text-green-300 text-sm">Current Image</p>
                                    <img
                                        src={`http://localhost/WanderlustTrails/Assets/Images/packages/${formData.image_url}`}
                                        alt="Current Package"
                                        className="w-32 h-32 object-cover rounded-lg mt-2"
                                    />
                                </div>
                            )}
                            <input
                                type="file"
                                name="image"
                                id="image"
                                onChange={handleImageChange}
                                className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white file:bg-blue-600 file:text-white file:border-none file:rounded file:px-3 file:py-1 file:mr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                accept="image/*"
                            />
                            {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                        </div>
                    </div>
                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                        >
                            {isEditing ? 'Update Package' : 'Submit Package'}
                        </button>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="w-full bg-gray-500 text-white font-bold py-2 rounded-lg hover:bg-gray-600 transition-colors shadow-md"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Popup>

            <div className="mt-8">
                <h3 className="text-xl font-semibold text-orange-600 mb-4">Existing Packages</h3>
                {packages.length === 0 ? (
                    <p className="text-gray-300">No packages found.</p>
                ) : (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {currentPackages.map(pkg => (
                                <div
                                    key={pkg.id}
                                    className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col space-y-3 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-semibold text-lg text-white">{pkg.name}</p>
                                            <p className="text-gray-300 text-sm">{pkg.location}</p>
                                            <p className="text-gray-300 text-sm">${pkg.price}</p>
                                        </div>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => handleEdit(pkg.id)}
                                                className="text-blue-500 hover:text-blue-400 transition-colors font-medium"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setPackageToDelete(pkg.id);
                                                    setDeletePopupVisible(true);
                                                }}
                                                className="text-red-500 hover:text-red-400 transition-colors font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    {pkg.image_url && (
                                        <img
                                            src={`http://localhost/WanderlustTrails/Assets/Images/packages/${pkg.image_url}`}
                                            alt={pkg.name}
                                            className="w-full h-40 object-cover rounded-lg mt-2"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        <Pagination
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </>
                )}
            </div>

            {/* Delete Confirmation Popup */}
            <Popup isOpen={deletePopupVisible} onClose={() => setDeletePopupVisible(false)}>
                <h2 className="text-xl font-semibold text-orange-600 mb-4">Delete Confirmation</h2>
                <p className="text-gray-300 mb-6">Are you sure you want to delete this package?</p>
                <div className="flex space-x-4">
                    <button
                        onClick={() => handleDelete(packageToDelete)}
                        className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-md"
                    >
                        Yes, Delete
                    </button>
                    <button
                        onClick={() => {
                            setDeletePopupVisible(false);
                            setPackageToDelete(null);
                        }}
                        className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors shadow-md"
                    >
                        Cancel
                    </button>
                </div>
            </Popup>
        </div>
    );
};

export default ManageDestinations;