import React, { useState } from "react";
import { toast } from "react-toastify";

const ReviewForm = ({
    reviewData,
    setReviewData,
    bookings,
    submitting,
    onSubmit,
    onCancel,
    isEditMode = false,
}) => {
    const [errors, setErrors] = useState({});

    console.log("Bookings received in ReviewForm:", bookings); // Debug bookings

    const handleChange = (e) => {
        const { name, value } = e.target;
        setReviewData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleRatingClick = (rating) => {
        if (!submitting) {
            setReviewData((prev) => ({ ...prev, rating }));
            setErrors((prev) => ({ ...prev, rating: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!isEditMode && !reviewData.bookingId) {
            newErrors.bookingId = "Please select a booking.";
        }
        if (!reviewData.rating) {
            newErrors.rating = "Please select a rating.";
        }
        if (!reviewData.title.trim()) {
            newErrors.title = "Title is required.";
        }
        if (!reviewData.review.trim()) {
            newErrors.review = "Review is required.";
        }
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }
        onSubmit(e);
    };

    return (
        <div className={`p-4 rounded-md ${isEditMode ? "bg-gray-800" : "bg-gray-900"}`}>
            <h3 className="text-lg text-orange-600 font-bold mb-4 text-center">
                {isEditMode ? "Edit Review" : "Write a Review"}
            </h3>
            <form onSubmit={handleSubmit} noValidate>
                {!isEditMode && (
                    <div className="mb-4">
                        <label htmlFor="bookingId" className="block text-sm text-sky-300 font-bold mb-2">
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
                            {bookings.map((booking) => (
                                <option key={booking.id} value={booking.id}>
                                    {booking.booking_type === "flight_hotel"
                                        ? `Flight + Hotel - ${booking.start_date}`
                                        : `${booking.package_name || "Package"} - ${booking.start_date}`}
                                </option>
                            ))}
                        </select>
                        {errors.bookingId && (
                            <p className="text-red-500 text-xs mt-1">{errors.bookingId}</p>
                        )}
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-sm text-sky-300 font-bold mb-2">Rating</label>
                    <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                                key={star}
                                onClick={() => handleRatingClick(star)}
                                className={`w-6 h-6 cursor-pointer ${
                                    star <= reviewData.rating ? "text-yellow-400" : "text-gray-400"
                                } ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                    {errors.rating && (
                        <p className="text-red-500 text-xs mt-1">{errors.rating}</p>
                    )}
                </div>

                <div className="mb-4">
                    <label htmlFor="title" className="block text-sm text-sky-300 font-bold mb-2">
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
                    {errors.title && (
                        <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                    )}
                </div>

                <div className="mb-4">
                    <label htmlFor="review" className="block text-sm text-sky-300 font-bold mb-2">
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
                    {errors.review && (
                        <p className="text-red-500 text-xs mt-1">{errors.review}</p>
                    )}
                </div>

                <div className="text-center space-x-2">
                    <button
                        type="submit"
                        className="py-2 px-4 rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-700 hover:bg-green-600 disabled:opacity-50"
                        disabled={submitting}
                    >
                        {submitting ? "Submitting..." : isEditMode ? "Update Review" : "Submit Review"}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="py-2 px-4 rounded-lg text-white bg-gray-600 hover:bg-gray-500 disabled:opacity-50"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;