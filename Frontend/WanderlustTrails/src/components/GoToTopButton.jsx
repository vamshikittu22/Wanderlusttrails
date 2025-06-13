// Path: Wanderlusttrails/Frontend/WanderlustTrails/src/components/GoToTopButton.jsx

// Import React and necessary hooks
import React, { useState, useEffect } from 'react';

// Component: GoToTopButton
// Displays a floating button that smoothly scrolls the user to the top of the page when clicked
const GoToTopButton = () => {
  // State to determine whether the button should be visible or not
  const [isVisible, setIsVisible] = useState(false);

  // Function to handle scroll event
  const handleScroll = () => {
    // Show the button if the user scrolled more than 300 pixels from the top
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Function to scroll to the top of the page with a smooth animation
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Smooth scrolling effect
    });
  };

  // useEffect to add and clean up the scroll event listener
  useEffect(() => {
    // Attach scroll listener when component mounts
    window.addEventListener('scroll', handleScroll);

    // Cleanup: remove the scroll listener when component unmounts
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <button
      onClick={scrollToTop} // On click, trigger scroll to top
      className={`
        fixed bottom-4 right-4 p-3 rounded-full bg-blue-500 text-white 
        shadow-md transition-opacity duration-300 
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
      style={{ opacity: isVisible ? 1 : 0 }} // For older browsers as fallback
    >
      {/* Up arrow icon using SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 11l7-7 7 7M5 19l7-7 7 7"
        />
      </svg>
    </button>
  );
};

// Export the component as default
export default GoToTopButton;
