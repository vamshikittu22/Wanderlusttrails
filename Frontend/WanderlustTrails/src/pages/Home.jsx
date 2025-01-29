import React from 'react';
import { useUser } from '../context/UserContext.jsx';
import { Link, Navigate } from 'react-router-dom';
import Banner from '../components/home/Banner.jsx';
import DestinationSearchBar from '../components/home/destinationSearch.jsx';
import ContactCard from '../components/home/ContactCard.jsx';

function Home() {
  const { user, isAuthenticated } = useUser();

  // Check if the user is logged in and has the correct role
  if (!isAuthenticated || (user.role !== 'admin' && user.role !== 'user')) {
    return <>
                  <div>
                    <h1 className="text-center text-2xl font-bold mt-4">Welcome to Wanderlust Trails</h1>
                    <p className='mt-4 text-2xl text-center'>Please use the below links to login/signup </p>
                  </div>
                  <div>
                    <p className="mt-4 text-center">
                      Don't have an account? <Link to="/signup" className="py-2 px-3 rounded-md bg-gradient-to-r from-orange-500 to-red-700">Sign Up Now</Link>
                    </p>
                  </div>

                  <div>
                    <p className="mt-4 text-center">
                         <a href="/login" className="py-2 px-3 rounded-md bg-gradient-to-r from-orange-500 to-red-700">Login Now</a> If you already have an account...
                    </p>
                  </div>  
    
          </>;
  }

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
