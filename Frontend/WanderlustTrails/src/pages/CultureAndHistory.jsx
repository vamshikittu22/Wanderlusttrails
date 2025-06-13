// path: Frontend/WanderlustTrails/src/pages/CultureAndHistory.jsx
import React from 'react';
import mockData from '../data/mockData';

const LearnCultureAndHistory = () => {
  // Log to console when component renders, showing loaded mock data for culture section
  console.log('LearnCultureAndHistory rendered with mock data:', mockData.culture);

  return (
    // Main container with background color and padding, covers full screen height
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto"> {/* Center content with max width */}
        <h1 className="text-3xl font-bold text-indigo-300 mb-8 text-center">
          Explore Culture & History {/* Page title */}
        </h1>

        {/* Container for the culture guides with background and rounded corners */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          {mockData.culture.guides.length > 0 ? (  // Check if there are guides to display
            <div className="space-y-6">
              {/* Map over each guide and render its details */}
              {mockData.culture.guides.map((guide) => (
                <div key={guide.id} className="border border-red-900 rounded-lg p-4">
                  <h2 className="text-xl font-medium text-orange-700">{guide.title}</h2> {/* Guide title */}
                  <p className="text-gray-400 text-sm mb-2">{guide.destination}</p> {/* Guide destination */}
                  <p className="text-gray-200">{guide.content}</p> {/* Guide content description */}
                </div>
              ))}
            </div>
          ) : (
            // Message shown if no guides are available
            <p className="text-gray-200 text-center">No guides available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearnCultureAndHistory;
