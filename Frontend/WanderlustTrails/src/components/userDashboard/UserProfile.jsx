import React, { useState, useEffect } from "react";
import axios from "axios";

const UserProfile = () => {
    const [user, setUser] = useState({
        id : "",
        firstName: "",
        lastName: "",
        dob: "",
        gender: "",
        nationality: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        zip: ""
    });

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        axios.get("http://localhost/WanderlustTrails/backend/config/UserDashboard/manageUserProfile/viewProfile.php")
            .then(response => {
                setUser(response.data);
            })
            .catch(error => console.error("Error fetching user details:", error));
    }, []);

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        axios.post("http://localhost/WanderlustTrails/backend/config/UserDashboard/manageUserProfile/editProfile.php", user)
            .then(response => {
                alert(response.data.success || response.data.error);
                setIsEditing(false);
            })
            .catch(error => console.error("Error updating profile:", error));
    };

    return (
        <div className="p-6 bg-gray-700 text-white rounded-lg shadow-md">
            <h2 className="text-2xl text-orange-600 font-bold mb-4">User Profile</h2>
            <div className="grid grid-cols-2 gap-4">
                {Object.keys(user).map((key) => (
                    <div key={key}>
                        <label className="block text-sm font-medium ">{key}</label>
                        <input 
                            type="text"
                            name={key}
                            value={user[key] || ""}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md"
                        />
                    </div>
                ))}
            </div>
            {/* <button 
                className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
                onClick={() => setIsEditing(!isEditing)}
            >
                {isEditing ? "Cancel" : "Edit"}
            </button> */}
            {isEditing && (
                <button 
                    className="mt-4 ml-2 bg-green-500 px-4 py-2 rounded-lg"
                    onClick={handleSubmit}
                >
                    Save Changes
                </button>
            )}
        </div>
    );
};

export default UserProfile;
