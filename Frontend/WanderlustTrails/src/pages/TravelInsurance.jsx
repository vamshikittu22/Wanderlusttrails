//path: Frontend/WanderlustTrails/src/pages/TravelInsurance.jsx
import React from 'react';
import mockData from '../data/mockData';

const TravelInsurance = () => {
  console.log('TravelInsurance rendered with mock data:', mockData.insurance);

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-300 mb-8 text-center">
          Travel Insurance Options
        </h1>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          {mockData.insurance.plans.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockData.insurance.plans.map((plan) => (
                <div key={plan.id} className="border border-red-900 rounded-lg p-4">
                  <h2 className="text-xl font-medium text-orange-700">{plan.name}</h2>
                  <p className="text-gray-200">Price: ${plan.price}</p>
                  <p className="text-gray-200">Coverage: {plan.coverage}</p>
                  <button
                    onClick={() => console.log('Selected insurance plan:', plan)}
                    className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Select Plan
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-200 text-center">No insurance plans available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TravelInsurance;