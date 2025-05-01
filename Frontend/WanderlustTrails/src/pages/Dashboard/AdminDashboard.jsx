import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import ManageDestinations from "../../components/adminDashboard/manageDestinations";
import ManageUsers from "../../components/adminDashboard/manageUsers";
import ManageBookings from "../../components/adminDashboard/manageBookings";
import Sidebar from "./../../components/SideBar.jsx"; // Adjust path as needed
import MainContent from "./MainContent.jsx"; // Adjust path as needed

// AdminDashboard component
const AdminDashboard = () => {
    const navigate = useNavigate(); // Use useNavigate to navigate
    const { user, isAuthenticated } = useUser(); // Get user and authentication status from context
    const [searchParams, setSearchParams] = useSearchParams(); // Use useSearchParams to manage URL parameters
    const isAdmin = isAuthenticated && user?.role === "admin";  // Check if the user is an admin

    const [activeSection, setActiveSection] = useState(() => {
        const section = searchParams.get("section"); // Get the section from URL parameters
        if (section && ["destinations", "users", "bookings"].includes(section)) {
            return section;
        }
        return "destinations"; // Default to "destinations" for admins
    });

   
    // useEffect(() => {
    //     if (!isAdmin) {
    //         navigate("/AdminDashboard"); //
    //     }
    // }, [isAdmin, navigate]); 


    useEffect(() => {
        if (isAdmin) {
            setSearchParams({ section: activeSection });
        }
    }, [activeSection, setSearchParams, isAdmin]); // Update URL parameters when activeSection changes

    const renderContent = () => {
        switch (activeSection) {
            case "destinations":
                return <ManageDestinations />;
            case "users":
                return <ManageUsers />;
            case "bookings":
                return <ManageBookings />;
            default:
                return <ManageDestinations />;
        }
    };  // Render content based on the active section


    // Define the sections for the sidebar
    const adminSections = [
        { key: "destinations", label: "Destinations" },
        { key: "users", label: "Users" },
        { key: "bookings", label: "Bookings" },
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