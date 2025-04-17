//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Dropdown from 'react-bootstrap/Dropdown';
import video1 from '../../assets/Videos/Video1.mp4'

const AdvanceSearch = () => {
    const [formData, setFormData] = useState({
        destination: '',
        guests: '',
    });
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        // redirect to search page with data
        console.log('Searching for:', {
            ...formData,
            checkIn: startDate,
            checkOut: endDate,
        });
    };

    return (
        <section className="relative">
           <video 
        autoPlay 
        muted 
        loop 
        className="w-full h-full object-cover absolute inset-0" 
      >
        <source src={video1} type="video/mp4" /> 
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-black opacity-50"></div> {/* Added overlay to effect */}
      <div className="relative z-10">
            <div className="max-w-5xl mx-auto px-4 space-x-2 items-center backdrop-blur-1 justify-between py-12">
                
                <h2 className=" text-white text-3xl font-bold mb-4 text-center">
                    Book your journey now!
                </h2>

                <form onSubmit={handleSubmit} className=" p-8 rounded-lg shadow-md bg-transparent">
                    <div className="flex md:flex-row gap-4 mb-4 ">

                        <div className="md:w-1/4">
                            <label htmlFor="destination" className="block text-gray-200 font-medium mb-2"
                            >Destination:
                            </label>
                            <Dropdown>
                                <Dropdown.Toggle variant="secondary" id="destination-dropdown">
                                    {formData.destination || 'Select Destination'}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => handleChange({ target: { name: 'destination', value: 'Paris, France' } })}>Paris, France</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleChange({ target: { name: 'destination', value: 'Tokyo, Japan' } })}>Tokyo, Japan</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleChange({ target: { name: 'destination', value: 'Rome, Italy' } })}>Rome, Italy</Dropdown.Item>
                                    {/* Add more destinations here */}
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>

                        <div className="md:w-1/4">
                            <label htmlFor="guests" className="block text-gray-200 font-medium "
                            >Guests:
                            </label>
                            <Dropdown>
                                <Dropdown.Toggle variant="secondary" id="destination-dropdown">
                                    {formData.guests || 'Select Guests'}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => handleChange({ target: { name: 'guests', value: '1 Adult' } })}>1 Adult</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleChange({ target: { name: 'guests', value: '2 Adult' } })}>2 Adult</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleChange({ target: { name: 'guests', value: '3 Adult' } })}>3 Adult</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleChange({ target: { name: 'guests', value: '4 Adult' } })}>4 Adult</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleChange({ target: { name: 'guests', value: '2 Adult, 1 Child' } })}>2 Adults, 1 Child</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleChange({ target: { name: 'guests', value: '3 Adult, 2 Child' } })}>3 Adults, 2 Child</Dropdown.Item>

                                    {/* Add more guests here */}
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>

                        <div className="md:w-1/4"> 
                        <label htmlFor="dateRange" className="block text-gray-200 font-medium mb-2">
                            Date Range:
                        </label>
                        <DatePicker
                            selectsRange={true}
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(update) => {
                                setDateRange(update);
                            }}
                            isClearable={true}
                            dateFormat="MMM d, yyyy"
                            className="shadow-sm border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        </div>

                        <div className="flex items-center justify-center md:w-1/4]">
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-green-700 text-orange-800 font-bold py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300"
                        >
                            Search
                        </button>
                        </div>
                    </div>
                    
                      
                    </form>
            </div>
      </div>    
        </section>
    );
};

export default AdvanceSearch;