import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import $ from "jquery";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from '../context/UserContext';
import Pagination from '../components/Pagination';
import FilterSortBar from '../components/FilterSortBar';

function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [sortedReviews, setSortedReviews] = useState([]);
    const [comments, setComments] = useState({}); // { reviewId: [comments] }
    const [newComment, setNewComment] = useState({}); // { reviewId: commentText }
    const [replyComment, setReplyComment] = useState({}); // { commentId: replyText }
    const [showReplyInput, setShowReplyInput] = useState(null); // Track which comment is being replied to
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const reviewsPerPage = 5;
    const navigate = useNavigate();
    const { user } = useUser();

    // Fetch reviews and comments
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
                        const sorted = [...fetchedReviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        setSortedReviews(sorted);
                        if (!fetchedReviews.length) {
                            toast.info("No reviews available yet.");
                        }
                        // Fetch comments for each review
                        fetchedReviews.forEach(review => fetchComments(review.id));
                    } else {
                        toast.error("Failed to load reviews: " + (response.message || "Unknown error"));
                    }
                },
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

        const fetchComments = (reviewId) => {
            $.ajax({
                url: `http://localhost/WanderlustTrails/backend/config/reviews/getComments.php?reviewId=${reviewId}`,
                type: "GET",
                dataType: "json",
                contentType: "application/json",
                success: function (response) {
                    if (response.success) {
                        setComments(prev => ({ ...prev, [reviewId]: response.data || [] }));
                    } else {
                        console.error(`Failed to fetch comments for review ${reviewId}:`, response.message);
                    }
                },
                error: function (xhr) {
                    console.error(`Error fetching comments for review ${reviewId}:`, xhr);
                },
            });
        };

        fetchReviews();
    }, []);

    const handleWriteReview = () => {
        if (!user) {
            toast.error("Please log in to write a review.");
            navigate('/login');
            return;
        }
        if (user?.role === 'admin') {
            toast.error("Admins cannot write reviews. Please use a regular user account.");
            console.log('Admin attempted to write a review, access denied:', { userRole: user?.role });
            return;
        }
        const dashboardPath = '/userDashboard?section=reviews';
        console.log('Navigating to dashboard for writing review:', dashboardPath, { userRole: user?.role });
        navigate(dashboardPath);
    };

    const handleCommentSubmit = (reviewId) => {
        if (!user) {
            toast.error("Please log in to comment.");
            navigate('/login');
            return;
        }
        if (user?.role === 'admin') {
            toast.error("Admins cannot comment on reviews.");
            console.log('Admin attempted to comment, access denied:', { userRole: user?.role });
            return;
        }
        if (!newComment[reviewId]?.trim()) {
            toast.error("Comment cannot be empty.");
            return;
        }

        const userId = user.id;
        $.ajax({
            url: "http://localhost/WanderlustTrails/backend/config/reviews/addComment.php",
            type: "POST",
            data: JSON.stringify({ userId, reviewId, comment: newComment[reviewId] }),
            contentType: "application/json",
            dataType: "json",
            success: function (response) {
                if (response.success) {
                    setComments(prev => ({
                        ...prev,
                        [reviewId]: [...(prev[reviewId] || []), response.comment],
                    }));
                    setNewComment(prev => ({ ...prev, [reviewId]: "" }));
                    toast.success("Comment added successfully!");
                } else {
                    toast.error("Failed to add comment: " + (response.message || "Unknown error"));
                }
            },
            error: function (xhr) {
                console.error("Error adding comment:", xhr);
                let errorMessage = "Error adding comment: Server error";
                try {
                    const response = JSON.parse(xhr.responseText);
                    errorMessage = "Error adding comment: " + (response.message || "Server error");
                } catch (e) {
                    errorMessage = xhr.statusText || "Server error";
                }
                toast.error(errorMessage);
            },
        });
    };

    const handleReplySubmit = (reviewId, commentId) => {
        if (!user) {
            toast.error("Please log in to reply.");
            navigate('/login');
            return;
        }
        if (user?.role === 'admin') {
            toast.error("Admins cannot reply to comments.");
            console.log('Admin attempted to reply, access denied:', { userRole: user?.role });
            return;
        }
        if (!replyComment[commentId]?.trim()) {
            toast.error("Reply cannot be empty.");
            return;
        }

        const userId = user.id;
        $.ajax({
            url: "http://localhost/WanderlustTrails/backend/config/reviews/addComment.php",
            type: "POST",
            data: JSON.stringify({ userId, reviewId, comment: replyComment[commentId], parentId: commentId }),
            contentType: "application/json",
            dataType: "json",
            success: function (response) {
                if (response.success) {
                    setComments(prev => {
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
                    setReplyComment(prev => ({ ...prev, [commentId]: "" }));
                    setShowReplyInput(null);
                    toast.success("Reply added successfully!");
                } else {
                    toast.error("Failed to add reply: " + (response.message || "Unknown error"));
                }
            },
            error: function (xhr) {
                console.error("Error adding reply:", xhr);
                let errorMessage = "Error adding reply: Server error";
                try {
                    const response = JSON.parse(xhr.responseText);
                    errorMessage = "Error adding reply: " + (response.message || "Server error");
                } catch (e) {
                    errorMessage = xhr.statusText || "Server error";
                }
                toast.error(errorMessage);
            },
        });
    };

    const sortOptions = [
        { key: "date-desc", label: "Sort by Date (Newest First)", sortFunction: (a, b) => new Date(b.createdAt) - new Date(a.createdAt) },
        { key: "date-asc", label: "Sort by Date (Oldest First)", sortFunction: (a, b) => new Date(a.createdAt) - new Date(b.createdAt) },
        { key: "rating-desc", label: "Sort by Rating (High to Low)", sortFunction: (a, b) => b.rating - a.rating },
        { key: "rating-asc", label: "Sort by Rating (Low to High)", sortFunction: (a, b) => a.rating - b.rating },
    ];

    const startIndex = (currentPage - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    const currentReviews = sortedReviews.slice(startIndex, endIndex);

    // Helper to get initials for avatar
    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    // Recursive component to render comments and replies
    const RenderComment = ({ comment, reviewId, level = 0 }) => {
        const isReviewOwner = reviews.find(r => r.id === reviewId)?.userId === user?.id;
        return (
            <div className={`flex space-x-3 ${level > 0 ? 'ml-10 mt-2' : 'mt-4'}`}>
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                        {getInitials(comment.firstName, comment.lastName)}
                    </div>
                </div>
                {/* Comment Content */}
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
                    {/* Reply Button (only for review owner, and not for admins) */}
                    {isReviewOwner && user?.role !== 'admin' && (
                        <button
                            onClick={() => setShowReplyInput(comment.id)}
                            className="text-sm text-indigo-400 hover:text-indigo-300 mt-1"
                        >
                            Reply
                        </button>
                    )}
                    {/* Reply Input (only for review owner, and not for admins) */}
                    {showReplyInput === comment.id && user?.role !== 'admin' && (
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
                    {/* Nested Replies */}
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
        <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <ToastContainer />
            <div className="max-w-4xl mx-auto">
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
                            filterOptions={[]}
                            sortOptions={sortOptions}
                            defaultSortKey="date-desc"
                        />
                        <div className="space-y-8">
                            {currentReviews.map(review => {
                                const userName = `${review.firstName} ${review.lastName}`;
                                let flightDetails = {};
                                let hotelDetails = {};
                                try {
                                    flightDetails = typeof review.flight_details === "string"
                                        ? JSON.parse(review.flight_details || "{}")
                                        : review.flight_details || {};
                                    hotelDetails = typeof review.hotel_details === "string"
                                        ? JSON.parse(review.hotel_details || "{}")
                                        : review.hotel_details || {};
                                } catch (e) {
                                    console.error("Error parsing flight_details or hotel_details:", e);
                                    flightDetails = {};
                                    hotelDetails = {};
                                }

                                return (
                                    <div key={review.id} className="bg-gray-800 rounded-lg p-6 shadow-md">
                                        {/* Review Header */}
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                                                {getInitials(review.firstName, review.lastName)}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-green-600">{review.title}</h3>
                                                <p className="text-sm text-gray-200">
                                                    <span className="font-bold">{userName}</span> |{" "}
                                                    <span className="text-blue-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                </p>
                                            </div>
                                            <div className="ml-auto">
                                                <span className="text-yellow-500 text-xl font-medium">{review.rating}/5</span>
                                            </div>
                                        </div>
                                        {/* Review Content */}
                                        <p className="text-gray-300 mt-4 leading-relaxed">{review.review}</p>
                                        {/* Review Details */}
                                        <div className="border-t border-gray-700 pt-4 mt-4">
                                            <p className="text-sm text-red-700 font-medium">
                                                {review.booking_type === "package" || review.booking_type === "flight_hotel"
                                                    ? review.package_name || "Flight + Hotel"
                                                    : "N/A"}
                                            </p>
                                            <p className="text-sm text-orange-400">
                                                <span className="font-medium text-gray-200">Dates:</span>{" "}
                                                {review.start_date} to {review.end_date}
                                            </p>
                                            {flightDetails.from && flightDetails.to && (
                                                <p className="text-sm text-orange-400">
                                                    <span className="font-medium text-gray-200">Flight:</span>{" "}
                                                    {flightDetails.from} to {flightDetails.to}
                                                </p>
                                            )}
                                            {flightDetails.destination && (
                                                <p className="text-sm text-orange-400">
                                                    <span className="font-medium text-gray-200">Hotel Destination:</span>{" "}
                                                    {flightDetails.destination}
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-400 mt-2">
                                                <span className="font-medium text-gray-200">Review ID:</span> {review.id}
                                            </p>
                                        </div>
                                        {/* Comments Panel */}
                                        <div className="mt-6">
                                            <h4 className="text-lg font-semibold text-gray-200 mb-4">Comments</h4>
                                            {(comments[review.id] || []).map(comment => (
                                                <RenderComment
                                                    key={comment.id}
                                                    comment={comment}
                                                    reviewId={review.id}
                                                />
                                            ))}
                                            {/* Comment Form (only for non-admins) */}
                                            {user?.role !== 'admin' ? (
                                                <div className="mt-6">
                                                    <div className="flex space-x-3">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                                                            {getInitials(user?.firstName, user?.lastName)}
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
                                            ) : (
                                                <p className="mt-4 text-gray-400">Admins cannot comment on reviews.</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
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