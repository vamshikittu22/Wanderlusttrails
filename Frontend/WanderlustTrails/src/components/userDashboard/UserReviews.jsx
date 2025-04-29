import React, { useState, useEffect } from "react";
import $ from "jquery";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";
import ReviewCard from './ReviewCard';
import Pagination from './../Pagination';

const UserReviews = () => {
    // State to manage reviews, bookings, and loading state
    const [reviews, setReviews] = useState([]);
    const [sortedReviews, setSortedReviews] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewData, setReviewData] = useState({
        bookingId: "",
        rating: 0,
        title: "",
        review: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [hasShownNoReviewsToast, setHasShownNoReviewsToast] = useState(false);
    const [hasShownNoBookingsToast, setHasShownNoBookingsToast] = useState(false);
    const [sortOption, setSortOption] = useState("date-desc");
    const [currentPage, setCurrentPage] = useState(1);
    const reviewsPerPage = 5;
    const location = useLocation();

    // Function to fetch reviews and bookings data
    const fetchData = () => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            toast.dismiss();
            toast.error("Please log in to view your reviews.");
            setLoading(false);
            return;
        }

        setLoading(true);

        $.ajax({
            url: `http://localhost/WanderlustTrails/backend/config/reviews/getUserReviews.php?user_id=${userId}`,
            type: "GET",
            dataType: "json",
            contentType: "application/json",
            success: function (response) {
                console.log("Reviews response:", response);
                if (response.success) {
                    const fetchedReviews = response.data || [];
                    setReviews(fetchedReviews);
                    const sorted = [...fetchedReviews].sort((a, b) => {
                        const dateA = new Date(a.createdAt);
                        const dateB = new Date(b.createdAt);
                        return dateB - dateA;
                    });
                    setSortedReviews(sorted);
                    if (!fetchedReviews.length && !hasShownNoReviewsToast) {
                        toast.dismiss();
                        toast.info("No reviews found.");
                        setHasShownNoReviewsToast(true);
                    }
                } else {
                    toast.dismiss();
                    toast.error("Failed to fetch reviews: " + (response.message || "Unknown error"));
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
                    errorMessage = xhr.statusText || `Server error (status: ${xhr.status})`;
                }
                toast.dismiss();
                toast.error(errorMessage);
            },
            //  Fetch bookings after reviews
            complete: function () {
                $.ajax({
                    url: `http://localhost/WanderlustTrails/backend/config/booking/getUserBooking.php?user_id=${userId}`,
                    type: "GET",
                    dataType: "json",
                    contentType: "application/json",
                    success: function (response) {
                        console.log("Bookings response:", response);
                        if (response.success) {
                            const unreviewedBookings = response.data.filter(
                                booking =>
                                    booking.status === "confirmed" &&
                                    !reviews.some(r => r.bookingId === booking.id)
                            );
                            setBookings(unreviewedBookings);
                            if (!unreviewedBookings.length && !hasShownNoBookingsToast) {
                                toast.dismiss();
                                toast.info("No unreviewed confirmed bookings available.");
                                setHasShownNoBookingsToast(true);
                            } else {
                                console.log("Unreviewed bookings:", unreviewedBookings);
                            }
                        } else {
                            toast.dismiss();
                            toast.error("Failed to fetch bookings: " + (response.message || "Unknown error"));
                        }
                    },
                    // Handle error response
                    error: function (xhr) {
                        console.error("Error fetching bookings:", xhr);
                        let errorMessage = "Error fetching bookings: Server error";
                        try {
                            const response = JSON.parse(xhr.responseText);
                            errorMessage = "Error fetching bookings: " + (response.message || "Server error");
                        } catch (e) {
                            errorMessage = xhr.statusText || `Server error (status: ${xhr.status})`;
                        }
                        console.error("Bookings fetch failed with message:", errorMessage);
                        toast.dismiss();
                        toast.error(errorMessage);
                        setBookings([]);
                    },
                    //  Set loading state to false after fetching bookings
                    complete: function () {
                        setLoading(false);
                    },
                });
            },
        });
    };

    // Fetch data on component mount and when the URL search params change
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.get("tab") === "write-review") {
            setShowReviewForm(true);
        }

        fetchData();
    }, [location.search]);

    // Function to handle sorting reviews
    const handleSortChange = (e) => {
        const newSortOption = e.target.value;
        setSortOption(newSortOption);
        setCurrentPage(1);

        const [sortBy, sortOrder] = newSortOption.split("-");
        let sorted = [...reviews];

        if (sortBy === "rating") {
            sorted.sort((a, b) => {
                return sortOrder === "asc" ? a.rating - b.rating : b.rating - a.rating;
            });
        } else if (sortBy === "date") {
            sorted.sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
            });
        }

        setSortedReviews(sorted);
    };

    // Function to handle review submission
    const handleReviewSubmit = e => {
        e.preventDefault();
        const userId = localStorage.getItem("userId");

        if (!userId) {
            toast.dismiss();
            toast.error("Please log in to submit a review.");
            return;
        }
        if (!reviewData.bookingId) {
            toast.dismiss();
            toast.error("Please select a booking.");
            return;
        }
        if (!reviewData.rating) {
            toast.dismiss();
            toast.error("Please select a rating.");
            return;
        }
        if (!reviewData.title || !reviewData.review) {
            toast.dismiss();
            toast.error("Title and review are required.");
            return;
        }

        // Show loading toast
        setSubmitting(true);
        console.log("Submitting review:", { userId, ...reviewData });

        $.ajax({
            url: "http://localhost/WanderlustTrails/backend/config/reviews/writeReview.php",
            type: "POST",
            data: JSON.stringify({ userId, ...reviewData }),
            contentType: "application/json",
            dataType: "json",
            success: function (response) {
                console.log("Submit response:", response);
                if (response.success) {
                    const booking = bookings.find(b => b.id === parseInt(reviewData.bookingId));
                    let flightDetails = {};
                    let hotelDetails = {};

                    try {
                        flightDetails = booking?.flight_details
                            ? typeof booking.flight_details === "string"
                                ? JSON.parse(booking.flight_details)
                                : booking.flight_details
                            : null;
                        hotelDetails = booking?.hotel_details
                            ? typeof booking.hotel_details === "string"
                                ? JSON.parse(booking.hotel_details)
                                : booking.hotel_details
                            : null;
                    } catch (e) {
                        console.error("Error parsing flight_details or hotel_details in new review:", e);
                        flightDetails = null;
                        hotelDetails = null;
                    }

                    const newReview = {
                        id: Date.now(),
                        ...reviewData,
                        bookingId: parseInt(reviewData.bookingId),
                        createdAt: new Date().toISOString(),
                        package_name: booking?.package_name || "N/A",
                        booking_type: booking?.booking_type,
                        start_date: booking?.start_date,
                        end_date: booking?.end_date,
                        flight_details: flightDetails,
                        hotel_details: hotelDetails,
                    };
                    setReviews(prev => [...prev, newReview]);
                    setSortedReviews(prev => {
                        let updatedReviews = [...prev, newReview];
                        const [sortBy, sortOrder] = sortOption.split("-");
                        if (sortBy === "rating") {
                            updatedReviews.sort((a, b) => {
                                return sortOrder === "asc" ? a.rating - b.rating : b.rating - a.rating;
                            });
                        } else if (sortBy === "date") {
                            updatedReviews.sort((a, b) => {
                                const dateA = new Date(a.createdAt);
                                const dateB = new Date(b.createdAt);
                                return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
                            });
                        }
                        return updatedReviews;
                    });
                    setBookings(bookings.filter(b => b.id !== parseInt(reviewData.bookingId)));
                    setReviewData({ bookingId: "", rating: 0, title: "", review: "" });
                    setShowReviewForm(false);
                    setCurrentPage(1);
                    toast.dismiss();
                    toast.success("Review submitted successfully!");
                } else {
                    toast.dismiss();
                    toast.error("Failed to submit review: " + (response.message || "Unknown error"));
                }
            },
            error: function (xhr) {
                console.error("Error submitting review:", xhr);
                let errorMessage = "Error submitting review: Server error";
                try {
                    const response = JSON.parse(xhr.responseText);
                    errorMessage = "Error submitting review: " + (response.message || "Server error");
                } catch (e) {
                    errorMessage = xhr.statusText || `Server error (status: ${xhr.status})`;
                }
                toast.dismiss();
                toast.error(errorMessage);
            },
            complete: function () {
                setSubmitting(false);
            },
        });
    };

    // Function to handle input changes in the review form
    const handleChange = e => {
        const { name, value } = e.target;
        setReviewData(prev => ({ ...prev, [name]: value }));
    };

    // Function to handle rating click in the review form
    const handleRatingClick = rating => {
        setReviewData(prev => ({ ...prev, rating }));
    };

    // Function to handle page change in pagination
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    const currentReviews = sortedReviews.slice(startIndex, endIndex);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-900">
            <div className="w-full max-w-7xl p-6 bg-gray-700 text-white rounded-lg shadow-md">
                <ToastContainer />
                <h2 className="text-2xl text-orange-600 font-bold mb-6 text-center">Your Reviews</h2>
                <div className="flex justify-end mb-4">
                    <select
                        value={sortOption}
                        onChange={handleSortChange}
                        className="py-1 px-3 rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:bg-purple-700 focus:outline-none"
                                    >
                            <option value="date-desc">Sort by Date (Newest First)</option>
                            <option value="date-asc">Sort by Date (Oldest First)</option>
                            <option value="rating-desc">Sort by Rating (High to Low)</option>
                            <option value="rating-asc">Sort by Rating (Low to High)</option>
                    </select>
                </div>

                {loading ? (
                    <p className="mb-6 text-center text-gray-400">Loading reviews...</p>
                ) : (
                    <>
                        {reviews.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                
                                {currentReviews.map(review => (
                                    <ReviewCard key={review.id} review={review} isPublicView={false} />
                                ))}
                               
                            </div>
                        ) : (
                            <p className="mb-6 text-center text-gray-400">No reviews yet.</p>
                        )}

                         <Pagination
                                    totalItems={sortedReviews.length}
                                    itemsPerPage={reviewsPerPage}
                                    currentPage={currentPage}
                                    onPageChange={setCurrentPage}
                            />

                            <br />

                        <div className="text-center mb-6">
                            <button
                                onClick={() => setShowReviewForm(true)}
                                className="py-2 px-4 rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-700 hover:bg-green-600 disabled:opacity-50"
                                disabled={bookings.length === 0 || submitting}
                            >
                                Add Review
                            </button>
                            {bookings.length === 0 && (
                                <p className="mt-2 text-gray-400">No bookings available to review.</p>
                            )}
                        </div>
                    </>
                )}

                {showReviewForm && (
                    <div className="mb-6 p-4 bg-gray-900 rounded-md">
                        <h3 className="text-lg text-orange-600 font-bold mb-4 text-center">
                            Write a Review
                        </h3>
                        <form onSubmit={handleReviewSubmit} noValidate>
                            <div className="mb-4">
                                <label
                                    htmlFor="bookingId"
                                    className="block text-sm text-sky-300 font-bold mb-2"
                                >
                                    Select Booking
                                </label>
                                <select
                                    id="bookingId"
                                    name="bookingId"
                                    value={reviewData.bookingId}
                                    onChange={handleChange}
                                    className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    disabled={submitting}
                                >
                                    <option value="">Select a booking</option>
                                    {bookings.map(booking => (
                                        <option key={booking.id} value={booking.id}>
                                            {booking.booking_type === "flight_hotel"
                                                ? `Flight + Hotel - ${booking.start_date}`
                                                : `${booking.package_name || "Package"} - ${booking.start_date}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm text-sky-300 font-bold mb-2">
                                    Rating
                                </label>
                                <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <svg
                                            key={star}
                                            onClick={() => !submitting && handleRatingClick(star)}
                                            className={`w-6 h-6 cursor-pointer ${
                                                star <= reviewData.rating
                                                    ? "text-yellow-400"
                                                    : "text-gray-400"
                                            } ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label
                                    htmlFor="title"
                                    className="block text-sm text-sky-300 font-bold mb-2"
                                >
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    placeholder="Review Title"
                                    value={reviewData.title}
                                    onChange={handleChange}
                                    className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    disabled={submitting}
                                />
                            </div>

                            <div className="mb-4">
                                <label
                                    htmlFor="review"
                                    className="block text-sm text-sky-300 font-bold mb-2"
                                >
                                    Review
                                </label>
                                <textarea
                                    id="review"
                                    name="review"
                                    placeholder="Write your review here..."
                                    value={reviewData.review}
                                    onChange={handleChange}
                                    className="mt-1 p-2 block w-full bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    rows="4"
                                    disabled={submitting}
                                />
                            </div>

                            <div className="text-center space-x-2">
                                <button
                                    type="submit"
                                    className="py-2 px-4 rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-700 hover:bg-green-600 disabled:opacity-50"
                                    disabled={submitting}
                                >
                                    {submitting ? "Submitting..." : "Submit Review"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowReviewForm(false)}
                                    className="py-2 px-4 rounded-lg text-white bg-gray-600 hover:bg-gray-500 disabled:opacity-50"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserReviews;