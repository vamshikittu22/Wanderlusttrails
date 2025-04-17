import React, { useState, useEffect } from 'react';
import $ from 'jquery';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageDestinations = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        price: '',
        image: null,
        image_url: '',
    });
    const [errors, setErrors] = useState({});
    const [showFormModal, setShowFormModal] = useState(false);
    const [packages, setPackages] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEditId, setCurrentEditId] = useState(null);
    const [deletePopupVisible, setDeletePopupVisible] = useState(false);
    const [packageToDelete, setPackageToDelete] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = () => {
        console.log('Fetching packages');
        $.ajax({
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
                } else {
                    toast.error(response.message || 'Unexpected response format');
                }
            },
            error: function (xhr) {
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
            complete: function () {
                setLoading(false);
            },
        });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Package name is required.';
        if (!formData.description.trim()) newErrors.description = 'Description is required.';
        if (!formData.location.trim()) newErrors.location = 'Location is required.';
        if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be a positive number.';
        if (!isEditing && !formData.image && !formData.image_url) newErrors.image = 'Image is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = e => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleImageChange = e => {
        setFormData(prevData => ({
            ...prevData,
            image: e.target.files[0],
            image_url: '',
        }));
    };

    const handleSubmit = e => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fix form errors before submitting.');
            return;
        }

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

        const url = isEditing
            ? 'http://localhost/WanderlustTrails/Backend/config/AdminDashboard/manageDestinations/editPackage.php'
            : 'http://localhost/WanderlustTrails/Backend/config/AdminDashboard/manageDestinations/insertPackage.php';

        $.ajax({
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
                } else {
                    toast.error(response.message || 'Failed to submit package');
                }
            },
            error: function (xhr) {
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

    const handleEdit = packageId => {
        console.log('Editing package ID:', packageId);
        const packageToEdit = packages.find(pkg => pkg.id === packageId);
        console.log('Found package:', packageToEdit);
        if (packageToEdit) {
            setFormData({
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

    const handleDelete = packageId => {
        console.log('Deleting package ID:', packageId);
        $.ajax({
            url: 'http://localhost/WanderlustTrails/Backend/config/AdminDashboard/manageDestinations/deletePackage.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ id: packageId }),
            dataType: 'json',
            success: function (response) {
                console.log('Delete response:', response);
                if (response.success) {
                    setPackages(prevPackages => prevPackages.filter(pkg => pkg.id !== packageId));
                    setDeletePopupVisible(false);
                    setPackageToDelete(null);
                    toast.success('Package deleted successfully!');
                } else {
                    toast.error(response.message || 'Failed to delete package');
                }
            },
            error: function (xhr) {
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
        setShowFormModal(!showFormModal);
    };

    if (loading) {
        return <div className="text-center p-4 text-white">Loading packages...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-6 bg-gray-700 rounded-lg shadow-md text-white">
            <ToastContainer />
            <h2 className="text-3xl font-semibold text-orange-600 mb-6">Manage Destinations</h2>

            <button
                onClick={toggleFormModal}
                className="w-full bg-blue-500 text-white font-bold py-2 rounded-lg hover:bg-blue-600 mb-6"
            >
                Add New Package
            </button>

            {showFormModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-semibold text-orange-600 mb-4">
                            {isEditing ? 'Edit Package' : 'Add New Package'}
                        </h3>
                        <form onSubmit={handleSubmit} noValidate className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1" htmlFor="name">
                                        Package Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-700 border border-gray-400 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                        placeholder="Enter package name"
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" htmlFor="location">
                                        Package Location
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        id="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-700 border border-gray-400 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                        placeholder="Enter package location"
                                    />
                                    {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1" htmlFor="description">
                                    Package Description
                                </label>
                                <textarea
                                    name="description"
                                    id="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-700 border border-gray-400 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                    placeholder="Enter package description"
                                    rows="4"
                                />
                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1" htmlFor="price">
                                        Package Price
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        id="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        className="w-full bg-gray-700 border border-gray-400 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                        placeholder="Enter package price"
                                        min="0"
                                    />
                                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1" htmlFor="image">
                                        Package Image
                                    </label>
                                    {isEditing && formData.image_url && !formData.image && (
                                        <div className="mb-4">
                                            <p className="text-gray-300">Current Image</p>
                                            <img
                                                src={`http://localhost/WanderlustTrails/Assets/Images/packages/${formData.image_url}`}
                                                alt="Current Package"
                                                className="w-32 h-32 object-cover rounded-lg"
                                            />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        name="image"
                                        id="image"
                                        onChange={handleImageChange}
                                        className="w-full bg-gray-700 border border-gray-400 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                                        accept="image/*"
                                    />
                                    {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="w-full bg-indigo-500 text-white font-bold py-2 rounded-lg hover:bg-indigo-600"
                                >
                                    {isEditing ? 'Update Package' : 'Submit Package'}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="w-full bg-gray-500 text-white font-bold py-2 rounded-lg hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="mt-8">
                <h3 className="text-xl font-semibold text-orange-600 mb-4">Existing Packages</h3>
                {packages.length === 0 ? (
                    <p className="text-gray-300">No packages found.</p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {packages.map(pkg => (
                            <div
                                key={pkg.id}
                                className="bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center"
                            >
                                <div>
                                    <p className="font-semibold">{pkg.name}</p>
                                    <p className="text-gray-300">{pkg.location}</p>
                                    <p className="text-gray-300">${pkg.price}</p>
                                </div>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => handleEdit(pkg.id)}
                                        className="text-blue-500 hover:underline"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => {
                                            setPackageToDelete(pkg.id);
                                            setDeletePopupVisible(true);
                                        }}
                                        className="text-red-500 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {deletePopupVisible && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white max-w-md w-full">
                        <h2 className="text-xl font-semibold text-orange-600 mb-4">Delete Confirmation</h2>
                        <p className="text-gray-300 mb-4">Are you sure you want to delete this package?</p>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => handleDelete(packageToDelete)}
                                className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                Yes, Delete
                            </button>
                            <button
                                onClick={() => {
                                    setDeletePopupVisible(false);
                                    setPackageToDelete(null);
                                }}
                                className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageDestinations;