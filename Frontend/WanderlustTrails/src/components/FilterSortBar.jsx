import React, { useState, useEffect } from 'react';

const FilterSortBar = ({ items, setFilteredItems, filterOptions, sortOptions }) => {
  const [activeFilter, setActiveFilter] = useState(filterOptions[0]?.key || '');
  const [activeSort, setActiveSort] = useState(sortOptions[0]?.key || '');

  const applyFilterAndSort = () => {
    const selectedFilter = filterOptions.find(opt => opt.key === activeFilter);
    const selectedSort = sortOptions.find(opt => opt.key === activeSort);

    if (!selectedSort) return;

    // Apply filter (if filterOptions exist)
    let filteredItems = [...items];
    if (selectedFilter) {
      filteredItems = filteredItems.filter(selectedFilter.filterFunction);
    }

    // Apply sort
    const sortedItems = filteredItems.sort(selectedSort.sortFunction);

    // Only update state if the result has changed
    setFilteredItems((prevItems) => {
      if (JSON.stringify(prevItems) === JSON.stringify(sortedItems)) {
        return prevItems; // Prevent unnecessary re-render
      }
      return sortedItems;
    });
  };

  const handleFilterChange = (key) => {
    setActiveFilter(key);
  };

  const handleSortChange = (key) => {
    setActiveSort(key);
  };

  useEffect(() => {
    applyFilterAndSort();
  }, [items, activeFilter, activeSort]);

  return (
    <div className="flex flex-wrap items-center space-x-4 mb-4">
      {filterOptions.length > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-gray-200 font-semibold">Filter by Status:</span>
          <div className="flex space-x-1 bg-gray-600 rounded-md p-1">
            {filterOptions.map(option => (
              <button
                key={option.key}
                onClick={() => handleFilterChange(option.key)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  activeFilter === option.key
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center space-x-2">
        <span className="text-gray-200 font-semibold">Sort by:</span>
        <div className="flex space-x-1 bg-gray-600 rounded-md p-1">
          {sortOptions.map(option => (
            <button
              key={option.key}
              onClick={() => handleSortChange(option.key)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeSort === option.key
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSortBar;