import { useState, useEffect } from "react"; // Import React hooks and core functionality
import { useNavigate } from "react-router-dom"; // Import routing utility
import $ from "jquery"; // Import jQuery for AJAX requests
import { ToastContainer, toast } from "react-toastify"; // Import toast notification library
import "react-toastify/dist/ReactToastify.css"; // Import toast CSS
import { useUser } from '../context/UserContext'; // Import User context for authentication
import Pagination from '../components/Pagination'; // Import pagination component
import FilterSortBar from '../components/FilterSortBar'; // Import filter and sort component

function Reviews() {
    // State to hold the list of reviews
    const [reviews, setReviews] = useState([]);
    // State to hold sorted reviews for display
    const [sortedReviews, setSortedReviews] = useState([]);
    // State to hold comments for each review, structured as { reviewId: [comments] }
    const [comments, setComments] = useState({});
    // State to hold new comment text for each review, structured as { reviewId: commentText }
    const [newComment, setNewComment] = useState({});
    // State to hold reply text for each comment, structured as { commentId: replyText }
    const [replyComment, setReplyComment] = useState({});
    // State to track which comment is being replied to
    const [showReplyInput, setShowReplyInput] = useState(null);
    // State to indicate if data is being loaded
    const [loading, setLoading] = useState(true);
    // State to track the current page number for pagination
    const [currentPage, setCurrentPage] = useState(1);
    // Constant defining the number of reviews per page
    const reviewsPerPage = 5;
    // Navigation function from react-router-dom
    const navigate = useNavigate();
    // Destructure user data from User context
    const { user } = useUser();

    // Effect hook to fetch reviews and comments when component mounts
    useEffect(() => {
        // Function to fetch all reviews from the backend
        const fetchReviews = () => {
            console.log("Fetching all reviews");
            $.ajax({
                url: "http://localhost/WanderlustTrails/backend/config/reviews/getAllReviews.php", // Backend endpoint
                type: "GET", // HTTP method
                dataType: "json", // Expected response type
                contentType: "application/json", // Request content type
                success: function (response) {
                    console.log("All reviews response:", response); // Log response
                    if (response.success) {
                        const fetchedReviews = response.data || []; // Extract reviews data
                        setReviews(fetchedReviews); // Update reviews state
                        const sorted = [...fetchedReviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by date descending
                        setSortedReviews(sorted); // Update sorted reviews state
                        if (!fetchedReviews.length) {
                            toast.info("No reviews available yet."); // Notify if no reviews
                        }
                        // Fetch comments for each review
                        fetchedReviews.forEach(review => fetchComments(review.id));
                    } else {
                        toast.error("Failed to load reviews: " + (response.message || "Unknown error")); // Notify on failure
                    }
                },
                error: function (xhr) {
                    console.error("Error fetching reviews:", xhr); // Log error
                    let errorMessage = "Error fetching reviews: Server error"; // Default error message
                    try {
                        const response = JSON.parse(xhr.responseText); // Attempt to parse response
                        errorMessage = "Error fetching reviews: " + (response.message || "Server error"); // Update with response error
                    } catch (e) {
                        errorMessage = xhr.statusText || "Server error"; // Fallback to status text
                    }
                    toast.error(errorMessage); // Notify user
                },
                complete: function () {
                    setLoading(false); // Stop loading indicator
                },
            });
        };

        // Function to fetch comments for a specific review
        const fetchComments = (reviewId) => {
            $.ajax({
                url: `http://localhost/WanderlustTrails/backend/config/reviews/getComments.php?reviewId=${reviewId}`, // Backend endpoint with reviewId
                type: "GET", // HTTP method
                dataType: "json", // Expected response type
                contentType: "application/json", // Request content type
                success: function (response) {
                    if (response.success) {
                        setComments(prev => ({ ...prev, [reviewId]: response.data || [] })); // Update comments state
                    } else {
                        console.error(`Failed to fetch comments for review ${reviewId}:`, response.message); // Log failure
                    }
                },
                error: function (xhr) {
                    console.error(`Error fetching comments for review ${reviewId}:`, xhr); // Log error
                },
            });
        };

        fetchReviews(); // Execute reviews fetch
    }, []); // Empty dependency array for mount-only effect

    // Function to navigate to write review section
    const handleWriteReview = () => {
        if (!user) {
            toast.error("Please log in to write a review."); // Notify if not logged in
            navigate('/login'); // Redirect to login
            return;
        }
        const dashboardPath = '/userDashboard?section=reviews'; // Path for writing review
        console.log('Navigating to dashboard for writing review:', dashboardPath, { userRole: user?.role }); // Log navigation
        navigate(dashboardPath); // Navigate to dashboard
    };

    // Function to handle submission of a new comment
    const handleCommentSubmit = (reviewId) => {
        if (!user) {
            toast.error("Please log in to comment."); // Notify if not logged in
            navigate('/login'); // Redirect to login
            return;
        }
        if (!newComment[reviewId]?.trim()) {
            toast.error("Comment cannot be empty."); // Notify if comment is empty
            return;
        }

        const userId = user.id; // User's ID from context
        $.ajax({
            url: "http://localhost/WanderlustTrails/backend/config/reviews/addComment.php", // Backend endpoint
            type: "POST", // HTTP method
            data: JSON.stringify({ userId, reviewId, comment: newComment[reviewId] }), // Send comment data
            contentType: "application/json", // Request content type
            dataType: "json", // Expected response type
            success: function (response) {
                if (response.success) {
                    setComments(prev => ({ // Update comments state with new comment
                        ...prev,
                        [reviewId]: [...(prev[reviewId] || []), response.comment],
                    }));
                    setNewComment(prev => ({ ...prev, [reviewId]: "" })); // Clear input
                    toast.success("Comment added successfully!"); // Notify success
                } else {
                    toast.error("Failed to add comment: " + (response.message || "Unknown error")); // Notify failure
                }
            },
            error: function (xhr) {
                console.error("Error adding comment:", xhr); // Log error
                let errorMessage = "Error adding comment: Server error"; // Default error message
                try {
                    const response = JSON.parse(xhr.responseText); // Attempt to parse response
                    errorMessage = "Error adding comment: " + (response.message || "Server error"); // Update with response error
                } catch (e) {
                    errorMessage = xhr.statusText || "Server error"; // Fallback to status text
                }
                toast.error(errorMessage); // Notify user
            },
        });
    };

    // Function to handle submission of a reply to a comment
    const handleReplySubmit = (reviewId, commentId) => {
        if (!user) {
            toast.error("Please log in to reply."); // Notify if not logged in
            navigate('/login'); // Redirect to login
            return;
        }
        if (!replyComment[commentId]?.trim()) {
            toast.error("Reply cannot be empty."); // Notify if reply is empty
            return;
        }

        const userId = user.id; // User's ID from context
        $.ajax({
            url: "http://localhost/WanderlustTrails/backend/config/reviews/addComment.php", // Backend endpoint
            type: "POST", // HTTP method
            data: JSON.stringify({ userId, reviewId, comment: replyComment[commentId], parentId: commentId }), // Send reply data
            contentType: "application/json", // Request content type
            dataType: "json", // Expected response type
            success: function (response) {
                if (response.success) {
                    setComments(prev => { // Update comments state with new reply
                        const updatedComments = { ...prev };
                        const reviewComments = updatedComments[reviewId].map(comment => {
                            if (comment.id === commentId) {
                                return { ...comment, replies: [...(comment.replies || []), response.comment] };
                            }
                            return comment;
                        });
                        updatedComments[reviewId] = reviewComments;
                        return updatedComments;
                    });
                    setReplyComment(prev => ({ ...prev, [commentId]: "" })); // Clear input
                    setShowReplyInput(null); // Hide reply input
                    toast.success("Reply added successfully!"); // Notify success
                } else {
                    toast.error("Failed to add reply: " + (response.message || "Unknown error")); // Notify failure
                }
            },
            error: function (xhr) {
                console.error("Error adding reply:", xhr); // Log error
                let errorMessage = "Error adding reply: Server error"; // Default error message
                try {
                    const response = JSON.parse(xhr.responseText); // Attempt to parse response
                    errorMessage = "Error adding reply: " + (response.message || "Server error"); // Update with response error
                } catch (e) {
                    errorMessage = xhr.statusText || "Server error"; // Fallback to status text
                }
                toast.error(errorMessage); // Notify user
            },
        });
    };

    // Array of sort options for the FilterSortBar
    const sortOptions = [
        { key: "date-desc", label: "Sort by Date (Newest First)", sortFunction: (a, b) => new Date(b.createdAt) - new Date(a.createdAt) },
        { key: "date-asc", label: "Sort by Date (Oldest First)", sortFunction: (a, b) => new Date(a.createdAt) - new Date(b.createdAt) },
        { key: "rating-desc", label: "Sort by Rating (High to Low)", sortFunction: (a, b) => b.rating - a.rating },
        { key: "rating-asc", label: "Sort by Rating (Low to High)", sortFunction: (a, b) => a.rating - b.rating },
    ];

    // Calculate the start index for the current page
    const startIndex = (currentPage - 1) * reviewsPerPage;
    // Calculate the end index for the current page
    const endIndex = startIndex + reviewsPerPage;
    // Slice the sorted reviews to display the current page's reviews
    const currentReviews = sortedReviews.slice(startIndex, endIndex);

    // Function to get initials for avatar from first and last names
    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    // Recursive component to render comments and their replies
    const RenderComment = ({ comment, reviewId, level = 0 }) => {
        // Check if the current user is the review owner
        const isReviewOwner = reviews.find(r => r.id === reviewId)?.userId === user?.id;
        return (
            <div className={`flex space-x-3 ${level > 0 ? 'ml-10 mt-2' : 'mt-4'}`}>
                {/* Avatar for the commenter */}
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                        {getInitials(comment.firstName, comment.lastName)}
                    </div>
                </div>
                {/* Comment content and reply section */}
                <div className="flex-1">
                    <div className="bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-200">
                                {comment.firstName} {comment.lastName}
                            </p>
                            <p className="text-xs text-gray-400">
                                {new Date(comment.created_at).toLocaleString()}
                            </p>
                        </div>
                        <p className="text-gray-300 mt-1">{comment.comment}</p>
                    </div>
                    {/* Reply button (available for all users, including admins) */}
                    <button
                        onClick={() => setShowReplyInput(comment.id)}
                        className="text-sm text-indigo-400 hover:text-indigo-300 mt-1"
                    >
                        Reply
                    </button>
                    {/* Reply input (available for all users, including admins) */}
                    {showReplyInput === comment.id && (
                        <div className="mt-2">
                            <textarea
                                value={replyComment[comment.id] || ""}
                                onChange={(e) => setReplyComment(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                placeholder="Write your reply..."
                                className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                rows="2"
                            />
                            <div className="flex space-x-2 mt-1">
                                <button
                                    onClick={() => handleReplySubmit(reviewId, comment.id)}
                                    className="py-1 px-3 rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none"
                                >
                                    Submit Reply
                                </button>
                                <button
                                    onClick={() => {
                                        setShowReplyInput(null);
                                        setReplyComment(prev => ({ ...prev, [comment.id]: "" }));
                                    }}
                                    className="py-1 px-3 rounded-lg text-white bg-gray-600 hover:bg-gray-500 focus:outline-none"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                    {/* Nested replies */}
                    {comment.replies?.length > 0 && (
                        <div className="mt-2">
                            {comment.replies.map(reply => (
                                <RenderComment
                                    key={reply.id}
                                    comment={reply}
                                    reviewId={reviewId}
                                    level={level + 1}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8"> {/* Main container with full height and padding */}
            <ToastContainer /> {/* Container for toast notifications */}
            <div className="max-w-4xl mx-auto"> {/* Centered content with max width */}
                <h2 className="text-4xl font-bold text-purple-400 mb-10 text-center border-b-4 border-gray-700 pb-4">
                    Customer Reviews
                </h2> {/* Reviews heading */}

                {loading ? (
                    <p className="text-center text-gray-400 text-lg">Loading reviews...</p> 
                ) : sortedReviews.length === 0 ? (
                    <div className="bg-gray-800 shadow-md rounded-lg p-6 text-center"> {/* No reviews message */}
                        <p className="text-yellow-300 text-lg">No reviews available yet.</p>
                        <p className="text-gray-400 mt-2">Be the first to share your experience!</p>
                    </div>
                ) : (
                    <>
                        <FilterSortBar
                            items={sortedReviews}
                            setFilteredItems={setSortedReviews}
                            filterOptions={[]}
                            sortOptions={sortOptions}
                            defaultSortKey="date-desc"
                        /> {/* Filter and sort bar */}
                        <div className="space-y-8"> {/* Container for review cards */}
                            {currentReviews.map(review => {
                                const userName = `${review.firstName} ${review.lastName}`; // Full name of reviewer
                                let flightDetails = {}; // Object to hold parsed flight details
                                let hotelDetails = {}; // Object to hold parsed hotel details
                                try {
                                    flightDetails = typeof review.flight_details === "string"
                                        ? JSON.parse(review.flight_details || "{}")
                                        : review.flight_details || {};
                                    hotelDetails = typeof review.hotel_details === "string"
                                        ? JSON.parse(review.hotel_details || "{}")
                                        : review.hotel_details || {};
                                } catch (e) {
                                    console.error("Error parsing flight_details or hotel_details:", e); // Log parsing error
                                    flightDetails = {};
                                    hotelDetails = {};
                                }

                                return (
                                    <div key={review.id} className="bg-gray-800 rounded-lg p-6 shadow-md"> {/* Review card */}
                                        {/* Review Header */}
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                                                {getInitials(review.firstName, review.lastName)} {/* Reviewer initials */}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-green-600">{review.title}</h3> {/* Review title */}
                                                <p className="text-sm text-gray-200">
                                                    <span className="font-bold">{userName}</span> |{" "}
                                                    <span className="text-blue-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                </p> {/* Reviewer name and date */}
                                            </div>
                                            <div className="ml-auto">
                                                <span className="text-yellow-500 text-xl font-medium">{review.rating}/5</span> {/* Review rating */}
                                            </div>
                                        </div>
                                        {/* Review Content */}
                                        <p className="text-gray-300 mt-4 leading-relaxed">{review.review}</p> {/* Review text */}
                                        {/* Review Details */}
                                        <div className="border-t border-gray-700 pt-4 mt-4">
                                            <p className="text-sm text-red-700 font-medium">
                                                {review.booking_type || "Unknown Type"} {/* Booking type */}
                                            </p>
                                            {review.booking_type === "flight_hotel" && flightDetails.from && flightDetails.to ? (
                                                <p className="text-sm text-orange-400">
                                                    <span className="font-medium text-gray-200">Flight:</span>{" "}
                                                    {flightDetails.from} to {flightDetails.to}
                                                </p>
                                            ) : (
                                                <>
                                                    <p className="text-sm text-orange-400">
                                                        <span className="font-medium text-gray-200">Dates:</span>{" "}
                                                        {review.start_date} to {review.end_date}
                                                    </p>
                                                    <p className="text-sm text-orange-400">
                                                        <span className="font-medium text-gray-200">Package:</span>{" "}
                                                        {review.package_name || "N/A"}
                                                    </p>
                                                </>
                                            )}
                                            <p className="text-sm text-gray-400 mt-2">
                                                <span className="font-medium text-gray-200">Review ID:</span> {review.id}
                                            </p> {/* Review ID */}
                                        </div>
                                        {/* Comments Panel */}
                                        <div className="mt-6">
                                            <h4 className="text-lg font-semibold text-gray-200 mb-4">Comments</h4> {/* Comments section heading */}
                                            {(comments[review.id] || []).map(comment => (
                                                <RenderComment
                                                    key={comment.id}
                                                    comment={comment}
                                                    reviewId={review.id}
                                                /> 
                                            ))}
                                            {/* Comment Form (available for all users, including admins) */}
                                            <div className="mt-6">
                                                <div className="flex space-x-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                                                        {getInitials(user?.firstName, user?.lastName)} {/* User initials */}
                                                    </div>
                                                    <textarea
                                                        value={newComment[review.id] || ""}
                                                        onChange={(e) => setNewComment(prev => ({ ...prev, [review.id]: e.target.value }))}
                                                        placeholder="Add a comment..."
                                                        className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        rows="2"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleCommentSubmit(review.id)}
                                                    className="mt-2 ml-14 py-1 px-3 rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none"
                                                >
                                                    Submit Comment
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <Pagination
                            totalItems={sortedReviews.length} // Total number of reviews
                            itemsPerPage={reviewsPerPage} // Number of reviews per page
                            currentPage={currentPage} // Current page number
                            onPageChange={setCurrentPage} // Callback to change page
                        /> {/* Pagination component */}
                    </>
                )}
            </div>
            <div className="flex justify-center mt-10"> {/* Write review button container */}
                <button
                    onClick={handleWriteReview}
                    className="bg-indigo-700 hover:bg-purple-800 text-gray-300 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                >
                    Write a Review
                </button>
            </div>
            <div> {/* Disclaimer section */}
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

export default Reviews; // Export the Reviews component