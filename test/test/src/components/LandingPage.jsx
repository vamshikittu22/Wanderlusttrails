import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const LandingPage = () => {
    return (
      <div className="relative h-screen">
        <video autoPlay muted loop className="absolute w-full h-full object-cover">
          <source src="/path/to/your/video.mp4" type="video/mp4" />
        </video>
        <div className="absolute top-0 left-0 flex items-center justify-between w-full p-4 bg-black bg-opacity-75">
          <div className="flex items-center">
            <img src="/path/to/your/logo.png" alt="Logo" className="h-12" />
            <button className="ml-4 text-white bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded">
              Book Now
            </button>
          </div>
          <Navbar />
        </div>
        <div className="absolute bottom-0 left-0 w-full p-4 bg-black bg-opacity-75">
          <Footer />
        </div>
      </div>
    );
  };
  
  export default LandingPage;