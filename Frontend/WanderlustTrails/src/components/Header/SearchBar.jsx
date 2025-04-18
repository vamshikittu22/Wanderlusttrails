//path: Frontend/WanderlustTrails/src/components/Header/SearchBar.jsx
import React, { useState } from 'react'
import { Button, Form } from 'react-bootstrap'

function SearchBar() {

  const [searchTerm, setSearchTerm] = useState('');
    const handleSearchChange = (e) => setSearchTerm(e.target.value);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        console.log('Searching for:', searchTerm);
        // Redirect to search results page or handle search
    };
  return (
    <div className="relative">
      <form onSubmit={handleSearchSubmit}>
        <input type="text" 
        placeholder="Search destinations..." 
        value={searchTerm} onChange={handleSearchChange} 
        className="text-white placeholder-gray-400 rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
        type="submit" 
        className="border border-b absolute right-2 top-1/2 transform -translate-y-1/2" 
        aria-label="Search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
            <g fill="black" stroke="orange" strokeWidth="1.2">
              <circle cx="11" cy="11" r="6" fill="green" fillOpacity=".35" />
              <path strokeLinecap="round" d="M11 8a3 3 0 0 0-3 3m12 9l-3-3" />
            </g>
          </svg>
        </button>
      </form>
    </div>
  )
}

export default SearchBar
