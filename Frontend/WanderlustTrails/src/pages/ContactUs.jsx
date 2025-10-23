import React, { useState } from 'react';

const ContactUs = () => {
  // State to store form input values
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  // State to track form validation errors
  const [errors, setErrors] = useState({});

  // State to store success or error message after submission
  const [message, setMessage] = useState(''); 

  // Handles updating form input fields on user typing
  const handleChange = (e) => {
    setFormData({
      ...formData,               // Keep existing data
      [e.target.name]: e.target.value,  // Update changed field
    });
  };

  // Validates form inputs before submission
  const validate = () => {
    const newErrors = {};
    // Basic email regex pattern for validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name) newErrors.name = 'Name is required';
    if (!emailPattern.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.message) newErrors.message = 'Message is required';

    // Update errors state to display errors on UI
    setErrors(newErrors);

    // Return true if no errors, else false
    return Object.keys(newErrors).length === 0;
  };

  // Handles form submission event
  const handleSubmit = (e) => {
    e.preventDefault();  // Prevent default form reload on submit

    // If validation fails, stop submission
    if (!validate()) return;

    // Log form data to console
    console.log('Form submitted successfully!');
    console.log(formData);

    // Show success message
    setMessage('Message sent successfully!');
    
    // Clear form inputs
    setFormData({ name: '', email: '', phone: '', message: '' });
    
    // Clear any previous errors
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
      {/* Name input */}
      <div className="mb-4">
        <label htmlFor="name" className="block text-sky-300 font-bold mb-2">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}        // Controlled input value
          onChange={handleChange}      // Update state on change
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
        {/* Show error if name validation fails */}
        {errors.name && <p className="text-red-500 text-xs italic">{errors.name}</p>}
      </div>

      {/* Email and Phone side by side */}
      <div className="flex mb-4">
        <div className="w-1/2 mr-2">
          <label htmlFor="email" className="block text-sky-300 font-bold mb-2">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          {/* Show error if email validation fails */}
          {errors.email && <p className="text-red-500 text-xs italic">{errors.email}</p>}
        </div>

        <div className="w-1/2 ">
          <label htmlFor="phone" className="block text-sky-300 font-bold mb-2">Phone:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
          {/* Show error if phone validation fails */}
          {errors.phone && <p className="text-red-500 text-xs italic">{errors.phone}</p>}
        </div>
      </div>

      {/* Message textarea */}
      <div className="mb-4">
        <label htmlFor="message" className="block text-sky-300 font-bold mb-2">Message:</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
        {/* Show error if message validation fails */}
        {errors.message && <p className="text-red-500 text-xs italic">{errors.message}</p>}
      </div>

      {/* Submit button */}
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Submit
      </button>

      {/* Display success or error message after form submission */}
      {message && <p className="text-green-500 text-center mt-4">{message}</p>}
    </form>
  );
};

export default ContactUs;
