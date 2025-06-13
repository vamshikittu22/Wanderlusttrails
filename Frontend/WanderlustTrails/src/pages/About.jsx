// Frontend/WanderlustTrails/src/pages/About.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function About() {
  // State to store fetched GitHub user data
  const [data, setData] = useState(null);
  // State to indicate loading status
  const [isLoading, setIsLoading] = useState(true);
  // State to capture any fetch errors
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch GitHub profile data on component mount
    fetch('https://api.github.com/users/vamshikittu22')
      .then((response) => {
        if (!response.ok) {
          // Throw error if response not ok
          throw new Error('Failed to fetch GitHub data');
        }
        return response.json();
      })
      .then((data) => {
        // Log followers count for debugging
        console.log('GitHub data fetched: Followers:', data.followers);
        // Store the fetched data in state
        setData(data);
        setIsLoading(false); // Loading done
      })
      .catch((err) => {
        // Log and set error state on failure
        console.error('GitHub fetch error:', err.message);
        setError(err.message);
        setIsLoading(false); // Loading done even if error
      });
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <h1 className="text-4xl font-bold text-center text-orange-700 mb-8">
          About WanderlustTrails
        </h1>
        <p className="text-lg text-center mb-12">
          Welcome to WanderlustTrails, your companion for exploring the world’s wonders! 
          We’re passionate about inspiring travel dreams and making trip planning seamless, 
          whether you’re chasing adventures, cultures, or hidden gems.
        </p>

        {/* Creator Section with GitHub Info */}
        <div className="bg-gray-800 rounded-xl p-8 border border-red-900 shadow-lg mb-12">
          <h2 className="text-2xl font-semibold text-indigo-300 text-center mb-4">
            Meet the Creator
          </h2>
          {isLoading ? (
            // Loading message while fetching
            <p className="text-center">Loading GitHub profile...</p>
          ) : error ? (
            // Error message if fetch failed
            <p className="text-center text-red-400">
              {error}. Please try again later.
            </p>
          ) : data ? (
            // Display GitHub avatar, intro text, and follower count
            <div className="flex flex-col items-center">
              <img
                src={data.avatar_url}
                alt="GitHub avatar"
                className="w-32 h-32 rounded-full mb-4 border-2 border-orange-700"
              />
              <p className="text-lg text-center mb-2">
                Hi, I’m Vamshi, the developer behind WanderlustTrails. 
                As a tech enthusiast and travel lover, I built this platform to help 
                travelers plan unforgettable journeys.
              </p>
              <p className="text-lg text-center">
                GitHub Followers: <span className="text-orange-700">{data.followers}</span>
              </p>
            </div>
          ) : (
            // Fallback if no data available
            <p className="text-center">No data available.</p>
          )}
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-indigo-300 text-center mb-6">
            Why WanderlustTrails?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Feature Cards */}
            <div className="bg-gray-800 p-6 rounded-lg border border-red-900">
              <h3 className="text-xl font-medium text-orange-700 mb-2">
                Customized Itineraries
              </h3>
              <p>
                Plan your perfect trip with tailored destinations, activities, 
                and accommodations, all in one place.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-red-900">
              <h3 className="text-xl font-medium text-orange-700 mb-2">
                Cultural Insights
              </h3>
              <p>
                Dive into the history and traditions of 25+ countries with our 
                curated cultural guides.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-red-900">
              <h3 className="text-xl font-medium text-orange-700 mb-2">
                Language Assist
              </h3>
              <p>
                Learn key phrases and local tips to connect with communities 
                wherever you travel.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-red-900">
              <h3 className="text-xl font-medium text-orange-700 mb-2">
                Travel Support
              </h3>
              <p>
                From insurance options to FAQs, we’ve got your back for a 
                worry-free adventure.
              </p>
            </div>
          </div>
        </div>

        {/* Our Vision Section */}
        <div className="bg-gray-800 rounded-xl p-8 border border-red-900 shadow-lg mb-12">
          <h2 className="text-2xl font-semibold text-indigo-300 text-center mb-4">
            Our Vision
          </h2>
          <p className="text-lg text-center">
            At WanderlustTrails, we dream of connecting travelers with over 100 destinations 
            by 2026, offering immersive experiences that celebrate culture, adventure, and 
            discovery. Our goal is to make travel planning effortless and inspiring for everyone.
          </p>
        </div>

        {/* Contact Us Section */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-indigo-300 mb-4">
            Get in Touch
          </h2>
          <p className="text-lg mb-6">
            Have questions or ideas? Reach out to us and let’s plan your next adventure together!
          </p>
          <Link
            to="/contactUs"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-gray-200 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Contact Us
          </Link>
        </div>

        {/* Reviews Link Section */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-indigo-300 mb-4">
            Hear From Our Travelers
          </h2>
          <p className="text-lg mb-6">
            Curious about others’ experiences? Check out reviews from fellow adventurers!
          </p>
          <Link
            to="/reviews"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-gray-200 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Read Reviews
          </Link>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-indigo-300 mb-4">
            Start Your Journey
          </h2>
          <p className="text-lg mb-6">
            Ready to explore? Dive into WanderlustTrails and let’s make your 
            travel dreams a reality!
          </p>
          <Link
            to="/"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-gray-200 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Explore Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default About;
