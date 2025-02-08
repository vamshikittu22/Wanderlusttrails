import React, { useState, useEffect } from "react";
import axios from "axios";

const testUser = () => {
    const [formData, setFormData] = useState({
        id : "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dob: "",
        gender: "",
        nationality: "",
        street: "",
        city: "",
        state: "",
        zip: ""
    });
   
    const userID = localStorage.getItem("userId"); // Retrieve user ID
console.log(userID);
    const [errors, setErrors] = useState({});
    const [users, setUsers] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEditId, setCurrentEditId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    console.log("User ID being sent: ", userID);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost/WanderlustTrails/backend/config/UserDashboard/manageUserProfile/viewProfile.php?userId=${userID}');
            if (Array.isArray(response.data)) {
                setUsers(response.data);
            } else {
                console.error("Unexpected response format:", response.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.id) newErrors.id = "User ID is required.";
        if (!formData.firstname) newErrors.firstname = "First name is required.";
        if (!formData.lastname) newErrors.lastname = "Last name is required.";
        if (!formData.email) newErrors.email = "Email is required.";
        if (!formData.phone) newErrors.phone = "Phone number is required.";
        if (!formData.dob) newErrors.dob = "Date of birth is required.";
        if (!formData.gender) newErrors.gender = "Gender is required.";
        if (!formData.nationality) newErrors.nationality = "Nationality is required.";
        if (!formData.street) newErrors.street = "Street address is required.";
        if (!formData.city) newErrors.city = "City is required.";
        if (!formData.state) newErrors.state = "State is required.";    
        if (!formData.zip) newErrors.zip = "Zip code is required.";
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const response = await axios.post(
                `http://localhost/WanderlustTrails/backend/config/UserDashboard/manageUserProfile/editProfile.php?id=${currentEditId}`,
                formData
            );

            console.log("Response:", response.data);
            alert("User details updated successfully!");
            fetchUsers();
            resetForm();
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to update user details.");
        }
    };

    const resetForm = () => {
        setFormData({
            id : "",
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            dob: "",
            gender: "",
            nationality: "",
            street: "",
            city: "",
            state: "",
            zip: ""
        });
        setErrors({});
        setIsEditing(false);
        setCurrentEditId(null);
    };

    const handleEdit = (userId) => {
        const userToEdit = users.find((user) => user.id === userId);
        if (userToEdit) {
            setFormData({
                id: userToEdit.id,
                firstname: userToEdit.firstname,
                lastname: userToEdit.lastname,
                email: userToEdit.email,
                phone: userToEdit.phone,
                dob: userToEdit.dob,
                gender: userToEdit.gender,
                nationality: userToEdit.nationality,
                street: userToEdit.street,
                city: userToEdit.city,
                state: userToEdit.state,
                zip: userToEdit.zip               
                
            });
            setIsEditing(true);
            setCurrentEditId(userId);
        }
    };

    return (
        <div className="p-4 backdrop-blur bg-gray-700 text-white-500 font-bold rounded-lg shadow-md">
            <h2 className="text-2xl text-orange-600 font-bold mb-4">Manage Users</h2>

            {isEditing && (
                <form onSubmit={handleSubmit} noValidate className="space-y-4 mb-4">
                    <h3 className="text-lg font-semibold mb-2">Edit User Details</h3>
                    
                    <div className="space-y-4">
                        <div className="flex mb-4">
                            <div className="w-1/2 mr-2">
                                <label className="block text-sm font-medium mb-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstname"
                                    value={formData.firstname}
                                    onChange={handleInputChange}
                                    className="w-full border text-dark border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                                    required
                                />
                                {errors.firstname && <p className="text-red-500 text-sm">{errors.firstname}</p>}
                            </div>
                            <div className="w-1/2">
                                <label className="block text-sm font-medium mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastname"
                                    value={formData.lastname}
                                    onChange={handleInputChange}
                                    className="w-full border text-dark border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                                    required
                                />
                                {errors.lastname && <p className="text-red-500 text-sm">{errors.lastname}</p>}
                            </div>
                        </div>

                        <div className="flex mb-4">
                            <div className="w-1/2 mr-2">
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full border text-dark border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                                    required
                                />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                            </div>
                            <div className="w-1/2">
                                <label className="block text-sm font-medium mb-1">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full border text-dark border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                                    required
                                />
                                {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                            </div>
                        </div>

                        <div className="flex mb-4">
                            <div className="w-1/2 mr-2">
                                <label className="block text-sm font-medium mb-1">Nationality</label>
                                <input
                                    type="text"
                                    name="nationality"
                                    value={formData.nationality}
                                    onChange={handleInputChange}
                                    className="w-full border text-dark border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                                    required
                                />
                                {errors.nationality && <p className="text-red-500 text-sm">{errors.nationality}</p>}
                            </div>
                            <div className="w-1/2">
                                <label className="block text-sm font-medium mb-1">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="w-full border text-dark border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-indigo-500 text-white font-bold py-2 rounded-lg hover:bg-indigo-600">
                        Update User
                    </button>
                </form>
            )}

            <h3 className="text-lg text-orange-700 font-bold mb-2">Manage Users</h3>
            {users.map((user) => (
                <div key={user.id} className="flex justify-between mb-2">
                    <p>{user.firstname} {user.lastname}</p>
                    <button onClick={() => handleEdit(user.id)} className="text-blue-500 hover:underline">
                        Edit
                    </button>
                </div>
            ))}
        </div>
    );
};

export default testUser;
