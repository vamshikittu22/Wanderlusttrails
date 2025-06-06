<?php
// Path: Wanderlusttrails/Backend/config/reviews/getUserReviews.php
// Retrieves user reviews from the database via GET request, returns JSON response.

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php";  // Include the logger for logging purposes  

Logger::log("getUserReviews API Started - Method: {$_SERVER['REQUEST_METHOD']}");
// Preflight test for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for getUserReviews");
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
// Check if the request method is GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$userId = isset($_GET['user_id']) ? $_GET['user_id'] : ''; // Get the user_id from the query string
Logger::log("Received user_id: " . ($userId ?: 'none'));

// Initialize validation class
$validator = new ValidationClass();

// Validate userId
$userIdValidation = $validator->validateNumeric($userId, 'User ID'); // Ensure userId is numeric and positive
if (!$userIdValidation['success']) {
    Logger::log("Validation failed: {$userIdValidation['message']}");
    http_response_code(400);
    echo json_encode($userIdValidation);
    exit;
}

// Validate user exists
$userValidation = $validator->validateUserExists($userId);
if (!$userValidation['success']) {
    Logger::log("Validation failed: {$userValidation['message']}");
    http_response_code(400);
    echo json_encode($userValidation);
    exit;
}

$userId = (int)$userId; // Cast user_id to integer for safety
Logger::log("Fetching reviews for user_id: $userId");

try {
    $reviewModel = new ReviewModel(); // Create an instance of the ReviewModel class
    $result = $reviewModel->getUserReviews($userId); // Call the getUserReviews method to fetch reviews

    Logger::log("getUserReviews result: " . json_encode([
        'success' => $result['success'],
        'message' => $result['message'] ?? 'N/A',
        'data_count' => count($result['data'] ?? [])
    ]));

    http_response_code($result['success'] ? 200 : 500);
    echo json_encode($result); // Return the result as JSON
} catch (Exception $e) {
    Logger::log("Exception in getUserReviews: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: {$e->getMessage()}"]); // Send error response
}
exit;
?>