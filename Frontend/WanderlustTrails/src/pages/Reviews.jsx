//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx

import { useState, useEffect } from "react";
import $ from "jquery";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

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
                        setReviews(response.data || []);
                        if (!response.data.length) {
                            toast.info("No reviews available yet.");
                        }
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

        fetchReviews();
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <ToastContainer />
            <div className="max-w-7xl mx-auto">
                <h2 className="text-4xl font-bold text-purple-400 mb-10 text-center border-b-4 border-gray-700 pb-4">
                    Customer Reviews
                </h2>

                {loading ? (
                    <p className="text-center text-gray-400 text-lg">Loading reviews...</p>
                ) : reviews.length === 0 ? (
                    <div className="bg-gray-800 shadow-md rounded-lg p-6 text-center">
                        <p className="text-yellow-300 text-lg">No reviews available yet.</p>
                        <p className="text-gray-400 mt-2">Be the first to share your experience!</p>
                    </div>
                ) : (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {reviews.map(review => (
                            <div
                                key={review.id}
                                className="bg-gray-800 shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-2xl font-semibold text-green-600 truncate">
                                        {review.title}
                                    </h3>
                                    <span className="text-yellow-500 text-2xl font-medium">
                                        {review.rating}/5
                                    </span>
                                </div>
                                <p className="text-sm text-gray-200 mb-3">
                                    <span className="font-bold text-gray-200">
                                        {review.firstName} {review.lastName}
                                    </span>{" "}
                                    |{" "}
                                    <span className="text-blue-500">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </p>
                                <p className="text: text-xl leading-relaxed mb-4">{review.review}</p>
                                <div className="border-t border-gray-700 pt-4">
                                    <p className="text-sm text-red-700 font-medium">
                                        {review.booking_type === "package"
                                            ? review.package_name
                                            : "Flight + Hotel"}
                                    </p>
                                    <p className="text-sm text-orange-400">
                                        <span className="font-medium text-gray-200">Dates:</span>{" "}
                                        {review.start_date} to {review.end_date}
                                    </p>
                                    {review.flight_details && (
                                        <p className="text-sm text-orange-400">
                                            <span className="font-medium text-gray-200">Flight:</span>{" "}
                                            {review.flight_details.from} to {review.flight_details.to}
                                        </p>
                                    )}
                                    {review.hotel_details && (
                                        <p className="text-sm text-orange-400">
                                            <span className="font-medium text-gray-200">Hotel:</span>{" "}
                                            {review.hotel_details.destination || "N/A"}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 mt-2">
                                        <span className="font-medium text-gray-200">Review ID:</span>{" "}
                                        {review.id}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex justify-center mt-10">
                <button className="bg-indigo-700 hover:bg-purple-800 text-gray-300 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 shadow-lg">
                    <a href="/UserDashboard">Write a Review</a>
                </button>
            </div>

            <div>
                <p className="text-sm text-gray-400 mt-4 text-center">
                    <span className="font-bold text-gray-200">Disclaimer:</span> Reviews are based
                    on personal experiences and may not reflect the views of all customers.
                    <br />
                    <span className="font-bold text-gray-200">Note:</span> Reviews are displayed in
                    reverse chronological order.
                    <br />
                </p>
            </div>
        </div>
    );
}

export default Reviews;