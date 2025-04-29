import React from "react";

const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) {
        return null; // Don't render pagination if there's only one page
    }

    const handlePageChange = (pageNumber) => {
        onPageChange(pageNumber);
        window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top on page change
    };

    // Calculate the range of page numbers to display (limited to 4)
    const maxDisplayPages = 4;
    let startPage = Math.max(1, currentPage - Math.floor(maxDisplayPages / 2));
    let endPage = Math.min(totalPages, startPage + maxDisplayPages - 1);

    // Adjust startPage if endPage is at the maximum
    if (endPage - startPage + 1 < maxDisplayPages) {
        startPage = Math.max(1, endPage - maxDisplayPages + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex justify-center mt-6 space-x-2">
            {/* First Page Button */}
            <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="py-1 px-3 rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:bg-purple-700 disabled:opacity-50"
                aria-label="First page"
            >
                &laquo; First
            </button>

            {/* Previous Page Button */}
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="py-1 px-3 rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:bg-purple-700 disabled:opacity-50"
                aria-label="Previous page"
            >
                &larr; Prev
            </button>

            {/* Page Numbers (limited to 4) */}
            {pageNumbers.map((pageNumber) => (
                <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`py-1 px-3 rounded-lg text-white ${
                        currentPage === pageNumber
                            ? "bg-purple-700"
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
                disabled={currentPage === totalPages}
                className="py-1 px-3 rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:bg-purple-700 disabled:opacity-50"
                aria-label="Next page"
            >
                Next &rarr;
            </button>

            {/* Last Page Button */}
            <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="py-1 px-3 rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:bg-purple-700 disabled:opacity-50"
                aria-label="Last page"
            >
                Last &raquo;
            </button>
        </div>
    );
};

export default Pagination;