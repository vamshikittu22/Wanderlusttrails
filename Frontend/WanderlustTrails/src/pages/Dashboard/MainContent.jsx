import React from 'react';
import background from './../../assets/Images/wanderlusttrails.jpg'; // Adjust the path as needed

const MainContent = ({ children }) => {
    return (
        <main className="flex-1 backdrop-blur p-8 overflow-y-auto relative">
            <img
                src={background}
                alt="Dashboard Background"
                className="absolute inset-0 h-full w-full object-cover opacity-20"
            />
            <div className="relative z-10">{children}</div>
        </main>
    );
};

export default MainContent;