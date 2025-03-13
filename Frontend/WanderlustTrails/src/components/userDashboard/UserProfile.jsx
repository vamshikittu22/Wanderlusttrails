import React, { useState, useEffect } from "react";
import axios from "axios";

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "", lastName: "", email: "", dob: "", gender: "", nationality: "", phone: "", street: "", city: "", state: "", zip: ""
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const userId = localStorage.getItem("userId");
                console.log("User ID from localStorage:", userId);
                if (!userId) {
                    alert("Please log in to view your profile.");
                    return;
                }
                const response = await axios.get(
                    `http://localhost/WanderlustTrails/backend/config/UserDashboard/manageUserProfile/viewProfile.php?userID=${userId}`
                );
                console.log("Response from viewProfile.php:", response.data);
                if (response.data.success) {
                    const userData = response.data.data[0];
                    setUser(userData);
                    setFormData(userData);
                } else {
                    console.error("Failed to fetch profile:", response.data);
                    alert("Failed to fetch profile: " + (response.data.message || "Unknown error"));
                }
            } catch (error) {
                console.error("Error fetching profile:", error.response?.data || error.message);
                alert("Error fetching profile: " + (error.response?.data?.message || "Server error"));
            }
        };
        fetchUserProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userId = localStorage.getItem("userId");
            const response = await axios.post(
                "http://localhost/WanderlustTrails/backend/config/UserDashboard/manageUserProfile/editProfile.php",
                { userID: userId, ...formData },
                { headers: { "Content-Type": "application/json" } }
            );
            if (response.data.success) {
                setUser({ ...user, ...formData });
                setIsEditing(false);
                alert("Profile updated successfully!");
            } else {
                alert("Failed to update profile: " + response.data.message);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error updating profile.");
        }
    };

    if (!user) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-6 bg-gray-700 text-white rounded-lg shadow-md">
            <h2 className="text-2xl text-orange-600 font-bold mb-4">User Profile</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                {Object.keys(formData).map((key) => (
                    <div key={key}>
                        <label className="block text-sm font-medium capitalize">{key}</label>
                        <input
                            type={key === "email" ? "email" : key === "dob" ? "date" : "text"}
                            name={key}
                            value={formData[key] || ""}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md"
                        />
                    </div>
                ))}
                <div className="col-span-2 mt-4">
                    <button
                        type="button"
                        onClick={() => setIsEditing(!isEditing)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                        {isEditing ? "Cancel" : "Edit"}
                    </button>
                    {isEditing && (
                        <button
                            type="submit"
                            className="ml-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                        >
                            Save Changes
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default UserProfile;