import React from 'react';
import mockData from '../data/mockData';


const TravelInsurance = () => {
  console.log('TravelInsurance rendered with mock data:', mockData.insurance);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-indigo-300 mb-10 text-center tracking-tight">
          Choose Your Travel Insurance Plan
        </h1>

        <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
          {mockData.insurance.plans.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockData.insurance.plans.map((plan) => (
                <div
                  key={plan.id}
                  className="relative border border-gray-700 rounded-xl p-6 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  <h2 className="text-2xl font-semibold text-orange-500 mb-3">{plan.name}</h2>
                  <p className="text-gray-200 text-lg font-medium">Price: ${plan.price}</p>
                  <p className="text-gray-300 mt-2 mb-4 text-sm leading-relaxed">
                    {plan.coverage}
                  </p>
                  <button
                    onClick={() => console.log('Selected insurance plan:', plan)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    Select Plan
                  </button>
                  {plan.name === "Elite" && (
                    <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Recommended
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-300 text-center text-lg">
              No insurance plans available at the moment.
            </p>
          )}
        </div>

        {/* Additional Info Section */}
        <div className="mt-10 text-center">
          <p className="text-gray-400 text-sm">
            Need help choosing a plan?{' '}
            <a
              href="/contact"
              className="text-indigo-400 hover:text-indigo-300 underline transition-colors duration-200"
            >
              Contact our support team
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default TravelInsurance;