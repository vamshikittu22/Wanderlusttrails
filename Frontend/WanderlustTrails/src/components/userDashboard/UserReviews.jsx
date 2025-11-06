import React, { useState, useEffect } from "react";
import $ from "jquery";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navigate, useLocation } from "react-router-dom";
import Pagination from "./../Pagination";
import ReviewForm from "./../forms/ReviewForm";

const UserReviews = () => {
    // State to hold all reviews fetched from backend
    const [reviews, setReviews] = useState([]);
    // Sorted version of reviews based on user-selected sort option
    const [sortedReviews, setSortedReviews] = useState([]);
    // Bookings that are confirmed but not yet reviewed by the user
    const [bookings, setBookings] = useState([]);
    // Flag to control visibility of Add Review form
    const [showAddReviewForm, setShowAddReviewForm] = useState(false);
    // Holds the id of the review being edited (if any)
    const [editReviewId, setEditReviewId] = useState(null);
    // Form data state for review submission
    const [reviewData, setReviewData] = useState({
        bookingId: "", // selected booking for which review is to be written
        rating: 0,     // rating value (e.g. 1-5 stars)
        title: "",     // review title
        review: "",    // detailed review text
    });
    // Flag to indicate if a review is currently being submitted
    const [submitting, setSubmitting] = useState(false);
    // Flag to indicate if reviews/bookings data is being loaded
    const [loading, setLoading] = useState(true);
    // Flags to prevent repetitive toasts
    const [hasShownNoReviewsToast, setHasShownNoReviewsToast] = useState(false);
    const [hasShownNoBookingsToast, setHasShownNoBookingsToast] = useState(false);
    // Current sorting option selected by user (default newest first)
    const [sortOption, setSortOption] = useState("date-desc");
    // Current pagination page number
    const [currentPage, setCurrentPage] = useState(1);
    // Number of reviews displayed per page
    const reviewsPerPage = 5;
    // Hook to access current location (URL) object from react-router
    const location = useLocation();

    /**
     * Fetches reviews and bookings data for the current logged-in user.
     * Handles API calls to backend and updates component state accordingly.
     * Also handles error display and toast notifications.
     */
    const fetchData = () => {
        // Get user ID from localStorage
        const userId = localStorage.getItem("userId");
        if (!userId) {
            // User not logged in: show error toast and redirect to login page
            toast.dismiss();
            toast.error("Please log in to view your reviews.");
            Navigate("/login"); // NOTE: Navigate is a component, calling as a function here won't work as expected; should use useNavigate hook
            setLoading(false);
            return;
        }
    
        setLoading(true); // Begin loading state
    
        // Fetch user reviews from backend API
        $.ajax({
            url: `http://localhost/WanderlustTrails/backend/config/reviews/getUserReviews.php?user_id=${userId}`,
            type: "GET",
            dataType: "json",
            contentType: "application/json",
            cache: false, // Disable caching to ensure fresh data
            success: function (response) {
                console.log("Reviews response:", response);
                if (response.success) {
                    // Normalize reviews, parse bookingId to integer or null
                    const fetchedReviews = (response.data || []).map((review, index) => {
                        const bookingId = review.bookingId && !isNaN(review.bookingId) ? parseInt(review.bookingId) : null;
                        console.log(`Review ${index}: bookingId = ${bookingId}, type = ${typeof bookingId}`);
                        return {
                            ...review,
                            bookingId,
                        };
                    }).filter(review => review.bookingId !== null); // filter out invalid bookingIds
                    console.log("Fetched reviews (normalized):", fetchedReviews);

                    // Set reviews state and sort reviews by date descending by default
                    setReviews(fetchedReviews);
                    const sorted = [...fetchedReviews].sort((a, b) => {
                        const dateA = new Date(a.createdAt);
                        const dateB = new Date(b.createdAt);
                        return dateB - dateA;
                    });
                    setSortedReviews(sorted);

                    // Show info toast if no reviews exist and it hasn't been shown before
                    if (!fetchedReviews.length && !hasShownNoReviewsToast) {
                        toast.dismiss();
                        toast.info("No reviews found.");
                        setHasShownNoReviewsToast(true);
                    }
    
                    // After reviews are set, fetch bookings for this user
                    $.ajax({
                        url: `http://localhost/WanderlustTrails/backend/config/booking/getUserBooking.php?user_id=${userId}`,
                        type: "GET",
                        dataType: "json",
                        contentType: "application/json",
                        cache: false,
                        success: function (response) {
                            console.log("Bookings response:", response);
                            if (response.success) {
                                // Normalize bookings: parse booking IDs and filter invalid entries
                                const normalizedBookings = response.data.map((booking, index) => {
                                    const bookingId = booking.id && !isNaN(booking.id) ? parseInt(booking.id) : null;
                                    console.log(`Booking ${index}: id = ${bookingId}, status = ${booking.status}, type = ${typeof bookingId}`);
                                    return {
                                        ...booking,
                                        id: bookingId,
                                    };
                                }).filter(booking => booking.id !== null);
                                console.log("Normalized bookings:", normalizedBookings);

                                // Filter confirmed bookings which don't have a review yet
                                const unreviewedBookings = normalizedBookings.filter((booking) => {
                                    const isConfirmed = booking.status === "confirmed";
                                    // Check if booking is already reviewed by user
                                    const isReviewed = fetchedReviews.some((r) => {
                                        const match = r.bookingId === booking.id;
                                        console.log(
                                            `Checking booking id=${booking.id} (type: ${typeof booking.id}) ` +
                                            `against review bookingId=${r.bookingId} (type: ${typeof r.bookingId}), ` +
                                            `match=${match}`
                                        );
                                        return match;
                                    });

                                    // Check if booking end date is in the past
                                    const currentDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD
                                     const isPastBooking = booking.start_date && booking.start_date < currentDate;
                                    
                                    // Debug logging
                                    console.log(`Booking id:${booking.id} - isConfirmed:${isConfirmed}, isReviewed:${isReviewed}, isPastBooking:${isPastBooking}, ` +
                                        ` - included=${isConfirmed && !isReviewed && isPastBooking}`
                                    );
                                    // Include only confirmed, unreviewed, past bookings
                                    return isConfirmed && !isReviewed && isPastBooking;
                                });
                                console.log("All reviews:", fetchedReviews);
                                console.log("All bookings:", normalizedBookings);
                                console.log("Unreviewed bookings after filter:", unreviewedBookings);

                                // Update bookings state to unreviewed confirmed bookings
                                setBookings(unreviewedBookings);

                                // Show info toast if no unreviewed confirmed bookings exist and not shown before
                                if (!unreviewedBookings.length && !hasShownNoBookingsToast) {
                                    toast.dismiss();
                                    toast.info("No unreviewed confirmed bookings available.");
                                    setHasShownNoBookingsToast(true);
                                }
                            } else {
                                // Handle failure to fetch bookings
                                toast.dismiss();
                                toast.error("Failed to fetch bookings: " + (response.message || "Unknown error"));
                                setBookings([]);
                            }
                        },
                        error: function (xhr) {
                            // Handle ajax errors for bookings
                            console.error("Error fetching bookings:", xhr);
                            let errorMessage = "Error fetching bookings: Server error";
                            try {
                                const response = JSON.parse(xhr.responseText);
                                errorMessage = "Error fetching bookings: " + (response.message || "Server error");
                            } catch (e) {
                                errorMessage = xhr.statusText || `Server error (status: ${xhr.status})`;
                            }
                            toast.dismiss();
                            toast.error(errorMessage);
                            setBookings([]);
                        },
                        complete: function () {
                            // End loading once bookings fetch is complete
                            setLoading(false);
                        },
                    });
                } else {
                    // Handle failure to fetch reviews
                    toast.dismiss();
                    toast.error("Failed to fetch reviews: " + (response.message || "Unknown error"));
                    setLoading(false);
                }
            },
            error: function (xhr) {
                // Handle ajax errors for reviews
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
                setLoading(false);
            },
        });
    };

    // Use effect to run fetchData on component mount or when location.search changes
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        // Show Add Review form if URL has tab=write-review query param
        if (queryParams.get("tab") === "write-review") {
            setShowAddReviewForm(true);
        }

        fetchData(); // Fetch reviews and bookings data
    }, [location.search]);

    /**
     * Handler to update the sort option for reviews when user changes the sort dropdown.
     * It updates sortedReviews state according to selected sort option.
     */
    const handleSortChange = (e) => {
        const newSortOption = e.target.value;
        setSortOption(newSortOption);
        setCurrentPage(1); // Reset to first page on sort change

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

    /**
     * Handler to submit a new review.
     * Validates form data, sends POST request to backend, updates state accordingly.
     */
    const handleReviewSubmit = (e) => {
        e.preventDefault();
        const userId = localStorage.getItem("userId");
    
        if (!userId) {
            toast.dismiss();
            toast.error("Please log in to submit a review.");
            return;
        }
        const selectedBooking = bookings.find((b) => b.id === parseInt(reviewData.bookingId));
        if (!reviewData.bookingId || !selectedBooking) {
            toast.dismiss();
            toast.error("Please select a valid booking.");
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
        // Prepare payload with userId and review data for backend submission
        const payload = { userId, ...reviewData, bookingId: parseInt(reviewData.bookingId) };
        console.log("Review submission payload:", payload);
    
        $.ajax({
            url: "http://localhost/WanderlustTrails/backend/config/reviews/writeReview.php",
            type: "POST",
            data: JSON.stringify(payload),
            contentType: "application/json",
            dataType: "json",
            success: function (response) {
                console.log("Submit response:", response);
                if (response.success) {
                    // On success, create new review object with additional booking info
                    const booking = bookings.find((b) => b.id === parseInt(reviewData.bookingId));
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
    
                    // Compose new review object to add to local state
                    const newReview = {
                        id: response.reviewId || Date.now(),
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
                    };

                    // Update reviews and sortedReviews with new review
                    setReviews((prev) => [...prev, newReview]);
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

                    // Remove reviewed booking from bookings list
                    setBookings((prev) => prev.filter((b) => b.id !== parseInt(reviewData.bookingId)));

                    // Reset review form data and hide form
                    setReviewData({ bookingId: "", rating: 0, title: "", review: "" });
                    setShowAddReviewForm(false);
                    setCurrentPage(1);
                    toast.dismiss();
                    toast.success("Review submitted successfully!");
                } else {
                    // Handle backend error response for duplicate review or others
                    const errorMessage = response.message || "Unknown error";
                    toast.dismiss();
                    if (errorMessage.toLowerCase().includes("already reviewed")) {
                        toast.error("This booking has already been reviewed.");
                        fetchData(); // Refresh data to update UI
                    } else {
                        toast.error("Failed to submit review: " + errorMessage);
                    }
                }
            },
            error: function (xhr) {
                // Handle ajax error during review submission
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
                fetchData(); // Refetch data on error to keep UI in sync
            },
            complete: function () {
                setSubmitting(false); // Reset submitting flag on completion
            },
        });
    };


   const handleEditReview = (review) => {
    // Set the ID of the review currently being edited
    setEditReviewId(review.id);
    // Populate the form fields with the selected review's existing data
    setReviewData({
        bookingId: review.bookingId,
        rating: review.rating,
        title: review.title,
        review: review.review,
    });
};

const handleUpdateReview = (e) => {
    e.preventDefault(); // Prevent default form submit behavior
    const userId = localStorage.getItem("userId"); // Get logged in user ID from localStorage

    if (!userId) {
        toast.dismiss();
        toast.error("Please log in to update your review."); // Notify if user not logged in
        return;
    }
    if (!reviewData.rating) {
        toast.dismiss();
        toast.error("Please select a rating."); // Validate rating selection
        return;
    }
    if (!reviewData.title || !reviewData.review) {
        toast.dismiss();
        toast.error("Title and review are required."); // Validate required fields
        return;
    }

    setSubmitting(true); // Show submitting state (e.g., disable form)

    // AJAX PUT request to update the review on the server
    $.ajax({
        url: "http://localhost/WanderlustTrails/backend/config/reviews/editReview.php",
        type: "PUT",
        data: JSON.stringify({ userId, reviewId: editReviewId, ...reviewData }),
        contentType: "application/json",
        dataType: "json",
        success: function (response) {
            if (response.success) {
                // Update local reviews state with the updated review data
                const updatedReviews = reviews.map((r) =>
                    r.id === editReviewId
                        ? { ...r, ...reviewData, createdAt: new Date().toISOString() }
                        : r
                );
                setReviews(updatedReviews);

                // Re-apply the current sorting option to the updated reviews
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
                });

                // Reset editing state and clear the form
                setEditReviewId(null);
                setReviewData({ bookingId: "", rating: 0, title: "", review: "" });
                toast.dismiss();
                toast.success("Review updated successfully!"); // Notify success
            } else {
                toast.dismiss();
                toast.error("Failed to update review: " + (response.message || "Unknown error")); // Notify failure
            }
        },
        error: function (xhr) {
            console.error("Error updating review:", xhr);
            let errorMessage = "Error updating review: Server error";
            try {
                const response = JSON.parse(xhr.responseText);
                errorMessage = "Error submitting review: " + (response.message || "Server error");
            } catch (e) {
                errorMessage = xhr.statusText || `Server error (status: ${xhr.status})`;
            }
            toast.dismiss();
            toast.error(errorMessage); // Show error toast
        },
        complete: function () {
            setSubmitting(false); // Reset submitting state after request completes
        },
    });
};

