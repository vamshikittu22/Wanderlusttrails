// path: Frontend/WanderlustTrails/src/components/Sidebar.jsx
import React from 'react';

const Sidebar = ({ title, sections = [], activeSection, setActiveSection }) => {
  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col p-6 z-10">
      {/* Sidebar title */}
      <h2 className="text-2xl font-bold mb-6">{title}</h2>

      {/* Navigation menu with sections */}
      <nav className="flex flex-col space-y-4">
        {sections.length > 0 ? (
          sections.map((section) => (
            <button
              key={section.key} // Unique key for list rendering
              onClick={() => setActiveSection(section.key)} // Update active section on click
              className={`py-2 px-4 rounded-lg text-left flex items-center space-x-2 ${
                activeSection === section.key
                  ? "bg-gray-700 font-bold" // Highlight active section
                  : "hover:bg-gray-700" // Hover effect for inactive sections
              }`}
              aria-current={activeSection === section.key ? "page" : undefined} // Accessibility: current page indicator
            >
              <span>{section.label}</span>

              {/* Arrow icon shown only for the active section */}
              {activeSection === section.key && (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
            </button>
          ))
        ) : (
          <p className="text-gray-400">No sections available.</p>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
