import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import UserProfile from "./../../components/userDashboard/UserProfile.jsx";
import UserViewBookings from "./../../components/userDashboard/userViewBookings.jsx";
import UserReviews from "./../../components/userDashboard/UserReviews.jsx";
import Sidebar from "./../../components/SideBar.jsx"; // Adjust path as needed
import MainContent from "./MainContent.jsx"; // Adjust path as needed

// UserDashboard component
const UserDashboard = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useUser();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeSection, setActiveSection] = useState(() => {
        const section = searchParams.get("section");
        if (section && ["profile", "bookings", "reviews"].includes(section)) {
            return section;
        }
        return "profile";
    });

    // Redirect to login if not authenticated
    // useEffect(() => {
    //     if (!isAuthenticated) {
    //         navigate("/login");
    //     }
    // }, [isAuthenticated, navigate]);

    useEffect(() => {
        setSearchParams({ section: activeSection });
    }, [activeSection, setSearchParams]); // Update URL parameters when activeSection changes

    // Render content based on the active section
    const renderContent = () => {
        switch (activeSection) {
            case "profile":
                return <UserProfile />;
            case "bookings":
                return <UserViewBookings />;
            case "reviews":
                return <UserReviews />;
            default:
                return <UserProfile />;
        }
    };

    // Define the sections for the sidebar
    const userSections = [
        { key: "profile", label: "Profile" },
        { key: "bookings", label: "Bookings" },
        { key: "reviews", label: "Reviews" },
    ];

    return (
        <div className="flex h-screen font-sans relative">
            <Sidebar
                title="User Dashboard"
                sections={userSections}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
            />
            <MainContent>
                {renderContent()}
            </MainContent>
        </div>
    );
};

export default UserDashboard;