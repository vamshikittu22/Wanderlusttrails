import React, { useState } from "react";

const PackageSearchBar = ({ items, setFilteredItems }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredItems(items); // Reset to original items if search term is empty
      return;
    }

    const filtered = items.filter(pkg => {
      const searchLower = searchTerm.toLowerCase();
      return (
        pkg.name?.toLowerCase().includes(searchLower) ||
        pkg.location?.toLowerCase().includes(searchLower) ||
        pkg.id?.toString().includes(searchLower)
      );
    });

    setFilteredItems(filtered);
  };

  const handleClear = () => {
    setSearchTerm("");
    setFilteredItems(items); // Reset to original items
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex items-center justify-center mb-6">
      <div className="flex w-full max-w-lg">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search by name, location, or ID..."
          className="flex-1 p-3 rounded-l-lg bg-orange-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
        <button
          onClick={handleSearch}
          className="p-3 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 transition-all duration-200"
        >
          Search
        </button>
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