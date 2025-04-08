<?php
// Backend/config/reviews/inc_reviewModel.php
require_once __DIR__ . "/../inc_databaseClass.php";

class ReviewModel {
    private $db;

    public function __construct() {
        $this->db = new DatabaseClass();
    }

    // Write a new review
    public function writeReview($userId, $bookingId, $rating, $title, $review) {
        if (empty($userId) || empty($bookingId) || empty($rating) || empty($title) || empty($review)) {
            return ["success" => false, "message" => "All fields are required"];
        }

        if (!is_numeric($userId) || !is_numeric($bookingId) || !is_numeric($rating)) {
            return ["success" => false, "message" => "User ID, Booking ID, and Rating must be numeric"];
        }

        if ($rating < 1 || $rating > 5) {
            return ["success" => false, "message" => "Rating must be between 1 and 5"];
        }

        // Check if booking exists and belongs to user
        $query = "SELECT id FROM bookings WHERE id = ? AND user_id = ? AND status = 'confirmed'";
        $booking = $this->db->fetchQuery($query, "ii", $bookingId, $userId);
        if (empty($booking)) {
            return ["success" => false, "message" => "Booking not found or not confirmed"];
        }

        // Check if review already exists
        $query = "SELECT id FROM reviews WHERE bookingId = ? AND userId = ?";
        $existing = $this->db->fetchQuery($query, "ii", $bookingId, $userId);
        if (!empty($existing)) {
            return ["success" => false, "message" => "Review already exists for this booking"];
        }

        $query = "INSERT INTO reviews (userId, bookingId, rating, title, review) VALUES (?, ?, ?, ?, ?)";
        $types = "iiiss";
        $result = $this->db->executeQuery($query, $types, $userId, $bookingId, $rating, $title, $review);

        file_put_contents(__DIR__ . "/../logs/debug.log", "ReviewModel::writeReview Result: " . print_r($result, true) . "\n", FILE_APPEND);
        return $result['success'] && $result['affected_rows'] > 0
            ? ["success" => true, "message" => "Review submitted successfully"]
            : ["success" => false, "message" => "Failed to submit review"];
    }

    // Get all reviews for a user with booking details
    public function getUserReviews($userId) {
        if (empty($userId)) {
            return ["success" => false, "message" => "User ID is required"];
        }
    
        $query = "SELECT r.id, r.bookingId, r.rating, r.title, r.review, r.createdAt, 
                         b.package_name, b.booking_type, b.start_date, b.end_date, 
                         b.flight_details, b.hotel_details 
                  FROM reviews r 
                  JOIN bookings b ON r.bookingId = b.id 
                  WHERE r.userId = ?";
        $types = "i";
        $reviews = $this->db->fetchQuery($query, $types, $userId);
    
        file_put_contents(__DIR__ . "/../logs/debug.log", "ReviewModel::getUserReviews: " . print_r($reviews, true) . "\n", FILE_APPEND);
        return ["success" => true, "data" => $reviews];
    }
}
?>