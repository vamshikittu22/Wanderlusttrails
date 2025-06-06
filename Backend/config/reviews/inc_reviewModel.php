<?php
// Path: Wanderlusttrails/Backend/config/reviews/inc_reviewModel.php
// Handles database operations for reviews (write, edit, get user reviews, get all reviews, comments).

require_once __DIR__ . "/../inc_databaseClass.php";
require_once __DIR__ . "/../inc_logger.php";

// ReviewModel class 
class ReviewModel {
    private $db; // Database connection

    public function __construct() { // Constructor to initialize the database connection
        Logger::log("ReviewModel instantiated");
        $this->db = new DatabaseClass(); // Initialize the database connection
    }

    // Write a new review
    public function writeReview($userId, $bookingId, $rating, $title, $review) {
        Logger::log("writeReview called - userId: $userId, bookingId: $bookingId, rating: $rating, title: " . substr($title, 0, 50));

        // Prepare the insert query
        $query = "INSERT INTO reviews (userId, bookingId, rating, title, review) VALUES (?, ?, ?, ?, ?)"; // Insert query for new review
        $types = "iiiss"; // Define the types for prepared statement
        $result = $this->db->executeQuery($query, $types, $userId, $bookingId, $rating, $title, $review); // Execute the query

        Logger::log("writeReview query result: " . json_encode([
            'success' => $result['success'],
            'affected_rows' => $result['affected_rows'],
            'error' => $result['error'] ?? 'none'
        ]));

        return $result['success'] && $result['affected_rows'] > 0
            ? ["success" => true, "message" => "Review submitted successfully"]   // Success response
            : ["success" => false, "message" => "Failed to submit review"]; // Failure response
    }

    // Edit an existing review
    public function editReview($userId, $reviewId, $rating, $title, $review) {
        Logger::log("editReview called - userId: $userId, reviewId: $reviewId, rating: $rating, title: " . substr($title, 0, 50));

        // Prepare the update query
        $query = "UPDATE reviews SET rating = ?, title = ?, review = ?, createdAt = NOW() WHERE id = ? AND userId = ?"; // Update query for existing review
        $types = "issii"; // Define the types for prepared statement
        $result = $this->db->executeQuery($query, $types, $rating, $title, $review, $reviewId, $userId); // Execute the query

        Logger::log("editReview query result: " . json_encode([
            'success' => $result['success'],
            'affected_rows' => $result['affected_rows'],
            'error' => $result['error'] ?? 'none'
        ]));

        return $result['success'] && $result['affected_rows'] > 0
            ? ["success" => true, "message" => "Review updated successfully"] // Success response
            : ["success" => false, "message" => "Failed to update review"];     // Failure response
    }

    // Add a comment to a review
    public function addComment($userId, $reviewId, $comment, $parentId = null) {
        Logger::log("addComment called - userId: $userId, reviewId: $reviewId, parentId: " . ($parentId ?? 'null'));

        // Insert the comment
        if ($parentId === null) {
            $query = "INSERT INTO comments (review_id, user_id, comment) VALUES (?, ?, ?)"; // Insert query for new comment
            $types = "iis"; // Define the types for prepared statement
            $params = [$reviewId, $userId, $comment]; // Parameters for the query
        } else {
            $query = "INSERT INTO comments (review_id, user_id, comment, parent_id) VALUES (?, ?, ?, ?)"; // Insert query for reply to a comment
            $types = "iisi"; // Define the types for prepared statement
            $params = [$reviewId, $userId, $comment, $parentId]; // Parameters for the query
        }
        $result = $this->db->executeQuery($query, $types, ...$params); // Execute the query

        Logger::log("addComment query result: " . json_encode([
            'success' => $result['success'],
            'affected_rows' => $result['affected_rows'],
            'error' => $result['error'] ?? 'none'
        ]));

        if ($result['success'] && $result['affected_rows'] > 0) {
            $commentId = $result['insert_id'];
            // Fetch the newly created comment
            $query = "SELECT c.id, c.user_id, c.comment, c.created_at, u.firstName, u.lastName 
                      FROM comments c 
                      JOIN users u ON c.user_id = u.id 
                      WHERE c.id = ?"; // Query to fetch the new comment
            $newComment = $this->db->fetchQuery($query, "i", $commentId); // Fetch new comment details
            Logger::log("New comment fetched: " . json_encode($newComment));
            return [
                "success" => true,
                "message" => "Comment added successfully",
                "comment" => $newComment[0] ?? []
            ]; // Return the new comment details
        }
        return ["success" => false, "message" => "Failed to add comment"]; // Failure response
    }

    // Get all comments for a review (including nested replies)
    public function getComments($reviewId) {
        Logger::log("getComments called - reviewId: $reviewId");

        // Fetch all comments for the review
        $query = "SELECT c.id, c.user_id, c.comment, c.parent_id, c.created_at, 
                         u.firstName, u.lastName 
                  FROM comments c 
                  JOIN users u ON c.user_id = u.id 
                  WHERE c.review_id = ?"; // Query to fetch comments
        $comments = $this->db->fetchQuery($query, "i", $reviewId); // Fetch comments for the review

        Logger::log("getComments query result: " . json_encode([
            'comment_count' => count($comments),
            'sample' => $comments ? array_slice($comments, 0, 1) : []
        ]));

        // Build a nested structure for comments and replies
        $commentTree = []; // Initialize the comment tree
        $commentMap = []; // Initialize the comment map

        // Create a map of comments by their ID
        foreach ($comments as $comment) {
            $comment['replies'] = [];
            $commentMap[$comment['id']] = $comment;
        }

        // Loop through the comments and assign replies to their parent comment
        foreach ($commentMap as $comment) {
            if ($comment['parent_id'] === null) {
                $commentTree[] = $comment;
            } else {
                if (isset($commentMap[$comment['parent_id']])) {
                    $commentMap[$comment['parent_id']]['replies'][] = $comment;
                }
            }
        }

        return ["success" => true, "data" => $commentTree]; // Return the nested comment structure
    }

    // Get all reviews for a user with booking details
    public function getUserReviews($userId) {
        Logger::log("getUserReviews called - userId: $userId");

        $query = "SELECT r.id, r.bookingId, r.rating, r.title, r.review, r.createdAt, 
                         b.package_name, b.booking_type, b.start_date, b.end_date, 
                         b.flight_details, b.hotel_details
                  FROM reviews r 
                  JOIN bookings b ON r.bookingId = b.id 
                  WHERE r.userId = ?";  // Query to fetch user reviews
        $types = "i"; // Define the types for prepared statement
        $reviews = $this->db->fetchQuery($query, $types, $userId); // Fetch user reviews

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
                  JOIN bookings b ON r.bookingId = b.id"; // Query to fetch all reviews
        $reviews = $this->db->query($query); // Execute the query

        if (isset($reviews['success']) && !$reviews['success']) {
            Logger::log("Error fetching all reviews: " . $reviews['message']);
            return ["success" => false, "message" => $reviews['message']];
        }
       

        Logger::log("getAllReviews query result: " . json_encode([
            'review_count' => count($reviews),
            'sample' => $reviews ? array_slice($reviews, 0, 1) : []
        ]));

        return ["success" => true, "data" => $reviews]; // Return all reviews
    }
}
?>