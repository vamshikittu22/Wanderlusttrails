import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import UserProfile from "./../../components/userDashboard/UserProfile.jsx";
import UserViewBookings from "./../../components/userDashboard/userViewBookings.jsx";
import UserReviews from "./../../components/userDashboard/UserReviews.jsx";
import Sidebar from "./../../components/SideBar.jsx"; // Sidebar component for navigation
import MainContent from "./MainContent.jsx"; // Main content wrapper
import UserStatisticsDashboard from "../../components/userDashboard/UserStatisticsDashboard.jsx";

// UserDashboard component handles rendering of user-specific sections and navigation
const UserDashboard = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useUser(); // Get user data and auth status from context
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialize activeSection based on URL parameter or default to "profile"
    const [activeSection, setActiveSection] = useState(() => {
        const section = searchParams.get("section");
        if (section && ["profile", "bookings", "reviews"].includes(section)) {
            return section;
        }
        return "profile";
    });

    // Redirect to login if not authenticated (commented out for now)
    // useEffect(() => {
    //     if (!isAuthenticated) {
    //         navigate("/login");
    //     }
    // }, [isAuthenticated, navigate]);

    // Update URL params whenever activeSection changes to keep state in sync with URL
    useEffect(() => {
        setSearchParams({ section: activeSection });
    }, [activeSection, setSearchParams]);

    // Render content component based on active section
    const renderContent = () => {
        switch (activeSection) {
            case "profile":
                return <UserProfile />;
            case "bookings":
                return <UserViewBookings />;
            case "reviews":
                return <UserReviews />;
            case "statistics":
                return <UserStatisticsDashboard user={user} />;
            default:
                return <UserProfile />;
        }
    };

    // Sections for sidebar navigation
    const userSections = [
        { key: "profile", label: "Profile" },
        { key: "bookings", label: "Bookings" },
        { key: "reviews", label: "Reviews" },
        { key: "statistics", label: "Statistics" },
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
