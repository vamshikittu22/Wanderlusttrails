<?php
// Path: Wanderlusttrails/Backend/config/reviews/addComment.php
// Adds a comment to a review in the database via POST request, expects JSON data.

// Set CORS header to allow requests only from the frontend app running on localhost:5173
header("Access-Control-Allow-Origin: http://localhost:5173");

// Specify that the response will be JSON and UTF-8 encoded
header("Content-Type: application/json; charset=UTF-8");

// Allow HTTP POST and OPTIONS methods (OPTIONS for CORS preflight)
header("Access-Control-Allow-Methods: POST, OPTIONS");

// Allow Content-Type header in incoming requests
header("Access-Control-Allow-Headers: Content-Type");

// Include the logger to track API activity and errors
require_once __DIR__ . "/../inc_logger.php";

// Log that the API endpoint was hit and which method was used
Logger::log("addComment API Started - Method: {$_SERVER['REQUEST_METHOD']}");

// Handle preflight CORS OPTIONS request by responding with 200 OK and exit
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for addComment");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

try {
    // Include the review model for database interactions and validation class for input checks
    require_once __DIR__ . "/inc_reviewModel.php";
    require_once __DIR__ . "/../inc_validationClass.php";
} catch (Exception $e) {
    // Log and respond with 500 if includes fail
    Logger::log("Error loading required files: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: Unable to load required files"]);
    exit;
}

// Only allow POST requests for adding comments
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Get raw JSON input from request body
$rawInput = file_get_contents("php://input");

// Decode JSON input to associative array
$data = json_decode($rawInput, true);

// Validate JSON decoding success
if (!$data) {
    Logger::log("Invalid JSON input: " . ($rawInput ?: 'empty'));
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid or missing JSON data"]);
    exit;
}

// Extract fields with defaults
$userId = $data['userId'] ?? '';
$reviewId = $data['reviewId'] ?? '';
$comment = $data['comment'] ?? '';
$parentId = $data['parentId'] ?? null;

// Log received input (truncate comment to first 100 chars for log brevity)
Logger::log("Received data - userId: $userId, reviewId: $reviewId, parentId: " . ($parentId ?? 'null') . ", comment: " . substr($comment, 0, 100));

// Instantiate validation class
$validator = new ValidationClass();

// Validate required fields presence
$requiredFields = ['userId', 'reviewId', 'comment'];
$requiredValidation = $validator->validateRequiredFields($data, $requiredFields);
if (!$requiredValidation['success']) {
    Logger::log("Validation failed: {$requiredValidation['message']}");
    http_response_code(400);
    echo json_encode($requiredValidation);
    exit;
}

// Validate that userId and reviewId are numeric and valid
$numericValidations = [
    $validator->validateNumeric($userId, 'User ID'),
    $validator->validateNumeric($reviewId, 'Review ID')
];
foreach ($numericValidations as $validation) {
    if (!$validation['success']) {
        Logger::log("Validation failed: {$validation['message']}");
        http_response_code(400);
        echo json_encode($validation);
        exit;
    }
}

// Validate user existence in database
$userValidation = $validator->validateUserExists($userId);
if (!$userValidation['success']) {
    Logger::log("Validation failed: {$userValidation['message']}");
    http_response_code(400);
    echo json_encode($userValidation);
    exit;
}

// Optionally, validate admin role if comments require admin permissions
// $adminValidation = $validator->validateAdminRole($userId);
// if (!$adminValidation['success']) {
//     Logger::log("Validation failed: {$adminValidation['message']}");
//     http_response_code(400);
//     echo json_encode($adminValidation);
//     exit;
// }

// Validate that the review exists
$reviewValidation = $validator->validateReviewId($reviewId);
if (!$reviewValidation['success']) {
    Logger::log("Validation failed: {$reviewValidation['message']}");
    http_response_code(400);
    echo json_encode($reviewValidation);
    exit;
}

// Validate parent comment if parentId is provided (must belong to the same review)
$parentValidation = $validator->validateParentComment($parentId, $reviewId);
if (!$parentValidation['success']) {
    Logger::log("Validation failed: {$parentValidation['message']}");
    http_response_code(400);
    echo json_encode($parentValidation);
    exit;
}

try {
    // Instantiate ReviewModel and attempt to add the comment
    $reviewModel = new ReviewModel();
    $result = $reviewModel->addComment($userId, $reviewId, $comment, $parentId);

    // Log result for debugging
    Logger::log("addComment result: " . json_encode($result));

    // Respond with 201 Created if success, else 400 Bad Request
    http_response_code($result['success'] ? 201 : 400);
    echo json_encode($result);
} catch (Exception $e) {
    // Log any exceptions and return 500 error
    Logger::log("Exception in addComment: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: {$e->getMessage()}"]);
}

exit;
?>