const handleCancelEdit = () => {
    // Cancel editing mode and clear the form data
    setEditReviewId(null);
    setReviewData({ bookingId: "", rating: 0, title: "", review: "" });
};

// Calculate the index range of reviews to display for the current page
const startIndex = (currentPage - 1) * reviewsPerPage;
const endIndex = startIndex + reviewsPerPage;
const currentReviews = sortedReviews.slice(startIndex, endIndex); // Slice current page reviews

return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-900">
        <div className="w-full max-w-7xl p-6 bg-gray-700 text-white rounded-lg shadow-md">
            <ToastContainer /> {/* Container for toast notifications */}
            <h2 className="text-2xl text-orange-600 font-bold mb-6 text-center">Your Reviews</h2>
            <div className="flex justify-end mb-4">
                <select
                    value={sortOption}
                    onChange={handleSortChange} // Change sorting option handler
                    className="py-1 px-3 rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:bg-purple-700 focus:outline-none"
                >
                    <option value="date-desc">Sort by Date (Newest First)</option>
                    <option value="date-asc">Sort by Date (Oldest First)</option>
                    <option value="rating-desc">Sort by Rating (High to Low)</option>
                    <option value="rating-asc">Sort by Rating (Low to High)</option>
                </select>
            </div>

            {loading ? (
                <p className="mb-6 text-center text-gray-400">Loading reviews...</p> // Loading indicator
            ) : (
                <>
                    {reviews.length > 0 ? (
                        <div className="space-y-6 mb-6">
                            {currentReviews.map((review) => {
                                // Get user name from localStorage or fallback
                                const userName = localStorage.getItem("userName") || "Unknown User";

                                // Parse flight and hotel details safely
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
                                                    onClick={() => handleEditReview(review)} // Start editing this review
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
                                                    bookings={[]} // Empty bookings as editing existing review
                                                    submitting={submitting}
                                                    onSubmit={handleUpdateReview} // Submit handler for editing
                                                    onCancel={handleCancelEdit} // Cancel editing handler
                                                    isEditMode={true} // Indicate edit mode to the form
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="mb-6 text-center text-gray-400">No reviews yet.</p> // Message if no reviews
                    )}

                    {/* Pagination component to navigate through review pages */}
                    <Pagination
                        totalItems={sortedReviews.length}
                        itemsPerPage={reviewsPerPage}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                    />

                    <br />

                    {/* Button to add a new review */}
                    <div className="text-center mb-6">
                        <button
                            onClick={() => setShowAddReviewForm(true)} // Show add review form
                            className="py-2 px-4 rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-700 hover:bg-green-600 disabled:opacity-50"
                            disabled={bookings.length === 0 || submitting} // Disable if no bookings or submitting
                        >
                            Add Review
                        </button>
                        {bookings.length === 0 && (
                            <p className="mt-2 text-gray-400">No bookings available to review.</p> // Show if no bookings
                        )}
                    </div>

                    {/* Add review form modal */}
                    {showAddReviewForm && (
                        <ReviewForm
                            reviewData={reviewData}
                            setReviewData={setReviewData}
                            bookings={bookings} // Pass available bookings to choose from
                            submitting={submitting}
                            onSubmit={handleReviewSubmit} // Handler for submitting new review
                            onCancel={() => {
                                setShowAddReviewForm(false);
                                setReviewData({ bookingId: "", rating: 0, title: "", review: "" }); // Clear form
                            }}
                            isEditMode={false} // Indicate add mode
                        />
                    )}
                </>
            )}
        </div>
    </div>
);

};

export default UserReviews;
