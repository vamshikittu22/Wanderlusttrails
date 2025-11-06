<?php
// Path: Wanderlusttrails/Backend/config/reviews/inc_reviewModel.php
// This class handles all database operations related to reviews, including writing, editing reviews,
// adding comments, fetching comments, fetching user-specific reviews, and fetching all reviews.

// Include the DatabaseClass for DB connections and query execution
require_once __DIR__ . "/../inc_databaseClass.php";

// Include the Logger for logging activities and errors
require_once __DIR__ . "/../inc_logger.php";

// ReviewModel class handles review-related DB operations
class ReviewModel {
    private $db; // Database connection instance

    // Constructor initializes the database connection
    public function __construct() {
        Logger::log("ReviewModel instantiated"); // Log instantiation for debugging
        $this->db = new DatabaseClass(); // Create DB connection
    }

    // Method to write a new review to the database
    public function writeReview($userId, $bookingId, $rating, $title, $review) {
        Logger::log("writeReview called - userId: $userId, bookingId: $bookingId, rating: $rating, title: " . substr($title, 0, 50));

        // SQL insert query with placeholders for prepared statement
        $query = "INSERT INTO reviews (userId, bookingId, rating, title, review) 
                    VALUES (?, ?, ?, ?, ?)";

        // Types for parameters: integer, integer, integer, string, string
        $types = "iiiss";

        // Execute query with provided parameters
        $result = $this->db->executeQuery($query, $types, $userId, $bookingId, $rating, $title, $review);

        // Log the result of the query execution
        Logger::log("writeReview query result: " . json_encode([
            'success' => $result['success'],
            'affected_rows' => $result['affected_rows'],
            'error' => $result['error'] ?? 'none'
        ]));

        // Return success or failure response based on execution result
        return $result['success'] && $result['affected_rows'] > 0
            ? ["success" => true, "message" => "Review submitted successfully"]
            : ["success" => false, "message" => "Failed to submit review"];
    }

    // Method to edit an existing review (only by the original user)
    public function editReview($userId, $reviewId, $rating, $title, $review) {
        Logger::log("editReview called - userId: $userId, reviewId: $reviewId, rating: $rating, title: " . substr($title, 0, 50));

        // SQL update query to update rating, title, review, and updated timestamp
        $query = "UPDATE reviews 
                    SET rating = ?, title = ?, review = ?, createdAt = NOW() 
                    WHERE id = ? 
                    AND userId = ?";

        // Types for parameters: integer, string, string, integer, integer
        $types = "issii";

        // Execute the update query
        $result = $this->db->executeQuery($query, $types, $rating, $title, $review, $reviewId, $userId);

        // Log the query result
        Logger::log("editReview query result: " . json_encode([
            'success' => $result['success'],
            'affected_rows' => $result['affected_rows'],
            'error' => $result['error'] ?? 'none'
        ]));

        // Return response based on update success and rows affected
        return $result['success'] && $result['affected_rows'] > 0
            ? ["success" => true, "message" => "Review updated successfully"]
            : ["success" => false, "message" => "Failed to update review"];
    }

    // Add a comment to a review; supports replies by parent comment ID
    public function addComment($userId, $reviewId, $comment, $parentId = null) {
        Logger::log("addComment called - userId: $userId, reviewId: $reviewId, parentId: " . ($parentId ?? 'null'));

        // Prepare insert query depending on whether it's a top-level comment or a reply
        if ($parentId === null) {
            $query = "INSERT INTO comments (review_id, user_id, comment) 
                        VALUES (?, ?, ?)";
            $types = "iis";
            $params = [$reviewId, $userId, $comment];
        } else {
            $query = "INSERT INTO comments (review_id, user_id, comment, parent_id) 
                        VALUES (?, ?, ?, ?)";
            $types = "iisi";
            $params = [$reviewId, $userId, $comment, $parentId];
        }

        // Execute the insert query
        $result = $this->db->executeQuery($query, $types, ...$params);

        // Log the insert result
        Logger::log("addComment query result: " . json_encode([
            'success' => $result['success'],
            'affected_rows' => $result['affected_rows'],
            'error' => $result['error'] ?? 'none'
        ]));

        // If insert was successful, fetch the newly inserted comment with user info
        if ($result['success'] && $result['affected_rows'] > 0) {
            $commentId = $result['insert_id'];

            $query = "SELECT c.id, c.user_id, c.comment, c.created_at, u.firstName, u.lastName 
                        FROM comments c 
                        JOIN users u ON c.user_id = u.id 
                        WHERE c.id = ?";

            $newComment = $this->db->fetchQuery($query, "i", $commentId);
            Logger::log("New comment fetched: " . json_encode($newComment));

            // Return success with the newly added comment data
            return [
                "success" => true,
                "message" => "Comment added successfully",
                "comment" => $newComment[0] ?? []
            ];
        }

        // Return failure response if insert failed
        return ["success" => false, "message" => "Failed to add comment"];
    }

