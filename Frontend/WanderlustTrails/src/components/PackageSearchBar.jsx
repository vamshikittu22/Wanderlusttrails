import React, { useState } from "react";

// Component: PackageSearchBar
// Provides a search input to filter package items by name, location, or ID
const PackageSearchBar = ({ items, setFilteredItems }) => {
  // State to hold the current search term entered by the user
  const [searchTerm, setSearchTerm] = useState("");

  // Function to handle the search logic
  const handleSearch = () => {
    // If the search term is empty or only spaces, reset filtered items to original list
    if (!searchTerm.trim()) {
      setFilteredItems(items);
      return;
    }

    // Filter the items array based on matching search term with name, location, or id
    const filtered = items.filter(pkg => {
      const searchLower = searchTerm.toLowerCase();

      return (
        // Check if package name includes the search term (case-insensitive)
        pkg.name?.toLowerCase().includes(searchLower) ||

        // Check if package location includes the search term (case-insensitive)
        pkg.location?.toLowerCase().includes(searchLower) ||

        // Check if package ID (converted to string) includes the search term
        pkg.id?.toString().includes(searchLower)
      );
    });

    // Update the filtered items state in parent component
    setFilteredItems(filtered);
  };

  // Function to clear the search input and reset the filtered items to original list
  const handleClear = () => {
    setSearchTerm(""); // Clear the search input
    setFilteredItems(items); // Reset filtered items to full list
  };

  // Handle Enter key press to trigger search
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex items-center justify-center mb-6">
      <div className="flex w-full max-w-lg">
        {/* Search input box */}
        <input
          type="text"
          value={searchTerm} // Controlled input value
          onChange={(e) => setSearchTerm(e.target.value)} // Update search term on input change
          onKeyPress={handleKeyPress} // Trigger search on Enter key
          placeholder="Search by name, location, or ID..."
          className="flex-1 p-3 rounded-l-lg bg-orange-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="p-3 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 transition-all duration-200"
        >
          Search
        </button>

        {/* Clear button, shown only when there is a search term */}
        {searchTerm && (
          <button
            onClick={handleClear}
            className="ml-2 p-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default PackageSearchBar;
