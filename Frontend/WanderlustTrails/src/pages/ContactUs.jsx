import React, { useState } from 'react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(''); 

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name) newErrors.name = 'Name is required';
    if (!emailPattern.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.message) newErrors.message = 'Message is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(formData);
    if (!validate()) return;

    try {


    
    

      if (response.ok) {
        setMessage('Message sent successfully!');
        setFormData({ name: '', email: '', phone: '', message: '' });
        setErrors({});
      } else {
        setMessage('Error sending message. Please try again later.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error sending message. Please try again later.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
      <div className="mb-4">
        <label htmlFor="name" className="block text-sky-300 font-bold mb-2">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
        {errors.name && <p className="text-red-500 text-xs italic">{errors.name}</p>}
      </div>
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
                {errors.phone && <p className="text-red-500 text-xs italic">{errors.phone}</p>}
            </div>
            </div>
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
        {errors.message && <p className="text-red-500 text-xs italic">{errors.message}</p>}
      </div>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Submit
      </button>
      {message && <p className="text-green-500 text-center mt-4">{message}</p>} {/* Success/error message */}
    </form>
  );
};

export default ContactUs;