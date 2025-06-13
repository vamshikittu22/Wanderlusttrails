// path: Wanderlusttrails/Frontend/WanderlustTrails/src/components/UserDetails.jsx
import { useState } from "react";

const UserDetails = ({ user }) => {
    // State to toggle visibility of user details
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="mt-4">
            {/* Toggle Button to show/hide details */}
            <button 
                className="mt-4 px-4 py-2 bg-orange-500 text-white font-semibold rounded-md shadow-md hover:bg-orange-600"
                onClick={() => setShowDetails(!showDetails)}
            >
                {showDetails ? "Hide Details" : "Click here for your Details"}
            </button>

            {/* Conditionally render user details when showDetails is true */}
            {showDetails && (
                <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-2xl mt-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Details</h2>
                    <div className="text-gray-700 space-y-2">
                        <p><strong>Name:</strong> {user.firstname} {user.lastname}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Phone:</strong> {user.phone}</p>
                        <p><strong>Date of Birth:</strong> {user.dob}</p>
                        <p><strong>Gender:</strong> {user.gender}</p>
                        <p><strong>Nationality:</strong> {user.nationality}</p>
                        <p><strong>Address:</strong> {user.street}, {user.city}, {user.state}, {user.zip}</p>
                        <p>
                            The booking will be made using the details above, verify them correctly. 
                            To make any changes please visit user dashboard.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDetails;
