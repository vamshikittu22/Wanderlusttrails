//path: Frontend/WanderlustTrails/src/pages/CultureAndHistory.jsx
import React from 'react';
import mockData from '../data/mockData';

const LearnCultureAndHistory = () => {
  console.log('LearnCultureAndHistory rendered with mock data:', mockData.culture);

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-300 mb-8 text-center">
          Explore Culture & History
        </h1>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          {mockData.culture.guides.length > 0 ? (
            <div className="space-y-6">
              {mockData.culture.guides.map((guide) => (
                <div key={guide.id} className="border border-red-900 rounded-lg p-4">
                  <h2 className="text-xl font-medium text-orange-700">{guide.title}</h2>
                  <p className="text-gray-400 text-sm mb-2">{guide.destination}</p>
                  <p className="text-gray-200">{guide.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-200 text-center">No guides available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearnCultureAndHistory;