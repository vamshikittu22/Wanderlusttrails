//path: Frontend/WanderlustTrails/src/components/Pagination.jsx
import React from "react";

// Pagination component to display page controls for navigating through items
const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
    // Calculate total number of pages needed
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // If only one page, do not render pagination controls
    if (totalPages <= 1) {
        return null;
    }

    // Handler to change page and smoothly scroll to top
    const handlePageChange = (pageNumber) => {
        onPageChange(pageNumber); // Notify parent about page change
        window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top after page change
    };

    // Maximum number of page buttons to display at once
    const maxDisplayPages = 4;

    // Calculate start page to center currentPage in pagination if possible
    let startPage = Math.max(1, currentPage - Math.floor(maxDisplayPages / 2));
    // Calculate end page based on startPage and maxDisplayPages, bounded by totalPages
    let endPage = Math.min(totalPages, startPage + maxDisplayPages - 1);

    // Adjust startPage if endPage is near totalPages and fewer than maxDisplayPages pages are displayed
    if (endPage - startPage + 1 < maxDisplayPages) {
        startPage = Math.max(1, endPage - maxDisplayPages + 1);
    }

    // Create an array of page numbers to render as buttons
    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex justify-center mt-6 space-x-2">
            {/* First Page Button */}
            <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1} // Disable if already on first page
                className="py-1 px-3 rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:bg-purple-700 disabled:opacity-50"
                aria-label="First page"
            >
                &laquo; First
            </button>

            {/* Previous Page Button */}
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1} // Disable if already on first page
                className="py-1 px-3 rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:bg-purple-700 disabled:opacity-50"
                aria-label="Previous page"
            >
                &larr; Prev
            </button>

            {/* Page Number Buttons */}
            {pageNumbers.map((pageNumber) => (
                <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`py-1 px-3 rounded-lg text-white ${
                        currentPage === pageNumber
                            ? "bg-purple-700" // Highlight active page
                            : "bg-gradient-to-r from-blue-500 to-purple-600 hover:bg-purple-700"
                    }`}
                    aria-label={`Page ${pageNumber}`}
                >
                    {pageNumber}
                </button>
            ))}

            {/* Next Page Button */}
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages} // Disable if on last page
                className="py-1 px-3 rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:bg-purple-700 disabled:opacity-50"
                aria-label="Next page"
            >
                Next &rarr;
            </button>

            {/* Last Page Button */}
            <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages} // Disable if on last page
                className="py-1 px-3 rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:bg-purple-700 disabled:opacity-50"
                aria-label="Last page"
            >
                Last &raquo;
            </button>
        </div>
    );
};

export default Pagination;
