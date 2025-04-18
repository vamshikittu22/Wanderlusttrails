//PATH: Frontend/WanderlustTrails/src/pages/Home.jsx
import React from 'react';
import { useUser } from '../context/UserContext.jsx';
import { Link, Navigate } from 'react-router-dom';
import Banner from '../components/home/Banner.jsx';
import DestinationSearchBar from '../components/home/destinationSearch.jsx';
import ContactCard from '../components/home/ContactCard.jsx';

function Home() {
  const { user, isAuthenticated } = useUser();
 

  return (
    <>
      <DestinationSearchBar />
      <Banner />
      <ContactCard />
      <h2>cards showing features</h2>
    </>
  );
}

export default Home;
