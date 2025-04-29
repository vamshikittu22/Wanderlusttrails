import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

// Placeholder components (replace with your actual components)
const ManageDestinations = () => <div>Manage Destinations Section</div>;
const ManageUsers = () => <div>Manage Users Section</div>;
const ManageBookings = () => <div>Manage Bookings Section</div>;

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState(() => {
    // Read the 'section' query parameter on mount, default to 'destinations'
    return searchParams.get("section") || "destinations";
  });

  // Update the URL query parameter when activeSection changes
  useEffect(() => {
    setSearchParams({ section: activeSection });
  }, [activeSection, setSearchParams]);

  // Handle button clicks and update activeSection
  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>
      <nav>
        <button
          onClick={() => handleSectionChange("destinations")}
          className={activeSection === "destinations" ? "active" : ""}
        >
          Manage Destinations
        </button>
        <button
          onClick={() => handleSectionChange("users")}
          className={activeSection === "users" ? "active" : ""}
        >
          Manage Users
        </button>
        <button
          onClick={() => handleSectionChange("bookings")}
          className={activeSection === "bookings" ? "active" : ""}
        >
          Manage Bookings
        </button>
      </nav>

      <div className="dashboard-content">
        {activeSection === "destinations" && <ManageDestinations />}
        {activeSection === "users" && <ManageUsers />}
        {activeSection === "bookings" && <ManageBookings />}
      </div>
    </div>
  );
};

export default AdminDashboard;