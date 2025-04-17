//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx

import React, { useState } from "react";
import ManageDestinations from "../../components/adminDashboard/manageDestinations";
import ManageUsers from "../../components/adminDashboard/manageUsers";
import ManageBookings from "../../components/adminDashboard/manageBookings";
import UserViewBookings from "../../components/userDashboard/userViewBookings";

const AdminDashboard = () => {
    const [activeSection, setActiveSection] = useState("destinations");

    // Function to render content based on active section
    const renderContent = () => {
        switch (activeSection) {
            case "destinations":
                return <ManageDestinations />;
            case "users":
                return <ManageUsers />;
            case "bookings":
                return <ManageBookings />;
            case "Mybooking":
                return <UserViewBookings/>;    
            default:
                return <ManageDestinations />;
        }
    };

    return (
        <div className="flex h-screen font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 text-white flex flex-col p-6">
                <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
                <nav className="flex flex-col space-y-4">
                    <button
                        onClick={() => setActiveSection("destinations")}
                        className={`py-2 px-4 rounded-lg text-left ${activeSection === "destinations" ? "bg-gray-700" : "hover:bg-gray-700"}`}
                    >
                        Destinations
                    </button>
                    <button
                        onClick={() => setActiveSection("users")}
                        className={`py-2 px-4 rounded-lg text-left ${activeSection === "users" ? "bg-gray-700" : "hover:bg-gray-700"}`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setActiveSection("bookings")}
                        className={`py-2 px-4 rounded-lg text-left ${activeSection === "bookings" ? "bg-gray-700" : "hover:bg-gray-700"}`}
                    >
                        Bookings
                    </button>
                    <button
                        onClick={() => setActiveSection("Mybooking")}
                        className={`py-2 px-4 rounded-lg text-left ${activeSection === "Mybooking" ? "bg-gray-700" : "hover:bg-gray-700"}`}
                    >       
                        My Bookings
                    </button>
                </nav>
            </aside>

            {/* Main content area */}
            <main className="flex-1 backdrop-blur p-8 overflow-y-auto">
            {/* <img
          src={background}
          alt="Signup Background"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        /> */}
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminDashboard;
