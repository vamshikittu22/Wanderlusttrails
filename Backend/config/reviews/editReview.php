<?php
// Path: Wanderlusttrails/Backend/config/reviews/editReview.php
// Updates a review in the database via PUT request, expects JSON data.

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php"; // Include the logger for logging purposes

Logger::log("editReview API Started - Method: {$_SERVER['REQUEST_METHOD']}");
// Preflight test for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for editReview");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

try {
    require_once __DIR__ . "/inc_reviewModel.php"; // Include the review model for database operations
} catch (Exception $e) {
    Logger::log("Error loading inc_reviewModel.php: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: Unable to load review model"]);
    exit;
}
// Check if the request method is PUT
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$rawInput = file_get_contents("php://input"); // Get the raw input from the request body
$data = json_decode($rawInput, true); // Decode the JSON input
if (!$data) {
    Logger::log("Invalid JSON input: " . ($rawInput ?: 'empty'));
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid or missing JSON data"]);
    exit;
}
//get the data from the request
$userId = $data['userId'] ?? '';
$reviewId = $data['reviewId'] ?? '';
$rating = $data['rating'] ?? '';
$title = $data['title'] ?? '';
$review = $data['review'] ?? '';

Logger::log("Received data - userId: $userId, reviewId: $reviewId, rating: $rating, title: " . substr($title, 0, 50) . ", review: " . substr($review, 0, 100));

try { 
    $reviewModel = new ReviewModel(); // Create an instance of the ReviewModel class
    $result = $reviewModel->editReview($userId, $reviewId, $rating, $title, $review); // Call the editReview method to update the review

    Logger::log("editReview result: " . json_encode($result));

    http_response_code($result['success'] ? 200 : 400);
    echo json_encode($result); // Send the result back to the client
} catch (Exception $e) {
    Logger::log("Exception in editReview: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: {$e->getMessage()}"]); // Send error response        
}
exit;
?>