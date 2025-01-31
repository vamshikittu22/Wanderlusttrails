import React, { useState } from "react";
import TestUser from "../../components/userDashboard/testuser.jsx";

const UserDashboard = () => {
    const [activeSection, setActiveSection] = useState("profile");

    return (
        <div className="flex h-screen font-sans">
            <aside className="w-64 bg-gray-800 text-white flex flex-col p-6">
                <h2 className="text-2xl font-bold mb-6">User Dashboard</h2>
                <nav className="flex flex-col space-y-4">
                    <button 
                        onClick={() => setActiveSection("profile")}
                        className={`py-2 px-4 rounded-lg ${activeSection === "profile" ? "bg-gray-700" : "hover:bg-gray-700"}`}
                    >
                        Profile
                    </button>
                </nav>
            </aside>

            <main className="flex-1 backdrop-blur p-8 overflow-y-auto">
                {activeSection === "profile" && <TestUser />}
            </main>
        </div>
    );
};

export default UserDashboard;
