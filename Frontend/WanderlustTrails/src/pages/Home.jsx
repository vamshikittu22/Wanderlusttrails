//PATH: Frontend/WanderlustTrails/src/pages/Home.jsx
import React from 'react';
import { useUser } from '../context/UserContext.jsx';
import { Link, Navigate } from 'react-router-dom';
import Banner from '../components/home/Banner.jsx';
import ContactCard from '../components/home/ContactCard.jsx';
import HeroSection from '../components/home/HeroSection.jsx';

function Home() {
  const { user, isAuthenticated } = useUser();
 

  return (
    <>
      <HeroSection />
      <Banner />
      <ContactCard />
      <h2>cards showing features</h2>
    </>
  );
}

export default Home;
