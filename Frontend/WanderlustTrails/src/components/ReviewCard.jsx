// path: Frontend/WanderlustTrails/src/components/ReviewCard.jsx
import React from "react";

const ReviewCard = ({ review, isPublicView = false }) => {
  // Determine the userName based on public or private view
  const userName = isPublicView
    ? `${review.firstName} ${review.lastName}` // Use reviewer's name for public view
    : localStorage.getItem("userName") || "Unknown User"; // Use logged-in user name or fallback

  // Initialize flightDetails and hotelDetails objects with error handling
  let flightDetails = {};
  let hotelDetails = {};

  try {
    // Parse flight_details if it's a JSON string; otherwise use as-is or default to {}
    flightDetails =
      typeof review.flight_details === "string"
        ? JSON.parse(review.flight_details || "{}")
        : review.flight_details || {};

    // Parse hotel_details similarly
    hotelDetails =
      typeof review.hotel_details === "string"
        ? JSON.parse(review.hotel_details || "{}")
        : review.hotel_details || {};
  } catch (e) {
    // Log parsing errors and reset details to empty objects
    console.error("Error parsing flight_details or hotel_details:", e);
    flightDetails = {};
    hotelDetails = {};
  }

  return (
    <div className="mb-4 p-4 bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Header with title and rating */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-green-600 truncate">{review.title}</h3>
        <span className="text-yellow-500 text-xl font-medium">{review.rating}/5</span>
      </div>

      {/* User name and date of review */}
      <p className="text-sm text-gray-200 mb-3">
        <span className="font-bold text-gray-200">{userName}</span> |{" "}
        <span className="text-blue-500">{new Date(review.createdAt).toLocaleDateString()}</span>
      </p>

      {/* Review content */}
      <p className="text-xl leading-relaxed mb-4">{review.review}</p>

      {/* Booking details section */}
      <div className="border-t border-gray-700 pt-4">
        {/* Package or flight+hotel name */}
        <p className="text-sm text-red-700 font-medium">
          {review.booking_type === "package" || review.booking_type === "flight_hotel"
            ? review.package_name || "Flight + Hotel"
            : "N/A"}
        </p>

        {/* Start and end dates */}
        <p className="text-sm text-orange-400">
          <span className="font-medium text-gray-200">Dates:</span> {review.start_date} to {review.end_date}
        </p>

        {/* Flight details if available */}
        {flightDetails.from && flightDetails.to && (
          <p className="text-sm text-orange-400">
            <span className="font-medium text-gray-200">Flight:</span> {flightDetails.from} to {flightDetails.to}
          </p>
        )}

        {/* Hotel destination if available */}
        {hotelDetails.destination && (
          <p className="text-sm text-orange-400">
            <span className="font-medium text-gray-200">Hotel Destination:</span> {hotelDetails.destination}
          </p>
        )}
      </div>

      {/* Review ID for reference */}
      <p className="text-sm text-gray-400 mt-2">
        <span className="font-medium text-gray-200">Review ID:</span> {review.id}
      </p>
    </div>
  );
};

export default ReviewCard;
