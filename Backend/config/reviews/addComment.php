<?php
// Path: Wanderlusttrails/Backend/config/reviews/addComment.php
// Adds a comment to a review in the database via POST request, expects JSON data.

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php"; // Include the logger for logging purposes

Logger::log("addComment API Started - Method: {$_SERVER['REQUEST_METHOD']}");
// Preflight test for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for addComment");
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
// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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
// Get the data from the request
$userId = $data['userId'] ?? '';
$reviewId = $data['reviewId'] ?? '';
$comment = $data['comment'] ?? '';
$parentId = $data['parentId'] ?? null;

Logger::log("Received data - userId: $userId, reviewId: $reviewId, parentId: " . ($parentId ?? 'null') . ", comment: " . substr($comment, 0, 100));

try {
    $reviewModel = new ReviewModel(); // Create an instance of the ReviewModel class
    $result = $reviewModel->addComment($userId, $reviewId, $comment, $parentId); // Call the addComment method to save the comment

    Logger::log("addComment result: " . json_encode($result));

    http_response_code($result['success'] ? 201 : 400);
    echo json_encode($result); // Return the result as JSON
} catch (Exception $e) {
    Logger::log("Exception in addComment: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: {$e->getMessage()}"]); // Return error message
}
exit;
?>