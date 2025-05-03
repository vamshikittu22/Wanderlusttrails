import React, { useState, useEffect } from "react";
import $ from "jquery";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navigate, useLocation } from "react-router-dom";
import Pagination from './../Pagination';
import ReviewForm from './../forms/ReviewForm';

//user reviews component
const UserReviews = () => {
    const [reviews, setReviews] = useState([]); // State to hold reviews
    const [sortedReviews, setSortedReviews] = useState([]); // State to hold sorted reviews
    const [bookings, setBookings] = useState([]); // State to hold bookings
    const [showAddReviewForm, setShowAddReviewForm] = useState(false); // State to control visibility of the add review form
    const [editReviewId, setEditReviewId] = useState(null); // State to hold the ID of the review being edited
    const [reviewData, setReviewData] = useState({ 
        bookingId: "",
        rating: 0,
        title: "",
        review: "",
    }); // State to hold review data
    const [submitting, setSubmitting] = useState(false); // State to control the submission state of the form
    const [loading, setLoading] = useState(true); // State to control loading state
    const [hasShownNoReviewsToast, setHasShownNoReviewsToast] = useState(false); // State to control the toast notification for no reviews 
    const [sortOption, setSortOption] = useState("date-desc"); // State to hold the selected sort option
    const [currentPage, setCurrentPage] = useState(1); // State to hold the current page for pagination
    const reviewsPerPage = 5; // Number of reviews to display per page
    const location = useLocation(); // Hook to get the current location

    const fetchData = () => {
        const userId = localStorage.getItem("userId"); // Get user ID from local storage
        if (!userId) {
            toast.dismiss();
            toast.error("Please log in to view your reviews.");
            Navigate("/login"); // Redirect to login if user ID is not found
            setLoading(false);
            return;
        }
    
        setLoading(true); 
    
        $.ajax({ // Fetch reviews from the server
            url: `http://localhost/WanderlustTrails/backend/config/reviews/getUserReviews.php?user_id=${userId}`,
            type: "GET",
            dataType: "json",
            contentType: "application/json",
            success: function (response) {
                console.log("Reviews response:", response);
                if (response.success) {
                    const fetchedReviews = (response.data || []).map((review) => ({
                        ...review,
                        bookingId: parseInt(review.bookingId),
                    }));
                    setReviews(fetchedReviews); // Set fetched reviews to state
                    const sorted = [...fetchedReviews].sort((a, b) => {
                        const dateA = new Date(a.createdAt);
                        const dateB = new Date(b.createdAt);
                        return dateB - dateA;
                    });
                    setSortedReviews(sorted); // Set sorted reviews to state
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
            error: function (xhr) { // Handle error in fetching reviews
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
            complete: function () { // Fetch bookings after fetching reviews
                $.ajax({
                    url: `http://localhost/WanderlustTrails/backend/config/booking/getUserBooking.php?user_id=${userId}`,
                    type: "GET",
                    dataType: "json",
                    contentType: "application/json",
                    success: function (response) {
                        console.log("Bookings response:", response);
                        if (response.success) {
                            const normalizedBookings = response.data.map((booking) => ({
                                ...booking,
                                id: parseInt(booking.id), // Normalize booking.id to number
                            })); // Normalize booking IDs to numbers
                            const unreviewedBookings = normalizedBookings.filter(
                                (booking) =>
                                    booking.status === "confirmed" &&
                                    !reviews.some((r) => {
                                        console.log(`Comparing review.bookingId (${r.bookingId}, type: ${typeof r.bookingId}) with booking.id (${booking.id}, type: ${typeof booking.id})`);
                                        return r.bookingId === booking.id;
                                    })
                            ); // Filter unreviewed bookings
                            console.log("Filtered unreviewed bookings:", unreviewedBookings);
                            setBookings(unreviewedBookings); // Set unreviewed bookings to state
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
                    error: function (xhr) { // Handle error in fetching bookings
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
                    complete: function () { // Set loading to false after fetching bookings
                        setLoading(false);
                    },
                });
            },
        });
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search); // Get query parameters from the URL
        if (queryParams.get("tab") === "write-review") {
            setShowAddReviewForm(true);
        }

        fetchData();
    }, [location.search]); // Fetch data when the component mounts or when the location changes

    // Handle sort option change
    const handleSortChange = (e) => {
        const newSortOption = e.target.value;
        setSortOption(newSortOption); // Update sort option state
        setCurrentPage(1);

        const [sortBy, sortOrder] = newSortOption.split("-"); // Split sort option into sortBy and sortOrder
        let sorted = [...reviews]; // Create a copy of reviews for sorting

        // Sort reviews based on selected option
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

        setSortedReviews(sorted); // Update sorted reviews state
    };

    // Handle review submission
    const handleReviewSubmit = (e) => {
        e.preventDefault();
        const userId = localStorage.getItem("userId");

        // Validate review data
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

        setSubmitting(true);
        console.log("Submitting review:", { userId, ...reviewData }); // Log review data for debugging

        $.ajax({ // Submit review to the server
            url: "http://localhost/WanderlustTrails/backend/config/reviews/writeReview.php",
            type: "POST",
            data: JSON.stringify({ userId, ...reviewData }),
            contentType: "application/json",
            dataType: "json",
            success: function (response) {
                console.log("Submit response:", response);
                if (response.success) {
                    const booking = bookings.find((b) => b.id === parseInt(reviewData.bookingId)); // Find the booking related to the review
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
                        package_name: booking?.booking_type === "itinerary" 
                            ? booking?.package_name || "Custom Itinerary" 
                            : booking?.package_name || (booking?.booking_type === "flight_hotel" ? "Flight + Hotel" : "N/A"),
                        booking_type: booking?.booking_type,
                        start_date: booking?.start_date,
                        end_date: booking?.end_date,
                        flight_details: flightDetails,
                        hotel_details: hotelDetails,
                    }; // Create new review object
                    setReviews((prev) => [...prev, newReview]); // Add new review to the state
                    setSortedReviews((prev) => {
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
                    setBookings((prev) => prev.filter((b) => b.id !== parseInt(reviewData.bookingId)));
                    setReviewData({ bookingId: "", rating: 0, title: "", review: "" });
                    setShowAddReviewForm(false);
                    setCurrentPage(1);
                    toast.dismiss();
                    toast.success("Review submitted successfully!");
                } else {
                    toast.dismiss();
                    toast.error("Failed to submit review: " + (response.message || "Unknown error"));
                }
            },
            error: function (xhr) { // Handle error in submitting review
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
            complete: function () { // Set submitting to false after submission
                setSubmitting(false);
            },
        });
    };

    // Handle edit review action
    const handleEditReview = (review) => {
        setEditReviewId(review.id);
        setReviewData({
            bookingId: review.bookingId,
            rating: review.rating,
            title: review.title,
            review: review.review,
        });
    };

    // Handle update review action
    const handleUpdateReview = (e) => {
        e.preventDefault();
        const userId = localStorage.getItem("userId");

        // Validate review data
        if (!userId) {
            toast.dismiss();
            toast.error("Please log in to update your review.");
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

        setSubmitting(true);
        $.ajax({ // Update review on the server
            url: "http://localhost/WanderlustTrails/backend/config/reviews/editReview.php",
            type: "PUT",
            data: JSON.stringify({ userId, reviewId: editReviewId, ...reviewData }),
            contentType: "application/json",
            dataType: "json",
            success: function (response) { 
                if (response.success) {
                    const updatedReviews = reviews.map((r) =>
                        r.id === editReviewId
                            ? { ...r, ...reviewData, createdAt: new Date().toISOString() }
                            : r
                    );
                    setReviews(updatedReviews);
                    setSortedReviews((prev) => {
                        let updated = [...updatedReviews];
                        const [sortBy, sortOrder] = sortOption.split("-");
                        if (sortBy === "rating") {
                            updated.sort((a, b) => {
                                return sortOrder === "asc" ? a.rating - b.rating : b.rating - a.rating;
                            });
                        } else if (sortBy === "date") {
                            updated.sort((a, b) => {
                                const dateA = new Date(a.createdAt);
                                const dateB = new Date(b.createdAt);
                                return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
                            });
                        }
                        return updated; 
                    }); // Sort updated reviews based on the current sort option
                    setEditReviewId(null);
                    setReviewData({ bookingId: "", rating: 0, title: "", review: "" });
                    toast.dismiss();
                    toast.success("Review updated successfully!");
                } else {
                    toast.dismiss();
                    toast.error("Failed to update review: " + (response.message || "Unknown error"));
                }
            },
            error: function (xhr) { // Handle error in updating review
                console.error("Error updating review:", xhr);
                let errorMessage = "Error updating review: Server error";
                try {
                    const response = JSON.parse(xhr.responseText);
                    errorMessage = "Error updating review: " + (response.message || "Server error");
                } catch (e) {
                    errorMessage = xhr.statusText || `Server error (status: ${xhr.status})`;
                }
                toast.dismiss();
                toast.error(errorMessage);
            },
            complete: function () { // Set submitting to false after update
                setSubmitting(false);
            },
        });
    };

    // Handle cancel edit action
    const handleCancelEdit = () => {
        setEditReviewId(null);
        setReviewData({ bookingId: "", rating: 0, title: "", review: "" });
    };

    //pagination logic
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
                            <div className="space-y-6 mb-6">
                                {currentReviews.map((review) => {
                                    const userName = localStorage.getItem("userName") || "Unknown User";
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
                                        <div key={review.id} className="bg-gray-800 rounded-lg p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xl font-semibold text-green-600">{review.title}</h3>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-yellow-500 text-xl font-medium">{review.rating}/5</span>
                                                    <button
                                                        onClick={() => handleEditReview(review)}
                                                        className="py-1 px-3 rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-700 hover:bg-green-600"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-200 mb-3">
                                                <span className="font-bold text-gray-200">{userName}</span> |{" "}
                                                <span className="text-blue-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                            </p>
                                            <p className="text-xl leading-relaxed mb-4 text-gray-300">{review.review}</p>
                                            <div className="border-t border-gray-700 pt-4">
                                                <p className="text-sm text-red-700 font-medium">
                                                    {review.booking_type || "Unknown Type"}
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
                                            </div>
                                            <p className="text-sm text-gray-400 mt-2">
                                                <span className="font-medium text-gray-200">Review ID:</span> {review.id}
                                            </p>
                                            {editReviewId === review.id && (
                                                <div className="mt-4 border-t border-gray-600 pt-4">
                                                    <ReviewForm
                                                        reviewData={reviewData}
                                                        setReviewData={setReviewData}
                                                        bookings={[]}
                                                        submitting={submitting}
                                                        onSubmit={handleUpdateReview}
                                                        onCancel={handleCancelEdit}
                                                        isEditMode={true}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
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
                                onClick={() => setShowAddReviewForm(true)}
                                className="py-2 px-4 rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-700 hover:bg-green-600 disabled:opacity-50"
                                disabled={bookings.length === 0 || submitting}
                            >
                                Add Review
                            </button>
                            {bookings.length === 0 && (
                                <p className="mt-2 text-gray-400">No bookings available to review.</p>
                            )}
                        </div>

                        {showAddReviewForm && (
                            <ReviewForm
                                reviewData={reviewData}
                                setReviewData={setReviewData}
                                bookings={bookings}
                                submitting={submitting}
                                onSubmit={handleReviewSubmit}
                                onCancel={() => {
                                    setShowAddReviewForm(false);
                                    setReviewData({ bookingId: "", rating: 0, title: "", review: "" });
                                }}
                                isEditMode={false}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default UserReviews;