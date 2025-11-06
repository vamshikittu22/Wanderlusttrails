<?php
// Path: Wanderlusttrails/Backend/config/reviews/writeReview.php
// Writes a review to the database via POST request, expects JSON data.

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php"; // Include the logger for logging purposes

Logger::log("writeReview API Started - Method: {$_SERVER['REQUEST_METHOD']}");
// Preflight test
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for writeReview");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

try {
    require_once __DIR__ . "/inc_reviewModel.php"; // Include the review model for database operations
    require_once __DIR__ . "/../inc_validationClass.php"; // Include the validation class
} catch (Exception $e) {
    Logger::log("Error loading required files: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: Unable to load required files"]);
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

if (!$data) { // Validate JSON decoding success
    Logger::log("Invalid JSON input: " . ($rawInput ?: 'empty'));
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid or missing JSON data"]);
    exit;
}

// Get the data from the request
$userId = $data['userId'] ?? '';
$bookingId = $data['bookingId'] ?? '';
$rating = $data['rating'] ?? '';
$title = $data['title'] ?? '';
$review = $data['review'] ?? '';

Logger::log("Received data - userId: $userId, bookingId: $bookingId, rating: $rating, title: " . substr($title, 0, 50) . ", review: " . substr($review, 0, 100));

// Initialize validation class
$validator = new ValidationClass();

// Validate required fields
$requiredFields = ['userId', 'bookingId', 'rating', 'title', 'review'];
$requiredValidation = $validator->validateRequiredFields($data, $requiredFields);
if (!$requiredValidation['success']) {
    Logger::log("Validation failed: {$requiredValidation['message']}");
    http_response_code(400);
    echo json_encode($requiredValidation);
    exit;
}

// Validate numeric fields
$numericValidations = [
    $validator->validateNumeric($userId, 'User ID'), // Ensure userId is numeric and positive
    $validator->validateNumeric($bookingId, 'Booking ID'), // Ensure bookingId is numeric and positive
    $validator->validateRating($rating) // Ensure rating is between 1 and 5
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

// Validate booking exists and belongs to user
$bookingValidation = $validator->validateBookingExists($bookingId, $userId);
if (!$bookingValidation['success']) {
    Logger::log("Validation failed: {$bookingValidation['message']}");
    http_response_code(400);
    echo json_encode($bookingValidation);
    exit;
}

// Validate review does not already exist
$reviewNotExistsValidation = $validator->validateReviewNotExists($bookingId, $userId);
if (!$reviewNotExistsValidation['success']) {
    Logger::log("Validation failed: {$reviewNotExistsValidation['message']}");
    http_response_code(400);
    echo json_encode($reviewNotExistsValidation);
    exit;
}

try {
    $reviewModel = new ReviewModel(); // Create an instance of the ReviewModel class
    $result = $reviewModel->writeReview($userId, $bookingId, $rating, $title, $review); // Call the writeReview method to save the review

    Logger::log("writeReview result: " . json_encode($result));

    http_response_code($result['success'] ? 201 : 400);
    echo json_encode($result); // Send the response back to the client
} catch (Exception $e) {
    Logger::log("Exception in writeReview: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: {$e->getMessage()}"]); // Send an error response if an exception occurs
}
exit;
?>
