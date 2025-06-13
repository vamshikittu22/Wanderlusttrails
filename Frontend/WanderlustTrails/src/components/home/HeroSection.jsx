// Path: Frontend/WanderlustTrails/src/components/HeroSection.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import video1 from '../../assets/Videos/Video1.mp4';

// HeroSection component displayed at the top of homepage
const HeroSection = () => {
  const navigate = useNavigate(); // React Router hook to programmatically navigate
  const { user, isAuthenticated } = useUser(); // Access user and auth status from UserContext
  const [userName, setUserName] = useState('Traveler'); // Local state to hold the display name

  // Effect to update username based on auth state
  useEffect(() => {
    const storedUser = isAuthenticated && user?.name ? user.name : 'Traveler';
    setUserName(storedUser); // Set user name based on login status
  }, [isAuthenticated, user]);

  const isAdmin = isAuthenticated && user?.role === 'admin'; // Check if logged-in user is admin

  // Build quick links dynamically based on user role and auth status
  const quickLinks = [
    isAdmin
      ? { label: 'Manage Bookings', path: '/AdminDashboard?section=bookings' } // Admin-specific link
      : { label: 'Plan Todo', path: '/TodoList' }, // User-specific link
    ...(isAuthenticated
      ? [
          {
            label: 'Dashboard',
            path: isAdmin ? '/AdminDashboard' : '/Userdashboard', // Dashboard path differs by role
          },
        ]
      : []), // Only show dashboard if authenticated
    { label: 'Read Reviews', path: '/Reviews' }, // Common to all users
    { label: 'About', path: '/about' }, // Common to all users
  ];

  return (
    <section className="relative">
      {/* Background video */}
      <video autoPlay muted loop className="w-full h-full object-cover absolute inset-0">
        <source src={video1} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark overlay over the video */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Foreground content */}
      <div className="relative z-10">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          {/* Welcome message */}
          <h2 className="text-white text-4xl font-bold mb-2 animate-fade-in text-shadow-lg">
            Welcome, {userName}!
          </h2>

          {/* Subtitle tagline */}
          <p className="text-white text-3xl font-semibold mb-6 animate-fade-in-delayed text-shadow-lg">
            The World is Yours to Explore!
          </p>

          {/* Render quick link buttons */}
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in-delayed-long">
            {quickLinks.map((link, index) => (
              <button
                key={index}
                onClick={() => navigate(link.path)} // Navigate to route on click
                className="bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
