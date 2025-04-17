<?php
//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx
// Handles database operations for reviews (write, get user reviews, get all reviews).

require_once __DIR__ . "/../inc_databaseClass.php";
require_once __DIR__ . "/../inc_logger.php";

class ReviewModel {
    private $db;

    public function __construct() {
        Logger::log("ReviewModel instantiated");
        $this->db = new DatabaseClass();
    }

    // Write a new review
    public function writeReview($userId, $bookingId, $rating, $title, $review) {
        Logger::log("writeReview called - userId: $userId, bookingId: $bookingId, rating: $rating, title: " . substr($title, 0, 50));

        if (empty($userId) || empty($bookingId) || empty($rating) || empty($title) || empty($review)) {
            Logger::log("Validation failed: Missing required fields");
            return ["success" => false, "message" => "All fields are required"];
        }

        if (!is_numeric($userId) || !is_numeric($bookingId) || !is_numeric($rating)) {
            Logger::log("Validation failed: userId, bookingId, or rating not numeric");
            return ["success" => false, "message" => "User ID, Booking ID, and Rating must be numeric"];
        }

        if ($rating < 1 || $rating > 5) {
            Logger::log("Validation failed: Rating $rating out of range");
            return ["success" => false, "message" => "Rating must be between 1 and 5"];
        }

        // Check if booking exists and belongs to user
        $query = "SELECT id FROM bookings WHERE id = ? AND user_id = ? AND status = 'confirmed'";
        $booking = $this->db->fetchQuery($query, "ii", $bookingId, $userId);
        Logger::log("Booking check result: " . json_encode($booking));
        if (empty($booking)) {
            Logger::log("Booking not found or not confirmed for bookingId: $bookingId, userId: $userId");
            return ["success" => false, "message" => "Booking not found or not confirmed"];
        }

        // Check if review already exists
        $query = "SELECT id FROM reviews WHERE bookingId = ? AND userId = ?";
        $existing = $this->db->fetchQuery($query, "ii", $bookingId, $userId);
        Logger::log("Existing review check: " . json_encode($existing));
        if (!empty($existing)) {
            Logger::log("Review already exists for bookingId: $bookingId, userId: $userId");
            return ["success" => false, "message" => "Review already exists for this booking"];
        }

        $query = "INSERT INTO reviews (userId, bookingId, rating, title, review) VALUES (?, ?, ?, ?, ?)";
        $types = "iiiss";
        $result = $this->db->executeQuery($query, $types, $userId, $bookingId, $rating, $title, $review);

        Logger::log("writeReview query result: " . json_encode([
            'success' => $result['success'],
            'affected_rows' => $result['affected_rows'],
            'error' => $result['error'] ?? 'none'
        ]));

        return $result['success'] && $result['affected_rows'] > 0
            ? ["success" => true, "message" => "Review submitted successfully"]
            : ["success" => false, "message" => "Failed to submit review"];
    }

    // Get all reviews for a user with booking details
    public function getUserReviews($userId) {
        Logger::log("getUserReviews called - userId: $userId");

        if (empty($userId)) {
            Logger::log("Validation failed: Missing userId");
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

        Logger::log("getUserReviews query result: " . json_encode([
            'review_count' => count($reviews),
            'sample' => $reviews ? array_slice($reviews, 0, 1) : []
        ]));

        return ["success" => true, "data" => $reviews];
    }

    // Get all reviews with user and booking details
    public function getAllReviews() {
        Logger::log("getAllReviews called");

        $query = "SELECT r.id, r.userId, r.bookingId, r.rating, r.title, r.review, r.createdAt, 
                         u.firstName, u.lastName, 
                         b.package_name, b.booking_type, b.start_date, b.end_date, 
                         b.flight_details, b.hotel_details 
                  FROM reviews r 
                  JOIN users u ON r.userId = u.id 
                  JOIN bookings b ON r.bookingId = b.id";
        $reviews = $this->db->fetchQuery($query, "");

        foreach ($reviews as &$review) {
            if ($review['flight_details']) {
                $review['flight_details'] = json_decode($review['flight_details'], true);
            }
            if ($review['hotel_details']) {
                $review['hotel_details'] = json_decode($review['hotel_details'], true);
            }
        }

        Logger::log("getAllReviews query result: " . json_encode([
            'review_count' => count($reviews),
            'sample' => $reviews ? array_slice($reviews, 0, 1) : []
        ]));

        return ["success" => true, "data" => $reviews];
    }
}
?>