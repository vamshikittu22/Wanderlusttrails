// PATH: Frontend/WanderlustTrails/src/pages/Home.jsx

import React from 'react';
import { useUser } from '../context/UserContext.jsx';
import { Link, Navigate } from 'react-router-dom';
import Banner from '../components/home/Banner.jsx';
import ContactCard from '../components/home/ContactCard.jsx';
import HeroSection from '../components/home/HeroSection.jsx';

function Home() {
  // Extract user and authentication status from UserContext
  const { user, isAuthenticated } = useUser();

  // Currently, no redirect or conditional rendering based on authentication is done here.
  // You could add logic such as redirecting unauthorized users if needed.

  return (
    <>
      {/* Main hero section of the home page */}
      <HeroSection />
      {/* Banner section showing promotions or info */}
      <Banner />
      {/* Contact card section */}
      <ContactCard />
      {/* Placeholder for feature cards */}
      <h2>cards showing features</h2>
    </>
  );
}

export default Home;
