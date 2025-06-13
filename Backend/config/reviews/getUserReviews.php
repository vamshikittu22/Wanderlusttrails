<?php
// Path: Wanderlusttrails/Backend/config/reviews/getUserReviews.php
// API endpoint to retrieve all reviews made by a specific user via GET request.
// Returns a JSON response containing the user's reviews.

// Enable CORS for frontend app running on localhost:5173
header("Access-Control-Allow-Origin: http://localhost:5173");

// Specify that the response content will be JSON encoded in UTF-8
header("Content-Type: application/json; charset=UTF-8");

// Allow GET and OPTIONS HTTP methods for this endpoint
header("Access-Control-Allow-Methods: GET, OPTIONS");

// Allow Content-Type header from requests (required for some browsers)
header("Access-Control-Allow-Headers: Content-Type");

// Include logger to log activity and errors
require_once __DIR__ . "/../inc_logger.php";

// Log that the API has started and which HTTP method is being used
Logger::log("getUserReviews API Started - Method: {$_SERVER['REQUEST_METHOD']}");

// Handle preflight OPTIONS request for CORS - respond with 200 OK and exit
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for getUserReviews");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

try {
    // Include ReviewModel to interact with review data from the database
    require_once __DIR__ . "/inc_reviewModel.php";

    // Include ValidationClass for validating user inputs
    require_once __DIR__ . "/../inc_validationClass.php";
} catch (Exception $e) {
    // If includes fail, log error and respond with 500 Internal Server Error
    Logger::log("Error loading required files: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: Unable to load required files"]);
    exit;
}

// Reject any HTTP method other than GET with 405 Method Not Allowed
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Get the user_id parameter from the query string (?user_id=123)
$userId = isset($_GET['user_id']) ? $_GET['user_id'] : '';

// Log the received user ID or indicate none received
Logger::log("Received user_id: " . ($userId ?: 'none'));

// Instantiate the validation class for input checks
$validator = new ValidationClass();

// Validate userId is numeric and positive
$userIdValidation = $validator->validateNumeric($userId, 'User ID');
if (!$userIdValidation['success']) {
    // Log validation failure, respond with 400 Bad Request and exit
    Logger::log("Validation failed: {$userIdValidation['message']}");
    http_response_code(400);
    echo json_encode($userIdValidation);
    exit;
}

// Validate that the user exists in the database
$userValidation = $validator->validateUserExists($userId);
if (!$userValidation['success']) {
    // Log validation failure, respond with 400 Bad Request and exit
    Logger::log("Validation failed: {$userValidation['message']}");
    http_response_code(400);
    echo json_encode($userValidation);
    exit;
}

// Cast userId to integer to ensure data consistency
$userId = (int)$userId;

// Log the action of fetching reviews for the user
Logger::log("Fetching reviews for user_id: $userId");

try {
    // Create instance of ReviewModel to query reviews from the database
    $reviewModel = new ReviewModel();

    // Retrieve the reviews written by the specified user
    $result = $reviewModel->getUserReviews($userId);

    // Log the result summary: success status, message, and count of reviews
    Logger::log("getUserReviews result: " . json_encode([
        'success' => $result['success'],
        'message' => $result['message'] ?? 'N/A',
        'data_count' => count($result['data'] ?? [])
    ]));

    // Respond with 200 OK if successful, else 500 Internal Server Error
    http_response_code($result['success'] ? 200 : 500);

    // Output the JSON encoded result data to the client
    echo json_encode($result);
} catch (Exception $e) {
    // Log any exceptions thrown during the process and return a 500 error
    Logger::log("Exception in getUserReviews: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: {$e->getMessage()}"]);
}

exit;
?>
