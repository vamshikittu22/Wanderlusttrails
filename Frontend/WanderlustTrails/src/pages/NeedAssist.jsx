// Path: Frontend/WanderlustTrails/src/pages/NeedAssist.jsx

import React from 'react';
import mockData from '../data/mockData';

// Component to display language phrases and tourist tips
const LanguageAndTouristAssist = () => {
  // Log mock data for debugging
  console.log('LanguageAndTouristAssist rendered with mock data:', mockData.language);

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Title */}
        <h1 className="text-3xl font-bold text-indigo-300 mb-8 text-center">
          Language & Tourist Assistance
        </h1>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg space-y-8">
          {/* Useful Phrases Section */}
          <div>
            <h2 className="text-xl font-medium text-orange-700 mb-4">Useful Phrases</h2>
            {mockData.language.phrases.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mockData.language.phrases.map((phrase) => (
                  <div key={phrase.id} className="border border-red-900 rounded-lg p-4">
                    <p className="text-gray-200 font-medium">{phrase.phrase}</p>
                    <p className="text-gray-400 text-sm">{phrase.translation}</p>
                    <p className="text-gray-400 text-sm">{phrase.destination}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-200">No phrases available.</p>
            )}
          </div>

          {/* Tourist Tips Section */}
          <div>
            <h2 className="text-xl font-medium text-orange-700 mb-4">Tourist Tips</h2>
            {mockData.language.tips.length > 0 ? (
              <div className="space-y-4">
                {mockData.language.tips.map((tip) => (
                  <div key={tip.id} className="border border-red-900 rounded-lg p-4">
                    <p className="text-gray-200">{tip.tip}</p>
                    <p className="text-gray-400 text-sm">{tip.destination}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-200">No tips available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageAndTouristAssist;
