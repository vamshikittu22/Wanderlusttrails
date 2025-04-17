//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx

import React, { useState, useEffect } from "react";
import $ from "jquery";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewData, setReviewData] = useState({
        bookingId: "",
        rating: 0,
        title: "",
        review: "",
    });

    useEffect(() => {
        const fetchData = () => {
            const userId = localStorage.getItem("userId");
            if (!userId) {
                toast.error("Please log in to view your reviews.");
                return;
            }

            // Fetch reviews
            console.log("Fetching reviews for userId:", userId);
            $.ajax({
                url: `http://localhost/WanderlustTrails/backend/config/reviews/getUserReviews.php?user_id=${userId}`,
                type: "GET",
                dataType: "json",
                contentType: "application/json",
                success: function (response) {
                    console.log("Reviews response:", response);
                    if (response.success) {
                        setReviews(response.data || []);
                        if (!response.data.length) {
                            toast.info("No reviews found.");
                        }
                    } else {
                        toast.error("Failed to fetch reviews: " + (response.message || "Unknown error"));
                    }
                },
                error: function (xhr) {
                    console.error("Error fetching reviews:", xhr);
                    let errorMessage = "Error fetching reviews: Server error";
                    try {
                        const response = JSON.parse(xhr.responseText);
                        errorMessage = "Error fetching reviews: " + (response.message || "Server error");
                    } catch (e) {
                        errorMessage = xhr.statusText || `Server error (status: ${xhr.status})`;
                    }
                    toast.error(errorMessage);
                },
            });

            // Fetch bookings
            console.log("Attempting to fetch bookings for userId:", userId);
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
                        if (!unreviewedBookings.length) {
                            toast.info("No unreviewed confirmed bookings available.");
                        } else {
                            console.log("Unreviewed bookings:", unreviewedBookings);
                        }
                    } else {
                        toast.error("Failed to fetch bookings: " + (response.message || "Unknown error"));
                    }
                },
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
                    toast.error(errorMessage);
                    setBookings([]); // Fallback to empty bookings
                },
            });
        };

        fetchData();
    }, []);

    const handleReviewSubmit = e => {
        e.preventDefault();
        const userId = localStorage.getItem("userId");

        if (!userId) {
            toast.error("Please log in to submit a review.");
            return;
        }
        if (!reviewData.bookingId) {
            toast.error("Please select a booking.");
            return;
        }
        if (!reviewData.rating) {
            toast.error("Please select a rating.");
            return;
        }
        if (!reviewData.title || !reviewData.review) {
            toast.error("Title and review are required.");
            return;
        }

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
                    setReviews([
                        ...reviews,
                        {
                            ...reviewData,
                            bookingId: parseInt(reviewData.bookingId),
                            createdAt: new Date().toISOString(),
                            package_name: booking?.package_name || "N/A",
                            booking_type: booking?.booking_type,
                            start_date: booking?.start_date,
                            end_date: booking?.end_date,
                            user_name: localStorage.getItem("userName") || "User",
                        },
                    ]);
                    setBookings(bookings.filter(b => b.id !== parseInt(reviewData.bookingId)));
                    setReviewData({ bookingId: "", rating: 0, title: "", review: "" });
                    setShowReviewForm(false);
                    toast.success("Review submitted successfully!");
                } else {
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
                toast.error(errorMessage);
            },
        });
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setReviewData(prev => ({ ...prev, [name]: value }));
    };

    const handleRatingClick = rating => {
        setReviewData(prev => ({ ...prev, rating }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-900">
            <div className="w-full max-w-3xl p-6 bg-gray-700 text-white rounded-lg shadow-md">
                <ToastContainer />
                <h2 className="text-2xl text-orange-600 font-bold mb-6 text-center">Your Reviews</h2>

                {reviews.length > 0 ? (
                    <div className="mb-6">
                        {reviews.map(review => (
                            <div key={review.id} className="mb-4 p-4 bg-gray-800 rounded-md">
                                <p>
                                    <strong>Rating:</strong> {review.rating}/5
                                </p>
                                <p>
                                    <strong>Title:</strong> {review.title}
                                </p>
                                <p>
                                    <strong>Review:</strong> {review.review}
                                </p>
                                <p>
                                    <strong>Type:</strong>{" "}
                                    {review.booking_type === "flight_hotel" ? "Flight + Hotel" : "Package"}
                                </p>
                                <p>
                                    <strong>Package:</strong> {review.package_name || "N/A"}
                                </p>
                                <p>
                                    <strong>Dates:</strong> {review.start_date} to {review.end_date}
                                </p>
                                <p>
                                    <strong>User:</strong> {localStorage.getItem("userName") || "Unknown User"}
                                </p>
                                <p>
                                    <strong>Reviewed on:</strong>{" "}
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="mb-6 text-center">No reviews yet.</p>
                )}

                <div className="text-center mb-6">
                    <button
                        onClick={() => setShowReviewForm(true)}
                        className="py-2 px-4 rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-700 hover:bg-green-600"
                        disabled={bookings.length === 0}
                    >
                        Add Review
                    </button>
                    {bookings.length === 0 && (
                        <p className="mt-2 text-gray-400">No bookings available to review.</p>
                    )}
                </div>

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
                                            onClick={() => handleRatingClick(star)}
                                            className={`w-6 h-6 cursor-pointer ${
                                                star <= reviewData.rating
                                                    ? "text-yellow-400"
                                                    : "text-gray-400"
                                            }`}
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
                                />
                            </div>

                            <div className="text-center space-x-2">
                                <button
                                    type="submit"
                                    className="py-2 px-4 rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-700 hover:bg-green-600"
                                >
                                    Submit Review
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowReviewForm(false)}
                                    className="py-2 px-4 rounded-lg text-white bg-gray-600 hover:bg-gray-500"
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