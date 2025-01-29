import React, { useState } from "react";


const AdminDashboard = () => {
    const [activeSection, setActiveSection] = useState("destinations");

    return (
        <div className="dashboard-container">
            <h1>Admin Dashboard</h1>
            <nav>
                <button onClick={() => setActiveSection("destinations")}>Manage Destinations</button>
                <button onClick={() => setActiveSection("users")}>Manage Users</button>
                <button onClick={() => setActiveSection("bookings")}>Manage Bookings</button>
            </nav>

            <div className="dashboard-content">
                {activeSection === "destinations" && <manageDestinations />}
                {activeSection === "users" && <manageUsers />}
                {activeSection === "bookings" && <manageBookings />}
            </div>
        </div>
    );
};

export default AdminDashboard;
