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
        $query = "SELECT id FROM bookings WHERE id = ? AND user_id = ? AND status = 'confirmed'"; // Check for confirmed bookings only
        $booking = $this->db->fetchQuery($query, "ii", $bookingId, $userId); // Fetch booking details
        Logger::log("Booking check result: " . json_encode($booking));
        if (empty($booking)) {
            Logger::log("Booking not found or not confirmed for bookingId: $bookingId, userId: $userId");
            return ["success" => false, "message" => "Booking not found or not confirmed"];
        }

        // Check if review already exists
        $query = "SELECT id FROM reviews WHERE bookingId = ? AND userId = ?"; // query to check existing reviews
        $existing = $this->db->fetchQuery($query, "ii", $bookingId, $userId); // Fetch existing reviews
        Logger::log("Existing review check: " . json_encode($existing)); 
        if (!empty($existing)) {
            Logger::log("Review already exists for bookingId: $bookingId, userId: $userId");
            return ["success" => false, "message" => "Review already exists for this booking"];
        }

        //prepare the insert query
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

        if (empty($userId) || empty($reviewId) || empty($rating) || empty($title) || empty($review)) {
            Logger::log("Validation failed: Missing required fields");
            return ["success" => false, "message" => "All fields are required"];
        }

        if (!is_numeric($userId) || !is_numeric($reviewId) || !is_numeric($rating)) {
            Logger::log("Validation failed: userId, reviewId, or rating not numeric");
            return ["success" => false, "message" => "User ID, Review ID, and Rating must be numeric"];
        }

        if ($rating < 1 || $rating > 5) {
            Logger::log("Validation failed: Rating $rating out of range");
            return ["success" => false, "message" => "Rating must be between 1 and 5"];
        }

        // Check if review exists and belongs to user
        $query = "SELECT id FROM reviews WHERE id = ? AND userId = ?"; // query to check existing reviews
        $existing = $this->db->fetchQuery($query, "ii", $reviewId, $userId); // Fetch existing reviews
        Logger::log("Existing review check: " . json_encode($existing));    
        if (empty($existing)) {
            Logger::log("Review not found for reviewId: $reviewId, userId: $userId");
            return ["success" => false, "message" => "Review not found or you do not have permission to edit it"];
        }

        //prepare the update query
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

    if (empty($userId) || empty($reviewId) || empty($comment)) {
        Logger::log("Validation failed: Missing required fields");
        return ["success" => false, "message" => "All fields are required"];
    }

    if (!is_numeric($userId) || !is_numeric($reviewId)) {
        Logger::log("Validation failed: userId or reviewId not numeric");
        return ["success" => false, "message" => "User ID and Review ID must be numeric"];
    }

    // Check if the user is an admin
    $query = "SELECT role FROM users WHERE id = ?"; // query to check user role
    $user = $this->db->fetchQuery($query, "i", $userId); // Fetch user details
    if (empty($user)) {
        Logger::log("User not found for userId: $userId");
        return ["success" => false, "message" => "User not found"];
    }
    $userRole = $user[0]['role'];
    Logger::log("User role for userId $userId: $userRole");

    if ($userRole === 'admin') {
        Logger::log("Admin user (userId: $userId) attempted to comment on reviewId: $reviewId");
        return ["success" => false, "message" => "Admins are not allowed to comment on reviews"];
    }

    // Check if review exists
    $query = "SELECT id FROM reviews WHERE id = ?"; // query to check existing reviews
    $review = $this->db->fetchQuery($query, "i", $reviewId); // Fetch review details
    Logger::log("Review check result: " . json_encode($review));
    if (empty($review)) {
        Logger::log("Review not found for reviewId: $reviewId");
        return ["success" => false, "message" => "Review not found"];
    }

    // Check if user exists (already checked above, but keeping for consistency)
    $query = "SELECT firstName, lastName FROM users WHERE id = ?"; // query to check user details
    $user = $this->db->fetchQuery($query, "i", $userId); // Fetch user details
    Logger::log("User check result: " . json_encode($user));
    if (empty($user)) {
        Logger::log("User not found for userId: $userId");
        return ["success" => false, "message" => "User not found"];
    }

    // Check if parent comment exists (if parentId is provided)
    if ($parentId !== null) {
        $query = "SELECT id FROM comments WHERE id = ? AND review_id = ?"; // query to check existing comments
        $parent = $this->db->fetchQuery($query, "ii", $parentId, $reviewId); // Fetch parent comment details
        Logger::log("Parent comment check result: " . json_encode($parent)); 
        if (empty($parent)) {
            Logger::log("Parent comment not found for parentId: $parentId, reviewId: $reviewId");
            return ["success" => false, "message" => "Parent comment not found"];
        }
    }

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
                  WHERE c.id = ?"; // query to fetch the new comment
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

        if (empty($reviewId) || !is_numeric($reviewId)) {
            Logger::log("Validation failed: Invalid reviewId");
            return ["success" => false, "message" => "Valid numeric reviewId is required"];
        }

        // Fetch all comments for the review
        $query = "SELECT c.id, c.user_id, c.comment, c.parent_id, c.created_at, 
                         u.firstName, u.lastName 
                  FROM comments c 
                  JOIN users u ON c.user_id = u.id 
                  WHERE c.review_id = ?"; // query to fetch comments
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

        if (empty($userId)) {
            Logger::log("Validation failed: Missing userId");
            return ["success" => false, "message" => "User ID is required"];
        }

        $query = "SELECT r.id, r.bookingId, r.rating, r.title, r.review, r.createdAt, 
                         b.package_name, b.booking_type, b.start_date, b.end_date, 
                         b.flight_details, b.hotel_details 
                  FROM reviews r 
                  JOIN bookings b ON r.bookingId = b.id 
                  WHERE r.userId = ?";  // query to fetch user reviews
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
                  JOIN bookings b ON r.bookingId = b.id"; // query to fetch all reviews
        $reviews = $this->db->query($query); // Execute the query

        if (isset($reviews['success']) && !$reviews['success']) {
            Logger::log("Error fetching all reviews: " . $reviews['message']);
            return ["success" => false, "message" => $reviews['message']];
        }

        // Decode JSON fields for flight and hotel details
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

        return ["success" => true, "data" => $reviews]; // Return all reviews
    }
}
?>
