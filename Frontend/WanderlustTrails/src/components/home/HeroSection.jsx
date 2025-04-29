import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import video1 from '../../assets/Videos/Video1.mp4';

const HeroSection = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
  const [userName, setUserName] = useState('Traveler');

  useEffect(() => {
    const storedUser = isAuthenticated && user?.name ? user.name : 'Traveler';
    setUserName(storedUser);
  }, [isAuthenticated, user]);

  const isAdmin = isAuthenticated && user?.role === 'admin';

  const quickLinks = [
    isAdmin
      ? { label: 'Manage Bookings', path: '/AdminDashboard?section=bookings' } // Updated path with query param
      : { label: 'Plan Todo', path: '/TodoList' },
    ...(isAuthenticated
      ? [
          {
            label: 'Dashboard',
            path: isAdmin ? '/AdminDashboard' : '/Userdashboard',
          },
        ]
      : []),
    { label: 'Read Reviews', path: '/Reviews' },
    { label: 'About', path: '/about' },
  ];

  return (
    <section className="relative">
      <video autoPlay muted loop className="w-full h-full object-cover absolute inset-0">
        <source src={video1} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <h2 className="text-white text-4xl font-bold mb-2 animate-fade-in text-shadow-lg">
            Welcome, {userName}!
          </h2>
          <p className="text-white text-3xl font-semibold mb-6 animate-fade-in-delayed text-shadow-lg">
            The World is Yours to Explore!
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-fade-in-delayed-long">
            {quickLinks.map((link, index) => (
              <button
                key={index}
                onClick={() => navigate(link.path)}
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