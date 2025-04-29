import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import UserProfile from "../../components/userDashboard/UserProfile.jsx";
import UserViewBookings from "../../components/userDashboard/userViewBookings.jsx";
import UserReviews from "../../components/userDashboard/userReviews.jsx";
import background from "./../../assets/Images/wanderlusttrails.jpg"; // Adjust the path as needed

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState(() => {
    // Read the 'section' query parameter on mount, default to 'profile'
    const section = searchParams.get("section");
    if (section && ["profile", "bookings", "reviews"].includes(section)) {
      return section;
    }
    return "profile";
  });

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Update the URL query parameter when activeSection changes
  useEffect(() => {
    setSearchParams({ section: activeSection });
  }, [activeSection, setSearchParams]);

  // Function to render content based on active section
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

  return (
    <div className="flex h-screen font-sans relative">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-6 z-10">
        <h2 className="text-2xl font-bold mb-6">User Dashboard</h2>
        <nav className="flex flex-col space-y-4">
          <button
            onClick={() => setActiveSection("profile")}
            className={`py-2 px-4 rounded-lg text-left ${
              activeSection === "profile" ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveSection("bookings")}
            className={`py-2 px-4 rounded-lg text-left ${
              activeSection === "bookings" ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
          >
            Bookings
          </button>
          <button
            onClick={() => setActiveSection("reviews")}
            className={`py-2 px-4 rounded-lg text-left ${
              activeSection === "reviews" ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
          >
            Reviews
          </button>
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

export default UserDashboard;