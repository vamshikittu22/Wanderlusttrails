import React from 'react';
import background from './../../assets/Images/wanderlusttrails.jpg'; // Background image for dashboard

// MainContent component wraps the main dashboard content with a blurred background image
const MainContent = ({ children }) => {
    return (
        <main className="flex-1 backdrop-blur p-8 overflow-y-auto relative">
            {/* Background image with low opacity for visual effect */}
            <img
                src={background}
                alt="Dashboard Background"
                className="absolute inset-0 h-full w-full object-cover opacity-20"
            />
            {/* Content is placed above the background with higher z-index */}
            <div className="relative z-10">{children}</div>
        </main>
    );
};

export default MainContent;
