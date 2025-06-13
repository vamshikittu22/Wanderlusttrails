// path: Frontend/WanderlustTrails/src/components/SortingComponent.jsx
import React, { useState } from 'react';

const SortingComponent = ({ items, setSortedItems, sortOptions }) => {
  // State to keep track of the currently selected sort key
  const [sortKey, setSortKey] = useState(sortOptions[0]?.key || '');

  // Handler for when the user changes the sort option
  const handleSortChange = (e) => {
    const selectedKey = e.target.value;
    setSortKey(selectedKey);

    // Find the corresponding sort option object based on the key
    const selectedOption = sortOptions.find(opt => opt.key === selectedKey);
    if (!selectedOption) return;

    // Destructure the sort function from the selected option
    const { sortFunction } = selectedOption;

    // Create a copy of items and sort using the provided sort function
    const sortedItems = [...items].sort(sortFunction);

    // Update the sorted items in the parent component state
    setSortedItems(sortedItems);
  };

  return (
    <div className="flex items-center space-x-2">
      <label className="text-gray-200 font-semibold">Sort by:</label>
      <select
        value={sortKey}
        onChange={handleSortChange}
        className="bg-gray-700 border border-gray-300 rounded px-3 py-1 text-white focus:outline-none focus:border-blue-500"
      >
        {/* Render sort options as select dropdown options */}
        {sortOptions.map(option => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortingComponent;
