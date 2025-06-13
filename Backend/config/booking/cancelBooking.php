<?php
//path: Wanderlusttrails/Backend/config/booking/cancelBooking.php
// Cancels a user’s booking.

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Max-Age: 86400");

require_once __DIR__ . "/../inc_logger.php"; // Include the logger for logging purposes
require_once __DIR__ . "/../inc_validationClass.php"; // Include the validation class for input validation
require_once __DIR__ . "/inc_bookingModel.php"; // Include the booking model for database operations

Logger::log("cancelBooking API Started - Method: {$_SERVER['REQUEST_METHOD']}");
// Check if the request method is OPTIONS (preflight request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for cancelBooking");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}
// Check if the request method is POST (actual request)
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}
$data = json_decode(file_get_contents("php://input"), true); // Decode the JSON request body
$validator = new ValidationClass(); // Create an instance of the ValidationClass for input validation

// Validate required fields
$requiredFields = ['booking_id', 'user_id'];  // Define the required fields for the request

$result = $validator->validateRequiredFields($data, $requiredFields);  //call the validateRequiredFields method to check if all required fields are present
if (!$result['success']) {
    Logger::log($result['message']);
    http_response_code(400);
    echo json_encode($result);
    exit;
}

// Validate booking_id
$result = $validator->validateNumeric($data['booking_id'], 'booking_id'); // Validate the booking_id field to ensure it is numeric
if (!$result['success']) { 
    Logger::log($result['message']);
    http_response_code(400);
    echo json_encode($result);
    exit;
}

// Validate user_id
$result = $validator->validateNumeric($data['user_id'], 'user_id'); // Validate the user_id field to ensure it is numeric
if (!$result['success']) {
    Logger::log($result['message']);
    http_response_code(400);
    echo json_encode($result);
    exit;
}

$bookingId = (int)$data['booking_id']; // Cast booking_id to integer for processing
$userId = (int)$data['user_id']; // Cast user_id to integer for processing
Logger::log("Processing cancel request for booking_id: $bookingId, user_id: $userId");


$bookingModel = new BookingModel(); // Create an instance of the BookingModel for database operations
$result = $bookingModel->cancelBooking($bookingId, $userId); // Call the cancelBooking method to process the cancellation

Logger::log("Cancel result for booking_id: $bookingId - " . ($result['success'] ? "Success: {$result['message']}" : "Failed: {$result['message']}"));
http_response_code($result['success'] ? 200 : 400);
echo json_encode($result); // Return the result as JSON response
exit;
?>
