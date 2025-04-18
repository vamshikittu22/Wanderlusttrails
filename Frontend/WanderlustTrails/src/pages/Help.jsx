//path: Frontend/WanderlustTrails/src/pages/HelpAndSupport.jsx
import React, { useState } from 'react';
import mockData from '../data/mockData';

const HelpAndSupport = () => {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  console.log('HelpAndSupport rendered with mock data:', mockData.support);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form submitted:', contactForm);
    setContactForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-300 mb-8 text-center">
          Help & Support
        </h1>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg space-y-8">
          {/* FAQs */}
          <div>
            <h2 className="text-xl font-medium text-orange-700 mb-4">Frequently Asked Questions</h2>
            {mockData.support.faqs.length > 0 ? (
              <div className="space-y-4">
                {mockData.support.faqs.map((faq) => (
                  <div key={faq.id} className="border border-red-900 rounded-lg p-4">
                    <h3 className="text-gray-200 font-medium">{faq.question}</h3>
                    <p className="text-gray-200">{faq.answer}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-200">No FAQs available.</p>
            )}
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-xl font-medium text-orange-700 mb-4">Contact Us</h2>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-200 font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={contactForm.name}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-orange-50 text-gray-800 border border-red-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="block text-gray-200 font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-orange-50 text-gray-800 border border-red-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your Email"
                />
              </div>
              <div>
                <label className="block text-gray-200 font-medium mb-1">Message</label>
                <textarea
                  name="message"
                  value={contactForm.message}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-orange-50 text-gray-800 border border-red-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your Message"
                  rows="4"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-gray-200 font-medium py-3 rounded-lg transition-colors duration-200"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpAndSupport;