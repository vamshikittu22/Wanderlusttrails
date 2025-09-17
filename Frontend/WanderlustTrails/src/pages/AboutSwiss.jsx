import React from 'react';
import { Link } from 'react-router-dom';
import { GlobeAltIcon, MapIcon, SparklesIcon, UserGroupIcon, CodeBracketIcon, TicketIcon, ClockIcon, StarIcon, FlagIcon } from '@heroicons/react/24/outline';
import { FaGithub, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

function AboutSwiss() {
  const features = [
    {
      icon: <GlobeAltIcon className="h-8 w-8 text-orange-700" />,
      title: "Global Destinations",
      description: "Discover handpicked destinations across the globe, from bustling cities to serene landscapes."
    },
    {
      icon: <MapIcon className="h-8 w-8 text-orange-700" />,
      title: "Smart Itineraries",
      description: "AI-powered trip planning that adapts to your preferences and travel style."
    },
    {
      icon: <SparklesIcon className="h-8 w-8 text-orange-700" />,
      title: "Unique Experiences",
      description: "Go beyond tourist spots with our curated selection of local experiences."
    },
    {
      icon: <UserGroupIcon className="h-8 w-8 text-orange-700" />,
      title: "Community Driven",
      description: "Get insights from a community of passionate travelers and locals."
    }
  ];

  const stats = [
    { 
      value: "1,247+", 
      label: "Trips Booked",
      icon: <TicketIcon className="h-6 w-6 text-orange-600" />
    },
    { 
      value: "7.3", 
      label: "Avg. Trip Duration (days)",
      icon: <ClockIcon className="h-6 w-6 text-orange-600" />
    },
    { 
      value: "4.8", 
      label: "Average Rating",
      icon: <StarIcon className="h-6 w-6 text-orange-600" />
    },
    { 
      value: "42", 
      label: "Countries Covered",
      icon: <FlagIcon className="h-6 w-6 text-orange-600" />
    }
  ];

  const socialLinks = [
    {
      name: 'GitHub',
      icon: <FaGithub className="h-6 w-6" />,
      url: 'https://github.com/vamshikittu22',
      color: 'hover:text-green-500'
    },
    {
      name: 'Twitter',
      icon: <FaTwitter className="h-6 w-6" />,
      url: 'https://twitter.com/yourusername',
      color: 'hover:text-blue-400'
    },
    {
      name: 'Instagram',
      icon: <FaInstagram className="h-6 w-6" />,
      url: 'https://instagram.com/yourusername',
      color: 'hover:text-pink-500'
    },
    {
      name: 'LinkedIn',
      icon: <FaLinkedin className="h-6 w-6" />,
      url: 'https://linkedin.com/in/yourusername',
      color: 'hover:text-blue-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <h1 className="text-4xl font-bold text-center text-orange-700 mb-8">
          About WanderlustTrails
        </h1>
        <p className="text-lg text-center mb-12">
          Welcome to WanderlustTrails, your companion for exploring the world's wonders! 
          We're passionate about inspiring travel dreams and making trip planning seamless, 
          whether you're chasing adventures, cultures, or hidden gems.
        </p>

        {/* Feature Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-indigo-300 text-center mb-6">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-800 p-6 rounded-lg border border-red-900">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-medium text-orange-700 mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* By The Numbers Section */}
        <div className="bg-gray-800 rounded-xl p-8 border border-red-900 mb-12">
          <h2 className="text-2xl font-semibold text-indigo-300 text-center mb-8">
            By The Numbers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="p-2 bg-orange-900/30 rounded-full">
                    {stat.icon}
                  </div>
                </div>
                <p className="text-3xl font-bold text-orange-500">{stat.value}</p>
                <p className="text-gray-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* GitHub Integration Section */}
        <div className="bg-gray-800 rounded-xl p-8 border border-red-900 mb-12">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
              <div className="flex items-center mb-4">
                <CodeBracketIcon className="h-8 w-8 text-orange-700 mr-2" />
                <h2 className="text-2xl font-semibold text-indigo-300">
                  Open Source Project
                </h2>
              </div>
              <p className="text-gray-300 mb-6">
                WanderlustTrails is an open-source project. Feel free to explore the code, 
                contribute, or report issues on GitHub.
              </p>
              <a
                href="https://github.com/vamshikittu22/Wanderlusttrails"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-700 hover:bg-orange-800 transition-colors duration-200"
              >
                <FaGithub className="mr-2 h-5 w-5" />
                View on GitHub
              </a>
            </div>
            <div className="md:w-1/2">
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="bg-gray-950 p-4 rounded font-mono text-sm overflow-x-auto">
                  <span className="text-green-400"># Clone the repository</span><br/>
                  <span className="text-gray-400">$</span> git clone https://github.com/vamshikittu22/Wanderlusttrails.git<br/><br/>
                  <span className="text-green-400"># Install dependencies</span><br/>
                  <span className="text-gray-400">$</span> cd Wanderlusttrails<br/>
                  <span className="text-gray-400">$</span> npm install<br/><br/>
                  <span className="text-green-400"># Start development server</span><br/>
                  <span className="text-gray-400">$</span> npm run dev
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Creator Section with Social Links */}
        <div className="bg-gray-800 rounded-xl p-8 border border-red-900 shadow-lg mb-12">
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-orange-700 flex-shrink-0">
                <img
                  src="https://github.com/vamshikittu22.png"
                  alt="Vamshi Krishna P"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y&s=256';
                  }}
                />
              </div>
              <div className="absolute inset-0 w-32 h-32 rounded-full bg-orange-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white font-medium">@vamshikittu22</span>
              </div>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-semibold text-orange-700 mb-2">
                Vamshi Krishna Pullaiahgari
                <span className="block text-lg text-indigo-300 mt-1">Founder & Developer</span>
              </h2>
              <p className="text-gray-300 mb-4">
                As a passionate traveler and technology enthusiast, I created Wanderlust Trails 
                to bridge the gap between adventure and seamless planning. Every line of code 
                is crafted with the traveler's experience in mind.
              </p>
              <div className="flex space-x-4 justify-center md:justify-start">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-gray-400 ${social.color} transition-colors duration-200`}
                    aria-label={social.name}
                    title={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/destinations"
            className="px-6 py-3 bg-orange-700 hover:bg-orange-800 text-white font-medium rounded-lg text-center transition-colors duration-200"
          >
            Explore Destinations
          </Link>
          <Link
            to="/contact"
            className="px-6 py-3 bg-transparent border-2 border-orange-700 text-orange-700 hover:bg-orange-900/20 font-medium rounded-lg text-center transition-colors duration-200"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AboutSwiss;
