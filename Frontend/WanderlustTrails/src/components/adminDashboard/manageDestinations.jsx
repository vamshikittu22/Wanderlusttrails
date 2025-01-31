
import React, { useState, useEffect } from "react";
import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

const ManageDestinations = () => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        location: "",
        price: "",
        image: null,
    });
    const [errors, setErrors] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [packages, setPackages] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEditId, setCurrentEditId] = useState(null);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const response = await axios.get("http://localhost/WanderlustTrails/backend/config/AdminDashboard/manageDestinations/viewPackage.php");
            if (Array.isArray(response.data)) {
                setPackages(response.data);
            } else {
                console.error("Unexpected response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching packages:", error);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = "Package name is required.";
        if (!formData.description) newErrors.description = "Description is required.";
        if (!formData.location) newErrors.location = "Location is required.";
        if (!formData.price || formData.price <= 0) newErrors.price = "Price must be a positive number.";
        if (!formData.image && !isEditing) newErrors.image = "Image is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        setFormData((prevData) => ({
            ...prevData,
            image: e.target.files[0],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const data = new FormData();

        if (isEditing) {
            data.append('id', currentEditId);
        }
        // data.append('id', formData.currentEditId);
        data.append("name", formData.name);
        data.append("description", formData.description);
        data.append("location", formData.location);
        data.append("price", formData.price);
        if (formData.image) data.append("image", formData.image);
        

        console.log("Submitting data:", [...data.entries()]); // Debugging log


        const url = isEditing
            ? `http://localhost/WanderlustTrails/backend/config/AdminDashboard/manageDestinations/editPackage.php?id=${currentEditId}`
            : "http://localhost/WanderlustTrails/backend/config/AdminDashboard/manageDestinations/insertPackage.php";

        try {
           const response = await axios.post(url, data, { headers: { "Content-Type": "multipart/form-data" } });
           
           console.log("Response:", response.data); // Debugging log
            console.log("Current Edit ID: ", currentEditId); //get id


            alert(isEditing ? "Package updated successfully!" : "Package added successfully!");
            fetchPackages();
            resetForm();
        } catch (error) {
            console.error("Error submitting package:", error);
            alert("Failed to submit package.");
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            location: "",
            price: "",
            image: null,
        });
        setErrors({});
        setShowForm(false);
        setIsEditing(false);
        setCurrentEditId(null);
    };

    const handleEdit = (packageId) => {
        const packageToEdit = packages.find((pkg) => pkg.id === packageId);
        if (packageToEdit) {
            setFormData({
                name: packageToEdit.name,
                description: packageToEdit.description,
                location: packageToEdit.location,
                price: packageToEdit.price,
                image: null,
            });
            setIsEditing(true);
            setCurrentEditId(packageId);
            setShowForm(true);
        }
    };

    return (
        <div className="p-4 backdrop-blur bg-gray-700 text-white-500 font-bold rounded-lg shadow-md">
            <h2 className="text-2xl text-orange-600 font-bold mb-4">Manage Destinations</h2>

            <button
                onClick={() => {
                    setShowForm(!showForm);
                    if (!showForm) {
                        // Reset form state only when opening the form
                        setFormData({
                            name: "",
                            description: "",
                            location: "",
                            price: "",
                            image: null,
                        });
                        setIsEditing(false); // Ensure editing state is reset
                    }
                }}
                className="w-full bg-blue-500 text-white font-bold py-2 rounded-lg hover:bg-blue-600 focus:outline-none mb-4"
            >
                {showForm ? "Cancel" : "Add New Package"}
            </button>

            {showForm && (
                <form onSubmit={handleSubmit} noValidate className="space-y-4 mb-4 ">
                    <h3 className="text-lg font-semibold mb-2">{isEditing ? "Edit Package" : "Add New Package"}</h3>
                    {/* Form Fields */}
                    <div className="space-y-4 ">
                    <div className="flex mb-4">
                        <div className="w-1/2 mr-2">
                            <label className="block text-sm font-medium mb-1" htmlFor="packageName">
                                Package Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full border text-dark border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                                placeholder="Enter package name"
                                required
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                        </div>
                        <div className="w-1/2">
                            <label className="block text-sm font-medium mb-1" htmlFor="packageLocation">
                                Package Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                id="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                className="w-full border text-dark border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                                placeholder="Enter package location"
                                required
                            />
                            {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1" htmlFor="packageDescription">
                            Package Description
                        </label>
                        <textarea
                            name="description"
                            id="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full border text-dark border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                            placeholder="Enter package description"
                            required
                        />
                        {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                    </div>

                    <div className="flex mb-4">
                        <div className="w-1/2 mr-2">
                            <label className="block text-sm font-medium mb-1" htmlFor="packagePrice">
                                Package Price
                            </label>
                            <input
                                type="number"
                                name="price"
                                id="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                className="w-full border text-dark border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                                placeholder="Enter package price"
                                required
                            />
                            {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                        </div>
                        <div className="w-1/2">
                        <label className="block text-sm font-medium mb-1" htmlFor="packageImage">
                            Package Image
                        </label>
                        <input
                            type="file"
                            name="image"
                            id="image"
                            onChange={handleImageChange}
                            className="w-full border text-red-500 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                            required
                        />
                        {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
                    </div>
                    </div>    

                    
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-500 text-white font-bold py-2 rounded-lg hover:bg-indigo-600"
                    >
                        {isEditing ? "Update Package" : "Submit Package"}
                    </button>
                </form>
            )}

            <div className="mt-8">
                <h3 className="text-lg text-orange-700 font-bold mb-2">Manage Existing Packages</h3>
                {packages.map((pkg) => (
                    <div key={pkg.id} className="flex justify-between mb-2">
                        <p>{pkg.name}</p>
                        <button
                            onClick={() => handleEdit(pkg.id)}
                            className="text-blue-500 hover:underline"
                        >
                            Edit
                        </button>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default ManageDestinations;
