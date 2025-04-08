import React, { useState } from "react";
import UserProfile from "../../components/userDashboard/UserProfile.jsx";
import UserViewBookings from "../../components/userDashboard/userViewBookings.jsx";
import UserReviews from "../../components/userDashboard/UserReviews.jsx";

const UserDashboard = () => {
    const [activeSection, setActiveSection] = useState("profile");

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
                return <UserProfile /> ;

        }
     }

    return (
        <div className="flex h-screen font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800 text-white flex flex-col p-6">
                <h2 className="text-2xl font-bold mb-6">User Dashboard</h2>
                <nav className="flex flex-col space-y-4">
                    <button 
                        onClick={() => setActiveSection("profile")}
                        className={`py-2 px-4 rounded-lg ${activeSection === "profile" ? "bg-gray-700" : "hover:bg-gray-700"}`}
                    >
                        Profile
                    </button>
                    <button 
                        onClick={() => setActiveSection("bookings")}
                        className={`py-2 px-4 rounded-lg ${activeSection === "bookings" ? "bg-gray-700" : "hover:bg-gray-700"}`}
                    >
                        Bookings    
                    </button>
                    <button 
                        onClick={() => setActiveSection("reviews")}
                        className={`py-2 px-4 rounded-lg ${activeSection === "reviews" ? "bg-gray-700" : "hover:bg-gray-700"}`}
                    >
                        Reviews
                    </button>
                </nav>
            </aside>

            <main className="flex-1 backdrop-blur p-8 overflow-y-auto">
              
                {renderContent()}
            </main>
        </div>
    );
};

export default UserDashboard;
