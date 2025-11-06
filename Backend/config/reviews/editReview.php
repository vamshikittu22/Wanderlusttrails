<?php
// Path: Wanderlusttrails/Backend/config/reviews/editReview.php
// API endpoint to update an existing review in the database.
// Expects a PUT request with JSON body containing userId, reviewId, rating, title, and review text.

// Allow CORS requests only from the frontend app at localhost:5173
header("Access-Control-Allow-Origin: http://localhost:5173");

// Set response content type as JSON with UTF-8 encoding
header("Content-Type: application/json; charset=UTF-8");

// Allow PUT and OPTIONS methods (OPTIONS for CORS preflight)
header("Access-Control-Allow-Methods: PUT, OPTIONS");

// Allow Content-Type header for incoming requests
header("Access-Control-Allow-Headers: Content-Type");

// Include logger for debugging and error logging
require_once __DIR__ . "/../inc_logger.php";

// Log that the API call has started and which HTTP method was used
Logger::log("editReview API Started - Method: {$_SERVER['REQUEST_METHOD']}");

// Handle OPTIONS preflight request for CORS, respond with success and exit
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for editReview");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

try {
    // Include the ReviewModel class to interact with the database
    require_once __DIR__ . "/inc_reviewModel.php";

    // Include the ValidationClass to validate input data
    require_once __DIR__ . "/../inc_validationClass.php";
} catch (Exception $e) {
    // Log and respond with 500 error if files cannot be loaded
    Logger::log("Error loading required files: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: Unable to load required files"]);
    exit;
}

// Ensure the request method is PUT; if not, return 405 Method Not Allowed
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Read raw JSON input from the request body
$rawInput = file_get_contents("php://input");

// Decode JSON into associative array
$data = json_decode($rawInput, true);

// Validate JSON decoding
if (!$data) {
    Logger::log("Invalid JSON input: " . ($rawInput ?: 'empty'));
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid or missing JSON data"]);
    exit;
}

// Extract expected fields with fallback to empty strings if not present
$userId = $data['userId'] ?? '';
$reviewId = $data['reviewId'] ?? '';
$rating = $data['rating'] ?? '';
$title = $data['title'] ?? '';
$review = $data['review'] ?? '';

// Log received data with truncated title and review 
Logger::log("Received data - userId: $userId, reviewId: $reviewId, rating: $rating, title: " . substr($title, 0, 50) . ", review: " . substr($review, 0, 100));

// Instantiate validation class to validate inputs
$validator = new ValidationClass();

// Validate all required fields are present and not empty
$requiredFields = ['userId', 'reviewId', 'rating', 'title', 'review'];
$requiredValidation = $validator->validateRequiredFields($data, $requiredFields);
if (!$requiredValidation['success']) {
    Logger::log("Validation failed: {$requiredValidation['message']}");
    http_response_code(400);
    echo json_encode($requiredValidation);
    exit;
}

// Validate that userId and reviewId are numeric and rating is a valid rating (likely 1-5)
$numericValidations = [
    $validator->validateNumeric($userId, 'User ID'),
    $validator->validateNumeric($reviewId, 'Review ID'),
    $validator->validateRating($rating)
];
// Check each numeric validation
foreach ($numericValidations as $validation) {
    if (!$validation['success']) {
        Logger::log("Validation failed: {$validation['message']}");
        http_response_code(400);
        echo json_encode($validation);
        exit;
    }
}

// Validate that the review exists and belongs to the user making the update
$reviewValidation = $validator->validateReviewExists($reviewId, $userId);
if (!$reviewValidation['success']) {
    Logger::log("Validation failed: {$reviewValidation['message']}");
    http_response_code(400);
    echo json_encode($reviewValidation);
    exit;
}

try {
    // Instantiate ReviewModel to perform update
    $reviewModel = new ReviewModel();

    // Call editReview method with validated data to update the review record
    $result = $reviewModel->editReview($userId, $reviewId, $rating, $title, $review);

    // Log the result for debugging
    Logger::log("editReview result: " . json_encode($result));

    // Respond with HTTP 200 OK if success, otherwise 400 Bad Request
    http_response_code($result['success'] ? 200 : 400);
    echo json_encode($result);
} catch (Exception $e) {
    // Log any exceptions and respond with HTTP 500 Internal Server Error
    Logger::log("Exception in editReview: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: {$e->getMessage()}"]);
}

exit;
?>
