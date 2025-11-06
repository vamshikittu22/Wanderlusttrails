//path to: Frontend/WanderlustTrails/src/pages/Dashboard/AdminDashboard.jsx

import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import ManageDestinations from "../../components/adminDashboard/manageDestinations";
import ManageUsers from "../../components/adminDashboard/manageUsers";
import ManageBookings from "../../components/adminDashboard/manageBookings";
import Sidebar from "./../../components/SideBar.jsx"; // Adjust path as needed
import MainContent from "./MainContent.jsx"; // Adjust path as needed
import AdminStatisticsDashboard from "../../components/adminDashboard/AdminStatisticsDashboard.jsx";

// AdminDashboard component - main admin panel with sidebar and main content
const AdminDashboard = () => {
    const navigate = useNavigate(); // Navigate programmatically between routes
    const { user, isAuthenticated } = useUser(); // Get current user and authentication state from context
    const [searchParams, setSearchParams] = useSearchParams(); // For reading and updating URL query params
    const isAdmin = isAuthenticated && user?.role === "admin";  // Check if user is authenticated admin

    // Initialize activeSection state based on URL param "section"
    const [activeSection, setActiveSection] = useState(() => {
        const section = searchParams.get("section"); // Get "section" query param from URL
        if (section && ["destinations", "users", "bookings"].includes(section)) {
            return section;
        }
        return "destinations"; // Default section
    });

    // Optional redirect if user is not admin (currently commented out)
    // useEffect(() => {
    //     if (!isAdmin) {
    //         navigate("/AdminDashboard"); // Could redirect to login or no-access page
    //     }
    // }, [isAdmin, navigate]);

    // Sync activeSection state to URL query parameters
    useEffect(() => {
        if (isAdmin) {
            setSearchParams({ section: activeSection });
        }
    }, [activeSection, setSearchParams, isAdmin]);

    // Render admin content based on active section
    const renderContent = () => {
        switch (activeSection) {
            case "destinations":
                return <ManageDestinations />;
            case "users":
                return <ManageUsers />;
            case "bookings":
                return <ManageBookings />;
            case "statistics":
                return <AdminStatisticsDashboard />;
            default:
                return <ManageDestinations />;
        }
    };

    // Sections for sidebar navigation
    const adminSections = [
        { key: "destinations", label: "Destinations" },
        { key: "users", label: "Users" },
        { key: "bookings", label: "Bookings" },
        { key: "statistics", label: "Statistics" },
    ];

    return (
        <div className="flex h-screen font-sans relative">
            <Sidebar
                title="Admin Dashboard"
                sections={adminSections}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
            />
            <MainContent>
                {renderContent()}
            </MainContent>
        </div>
    );
};

export default AdminDashboard;
