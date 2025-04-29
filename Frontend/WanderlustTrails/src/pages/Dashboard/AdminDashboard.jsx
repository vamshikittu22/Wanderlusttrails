import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import ManageDestinations from "../../components/adminDashboard/manageDestinations";
import ManageUsers from "../../components/adminDashboard/manageUsers";
import ManageBookings from "../../components/adminDashboard/manageBookings";
import background from "./../../assets/Images/wanderlusttrails.jpg"; // Adjust the path as needed

const AdminDashboard = () => {
  const { user, isAuthenticated } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState(() => {
    // Read the 'section' query parameter on mount, default to 'destinations' or 'Mybooking' based on role
    const section = searchParams.get("section");
    if (section && ["destinations", "users", "bookings", "Mybooking", "Reviews", "profile"].includes(section)) {
      return section;
    }
    return user?.role === "admin" ? "destinations" : "Mybooking";
  });

  // Determine if the user is an admin
  const isAdmin = isAuthenticated && user?.role === "admin";

  // Update the URL query parameter when activeSection changes
  useEffect(() => {
    setSearchParams({ section: activeSection });
  }, [activeSection, setSearchParams]);

  // Function to render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case "destinations":
        return <ManageDestinations />;
      case "users":
        return <ManageUsers />;
      case "bookings":
        return <ManageBookings />;
      default:
        return  <ManageDestinations /> 
    }
  };

  return (
    <div className="flex h-screen font-sans relative">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-6 z-10">
        <h2 className="text-2xl font-bold mb-6">
          {isAdmin ? "Admin Dashboard" : "User Dashboard"}
        </h2>
        <nav className="flex flex-col space-y-4">
          {/* Admin Sections (only for admins) */}
          {isAdmin && (
            <>
              <button
                onClick={() => setActiveSection("destinations")}
                className={`py-2 px-4 rounded-lg text-left ${
                  activeSection === "destinations" ? "bg-gray-700" : "hover:bg-gray-700"
                }`}
              >
                Destinations
              </button>
              <button
                onClick={() => setActiveSection("users")}
                className={`py-2 px-4 rounded-lg text-left ${
                  activeSection === "users" ? "bg-gray-700" : "hover:bg-gray-700"
                }`}
              >
                Users
              </button>
              <button
                onClick={() => setActiveSection("bookings")}
                className={`py-2 px-4 rounded-lg text-left ${
                  activeSection === "bookings" ? "bg-gray-700" : "hover:bg-gray-700"
                }`}
              >
                Bookings
              </button>
            </>
          )}
        </nav>
      </aside>

      {/* Main content area */}
      <main className="flex-1 backdrop-blur p-8 overflow-y-auto relative">
        <img
          src={background}
          alt="Dashboard Background"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="relative z-10">{renderContent()}</div>
      </main>
    </div>
  );
};

export default AdminDashboard;