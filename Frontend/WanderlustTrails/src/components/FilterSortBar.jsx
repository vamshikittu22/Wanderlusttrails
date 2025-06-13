// Import necessary hooks from React
import React, { useState, useEffect } from 'react';

// FilterSortBar component: allows filtering and sorting of a given items list
const FilterSortBar = ({
  items,                 // Full list of items to filter/sort
  setFilteredItems,     // Function to update the displayed (filtered/sorted) list
  filterOptions,        // Array of filter options: { key, label, filterFunction }
  sortOptions           // Array of sort options: { key, label, sortFunction }
}) => {

  // State to keep track of currently active filter
  const [activeFilter, setActiveFilter] = useState(filterOptions[0]?.key || '');

  // State to keep track of currently active sort
  const [activeSort, setActiveSort] = useState(sortOptions[0]?.key || '');

  // Function to apply both filtering and sorting based on active states
  const applyFilterAndSort = () => {
    // Find the currently selected filter and sort options
    const selectedFilter = filterOptions.find(opt => opt.key === activeFilter);
    const selectedSort = sortOptions.find(opt => opt.key === activeSort);

    // If no sort option is selected, exit early
    if (!selectedSort) return;

    // Clone the items list to avoid mutating props
    let filteredItems = [...items];

    // If a valid filter is selected, apply the filter function
    if (selectedFilter) {
      filteredItems = filteredItems.filter(selectedFilter.filterFunction);
    }

    // Apply the sort function to the filtered items
    const sortedItems = filteredItems.sort(selectedSort.sortFunction);

    // Update the filtered items state only if the result is different (to avoid unnecessary re-renders)
    setFilteredItems((prevItems) => {
      if (JSON.stringify(prevItems) === JSON.stringify(sortedItems)) {
        return prevItems; // No change needed
      }
      return sortedItems; // Update with new sorted data
    });
  };

  // Handle changing of the filter option
  const handleFilterChange = (key) => {
    setActiveFilter(key);
  };

  // Handle changing of the sort option
  const handleSortChange = (key) => {
    setActiveSort(key);
  };

  // Run filter and sort logic whenever the item list, or selected filter/sort changes
  useEffect(() => {
    applyFilterAndSort();
  }, [items, activeFilter, activeSort]);

  return (
    <div className="flex flex-wrap items-center space-x-4 mb-4">
      {/* Filter Section */}
      {filterOptions.length > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-gray-200 font-semibold">Filter by Status:</span>
          <div className="flex space-x-1 bg-gray-600 rounded-md p-1">
            {filterOptions.map(option => (
              <button
                key={option.key} // Unique key for each filter option
                onClick={() => handleFilterChange(option.key)} // Change filter on click
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeFilter === option.key
                    ? 'bg-orange-500 text-white' // Highlight active filter
                    : 'bg-gray-600 text-gray-200 hover:bg-gray-500' // Style inactive filters
                }`}
              >
                {option.label} {/* Display the label of the filter */}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sort Section */}
      <div className="flex items-center space-x-2">
        <span className="text-gray-200 font-semibold">Sort by:</span>
        <div className="flex space-x-1 bg-gray-600 rounded-md p-1">
          {sortOptions.map(option => (
            <button
              key={option.key} // Unique key for each sort option
              onClick={() => handleSortChange(option.key)} // Change sort on click
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeSort === option.key
                  ? 'bg-orange-500 text-white' // Highlight active sort
                  : 'bg-gray-600 text-gray-200 hover:bg-gray-500' // Style inactive sorts
              }`}
            >
              {option.label} {/* Display the label of the sort */}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Export the FilterSortBar component
export default FilterSortBar;
