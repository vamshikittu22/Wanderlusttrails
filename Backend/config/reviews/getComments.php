<?php
// Path: Wanderlusttrails/Backend/config/reviews/getComments.php
// API endpoint to retrieve all comments for a specific review via GET request.
// Returns JSON response with comments data.

// Allow CORS requests from the frontend at localhost:5173
header("Access-Control-Allow-Origin: http://localhost:5173");

// Set response content type to JSON with UTF-8 encoding
header("Content-Type: application/json; charset=UTF-8");

// Allow GET and OPTIONS HTTP methods
header("Access-Control-Allow-Methods: GET, OPTIONS");

// Allow Content-Type header for requests
header("Access-Control-Allow-Headers: Content-Type");

// Include logger to log API actions and errors
require_once __DIR__ . "/../inc_logger.php";

// Log the start of the getComments API and the HTTP method used
Logger::log("getComments API Started - Method: {$_SERVER['REQUEST_METHOD']}");

// Handle CORS preflight OPTIONS request, respond with success and exit
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for getComments");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

try {
    // Include the ReviewModel to interact with the reviews and comments in the database
    require_once __DIR__ . "/inc_reviewModel.php";

    // Include the ValidationClass for input validations
    require_once __DIR__ . "/../inc_validationClass.php";
} catch (Exception $e) {
    // Log and respond with 500 if required files cannot be loaded
    Logger::log("Error loading required files: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: Unable to load required files"]);
    exit;
}

// Validate that the HTTP method is GET, else respond with 405 Method Not Allowed
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Get the reviewId from the query parameters (URL ?reviewId=123)
$reviewId = isset($_GET['reviewId']) ? $_GET['reviewId'] : '';

// Log the received reviewId or 'none' if not provided
Logger::log("Received reviewId: " . ($reviewId ?: 'none'));

// Instantiate ValidationClass to validate inputs
$validator = new ValidationClass();

// Validate that reviewId is a numeric, positive value
$reviewIdValidation = $validator->validateNumeric($reviewId, 'Review ID');
if (!$reviewIdValidation['success']) {
    Logger::log("Validation failed: {$reviewIdValidation['message']}");
    http_response_code(400);
    echo json_encode($reviewIdValidation);
    exit;
}

// Validate that the review with given reviewId actually exists
$reviewValidation = $validator->validateReviewId($reviewId);
if (!$reviewValidation['success']) {
    Logger::log("Validation failed: {$reviewValidation['message']}");
    http_response_code(400);
    echo json_encode($reviewValidation);
    exit;
}

// Cast reviewId to int for database safety and consistency
$reviewId = (int)$reviewId;
Logger::log("Fetching comments for reviewId: $reviewId");

try {
    // Create ReviewModel instance for database interaction
    $reviewModel = new ReviewModel();

    // Fetch comments related to the reviewId
    $result = $reviewModel->getComments($reviewId);

    // Log the result summary: success status, message, and number of comments fetched
    Logger::log("getComments result: " . json_encode([
        'success' => $result['success'],
        'message' => $result['message'] ?? 'N/A',
        'data_count' => count($result['data'] ?? [])
    ]));

    // Send appropriate HTTP response code: 200 OK if success, else 500 Internal Server Error
    http_response_code($result['success'] ? 200 : 500);

    // Output the result as a JSON string
    echo json_encode($result);
} catch (Exception $e) {
    // Log exceptions and respond with 500 error and message
    Logger::log("Exception in getComments: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: {$e->getMessage()}"]);
}

exit;
?>
