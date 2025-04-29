//path: Frontend/WanderlustTrails/src/pages/reviews.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import $ from "jquery";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from '../context/UserContext';
import ReviewCard from '../components/ReviewCard';
import FilterSortBar from '../components/FilterSortBar';
import Pagination from '../components/Pagination';


function Reviews() {
    // State to manage reviews and loading state
    const [reviews, setReviews] = useState([]);
    const [sortedReviews, setSortedReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const reviewsPerPage = 5;
    const navigate = useNavigate();
    const { user } = useUser();

    // Function to fetch reviews from the server
    useEffect(() => {
        const fetchReviews = () => {
            console.log("Fetching all reviews");
            $.ajax({
                url: "http://localhost/WanderlustTrails/backend/config/reviews/getAllReviews.php",
                type: "GET",
                dataType: "json",
                contentType: "application/json",
                success: function (response) {
                    console.log("All reviews response:", response);
                    if (response.success) {
                        const fetchedReviews = response.data || [];
                        setReviews(fetchedReviews);
                        const sorted = [...fetchedReviews].sort((a, b) => {
                            const dateA = new Date(a.createdAt);
                            const dateB = new Date(b.createdAt);
                            return dateB - dateA;
                        });
                        setSortedReviews(sorted);
                        if (!fetchedReviews.length) {
                            toast.info("No reviews available yet.");
                        }
                    } else {
                        toast.error("Failed to load reviews: " + (response.message || "Unknown error"));
                    }
                },
                // Handle error response
                error: function (xhr) {
                    console.error("Error fetching reviews:", xhr);
                    let errorMessage = "Error fetching reviews: Server error";
                    try {
                        const response = JSON.parse(xhr.responseText);
                        errorMessage = "Error fetching reviews: " + (response.message || "Server error");
                    } catch (e) {
                        errorMessage = xhr.statusText || "Server error";
                    }
                    toast.error(errorMessage);
                },
                complete: function () {
                    setLoading(false);
                },
            });
        };
        
        fetchReviews();
    }, []);

    // Function to handle writing a review
    const handleWriteReview = () => {
        if (!user) {
          toast.error("Please log in to write a review.");
          navigate('/login');
          return;
        }
      
        // Check if the user is an admin
        // If the user is an admin, show an error message and prevent navigation
        if (user?.role === 'admin') {
          toast.error("Admins cannot write reviews. Please use a regular user account.");
          console.log('Admin attempted to write a review, access denied:', { userRole: user?.role });
          return;
        }
      
        // Only regular users can proceed to the reviews section
        const dashboardPath = '/userDashboard?section=reviews';
        console.log('Navigating to dashboard for writing review:', dashboardPath, { userRole: user?.role });
        navigate(dashboardPath);
      };

    // Define sort options for FilterSortBar
    const sortOptions = [
        { key: "date-desc", label: "Sort by Date (Newest First)", sortFunction: (a, b) => new Date(b.createdAt) - new Date(a.createdAt) },
        { key: "date-asc", label: "Sort by Date (Oldest First)", sortFunction: (a, b) => new Date(a.createdAt) - new Date(b.createdAt) },
        { key: "rating-desc", label: "Sort by Rating (High to Low)", sortFunction: (a, b) => b.rating - a.rating },
        { key: "rating-asc", label: "Sort by Rating (Low to High)", sortFunction: (a, b) => a.rating - b.rating },
    ];

    // Function to handle sorting reviews
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    const currentReviews = sortedReviews.slice(startIndex, endIndex);

    return (
        <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <ToastContainer />
            <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-bold text-purple-400 mb-10 text-center border-b-4 border-gray-700 pb-4">
                    Customer Reviews
                </h2>

                {loading ? (
                    <p className="text-center text-gray-400 text-lg">Loading reviews...</p>
                ) : sortedReviews.length === 0 ? (
                    <div className="bg-gray-800 shadow-md rounded-lg p-6 text-center">
                        <p className="text-yellow-300 text-lg">No reviews available yet.</p>
                        <p className="text-gray-400 mt-2">Be the first to share your experience!</p>
                    </div>
                ) : (
                    <>
                        <FilterSortBar
                            items={sortedReviews}
                            setFilteredItems={setSortedReviews}
                            filterOptions={[]} // No filtering needed
                            sortOptions={sortOptions}
                            defaultSortKey="date-desc"
                        />
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {currentReviews.map(review => (
                                <ReviewCard key={review.id} review={review} isPublicView={true} />
                            ))}
                        </div>
                        <Pagination
                            totalItems={sortedReviews.length}
                            itemsPerPage={reviewsPerPage}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </div>
            <div className="flex justify-center mt-10">
                
                <button
                    onClick={handleWriteReview}
                    className="bg-indigo-700 hover:bg-purple-800 text-gray-300 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                >
                    Write a Review
                </button>
            </div>

            <div>
                <p className="text-sm text-gray-400 mt-4 text-center">
                    <span className="font-bold text-gray-200">Disclaimer:</span> Reviews are based
                    on personal experiences and may not reflect the views of all customers.
                    <br />
                    <span className="font-bold text-gray-200">Note:</span> Reviews are displayed by
                    default in reverse chronological order, but can be sorted using the options above.
                    <br />
                </p>
            </div>
        </div>
    );
}

export default Reviews;