    // Retrieve all comments for a review, including nested replies
    public function getComments($reviewId) {
        Logger::log("getComments called - reviewId: $reviewId");

        // Query to get all comments for the review with user info
        $query = 
            "SELECT c.id, c.user_id, c.comment, c.parent_id, c.created_at, u.firstName, u.lastName 
                    FROM comments c 
                    JOIN users u ON c.user_id = u.id 
                    WHERE c.review_id = ?";

        // Fetch comments for the review
        $comments = $this->db->fetchQuery($query, "i", $reviewId);

        // Log the count of comments and a sample comment
        Logger::log("getComments query result: " . json_encode([
            'comment_count' => count($comments),
            'sample' => $comments ? array_slice($comments, 0, 1) : []
        ]));

        // Build nested comment tree (comments with replies)
        $commentTree = [];
        $commentMap = [];

        // Create map of comments by id, add empty 'replies' array for each
        foreach ($comments as $comment) {
            $comment['replies'] = [];
            $commentMap[$comment['id']] = $comment;
        }

        // Organize comments into tree by assigning replies to parents
        foreach ($commentMap as $comment) {
            if ($comment['parent_id'] === null) {
                // Top-level comment, add to root of tree
                $commentTree[] = $comment;
            } else {
                // Nested reply, append to parent's replies if parent exists
                if (isset($commentMap[$comment['parent_id']])) {
                    $commentMap[$comment['parent_id']]['replies'][] = $comment;
                }
            }
        }

        // Return the nested comment structure
        return ["success" => true, "data" => $commentTree];
    }

    // Retrieve all reviews for a specific user, with booking details
    public function getUserReviews($userId) {
        Logger::log("getUserReviews called - userId: $userId");

        // Query to fetch reviews joined with booking details for the user
        $query = "SELECT r.id, r.bookingId, r.rating, r.title, r.review, r.createdAt, 
                         b.package_name, b.booking_type, b.start_date, b.end_date, 
                         b.flight_details, b.hotel_details
                  FROM reviews r 
                  JOIN bookings b ON r.bookingId = b.id 
                  WHERE r.userId = ?";

        $types = "i";

        // Fetch the reviews
        $reviews = $this->db->fetchQuery($query, $types, $userId);

        // Log count and sample review
        Logger::log("getUserReviews query result: " . json_encode([
            'review_count' => count($reviews),
            'sample' => $reviews ? array_slice($reviews, 0, 1) : []
        ]));

        // Return success with data
        return ["success" => true, "data" => $reviews];
    }

    // Retrieve all reviews with user and booking info (admin or overview)
    public function getAllReviews() {
        Logger::log("getAllReviews called");

        // Query to fetch all reviews with joined user and booking info
        $query = "SELECT r.id, r.userId, r.bookingId, r.rating, r.title, r.review, r.createdAt, 
                         u.firstName, u.lastName, 
                         b.package_name, b.booking_type, b.start_date, b.end_date, 
                         b.flight_details, b.hotel_details 
                  FROM reviews r 
                  JOIN users u ON r.userId = u.id 
                  JOIN bookings b ON r.bookingId = b.id";

        // Execute the query (no parameters)
        $reviews = $this->db->query($query);

        // Check for query failure
        if (isset($reviews['success']) && !$reviews['success']) {
            Logger::log("Error fetching all reviews: " . $reviews['message']);
            return ["success" => false, "message" => $reviews['message']];
        }

        // Log count and sample review
        Logger::log("getAllReviews query result: " . json_encode([
            'review_count' => count($reviews),
            'sample' => $reviews ? array_slice($reviews, 0, 1) : []
        ]));

        // Return success with all reviews
        return ["success" => true, "data" => $reviews];
    }
}
?>
