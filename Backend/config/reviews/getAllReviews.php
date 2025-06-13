<?php
// Path: Wanderlusttrails/Backend/config/reviews/getAllReviews.php
// API endpoint to retrieve all reviews from the database.
// Expects a GET request and returns JSON with all reviews.

// Allow CORS requests from the frontend at localhost:5173
header("Access-Control-Allow-Origin: http://localhost:5173");

// Set response content type to JSON with UTF-8 encoding
header("Content-Type: application/json; charset=UTF-8");

// Allow GET and OPTIONS HTTP methods
header("Access-Control-Allow-Methods: GET, OPTIONS");

// Allow Content-Type header for requests
header("Access-Control-Allow-Headers: Content-Type");

// Include logger for debugging and tracking API calls
require_once __DIR__ . "/../inc_logger.php";

// Log that the API request started and record the HTTP method
Logger::log("getAllReviews API Started - Method: {$_SERVER['REQUEST_METHOD']}");

// Handle CORS preflight OPTIONS request, respond with success and exit
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for getAllReviews");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

try {
    // Include the ReviewModel to interact with the reviews in the database
    require_once __DIR__ . "/inc_reviewModel.php";

    // Include the ValidationClass (though not explicitly used here, included for consistency)
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

// Log that we are starting to fetch all reviews
Logger::log("Fetching all reviews");

try {
    // Instantiate ReviewModel to interact with database
    $reviewModel = new ReviewModel();

    // Call getAllReviews() method to fetch all reviews
    $result = $reviewModel->getAllReviews();

    // Log summary of result: success status, message (if any), and count of reviews fetched
    Logger::log("getAllReviews result: " . json_encode([
        'success' => $result['success'],
        'message' => $result['message'] ?? 'N/A',
        'data_count' => count($result['data'] ?? [])
    ]));

    // Respond with HTTP 200 OK if success, else HTTP 500 Internal Server Error
    http_response_code($result['success'] ? 200 : 500);

    // Output the JSON encoded result array containing success, message, and data keys
    echo json_encode($result);
} catch (Exception $e) {
    // Log any exceptions and respond with 500 Internal Server Error
    Logger::log("Exception in getAllReviews: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: {$e->getMessage()}"]);
}

exit;
?>
