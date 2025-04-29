import React, { useState } from 'react';

const SortingComponent = ({ items, setSortedItems, sortOptions }) => {
    const [sortKey, setSortKey] = useState(sortOptions[0]?.key || '');

    const handleSortChange = (e) => {
        const selectedKey = e.target.value;
        setSortKey(selectedKey);

        const selectedOption = sortOptions.find(opt => opt.key === selectedKey);
        if (!selectedOption) return;

        const { sortFunction } = selectedOption;
        const sortedItems = [...items].sort(sortFunction);
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

// Example usage:
/*
<SortingComponent
    items={filteredBookings}
    setSortedItems={setFilteredBookings}
    sortOptions={[
        {
            key: 'id-asc',
            label: 'Booking ID (Asc)',
            sortFunction: (a, b) => a.id - b.id
        },
        {
            key: 'id-desc',
            label: 'Booking ID (Desc)',
            sortFunction: (a, b) => b.id - a.id
        },
        {
            key: 'status',
            label: 'Status',
            sortFunction: (a, b) => {
                const statusOrder = { confirmed: 1, pending: 2, canceled: 3 };
                return statusOrder[a.status] - statusOrder[b.status];
            }
        }
    ]}
/>
*/