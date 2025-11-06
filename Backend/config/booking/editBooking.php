<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Max-Age: 86400");

require_once __DIR__ . "/../inc_logger.php";
require_once __DIR__ . "/../inc_validationClass.php";
require_once __DIR__ . "/inc_bookingModel.php";

Logger::log("editBooking API Started - Method: {$_SERVER['REQUEST_METHOD']}");

// Handle CORS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for editBooking");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}
// Ensure the request method is POST for actual booking editing
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$validator = new ValidationClass(); // Create an instance of the ValidationClass for input validation

// Validate required fields
$requiredFields = ['booking_id', 'user_id', 'changes'];
$result = $validator->validateRequiredFields($data, $requiredFields); // Validate required fields method
if (!$result['success']) {
    Logger::log($result['message']);
    http_response_code(400);
    echo json_encode($result);
    exit;
}


if (empty($data['changes'])) {
    Logger::log("Changes cannot be empty");
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Changes cannot be empty"]);
    exit;
}

// Validate booking_id
$result = $validator->validateNumeric($data['booking_id'], 'booking_id');
if (!$result['success']) {
    Logger::log($result['message']);
    http_response_code(400);
    echo json_encode($result);
    exit;
}

// Validate user_id
$result = $validator->validateNumeric($data['user_id'], 'user_id');
if (!$result['success']) {
    Logger::log($result['message']);
    http_response_code(400);
    echo json_encode($result);
    exit;   
}

// Validate insurance_type if present in changes
if (isset($data['changes']['insurance_type'])) {
    $insurance_type = $data['changes']['insurance_type'];
    $validInsuranceTypes = ['none', 'basic', 'premium', 'elite'];
    if (!in_array($insurance_type, $validInsuranceTypes)) {
        Logger::log("Invalid insurance_type option in changes: $insurance_type");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid insurance_type option in changes"]);
        exit;
    }
}

$bookingId = (int)$data['booking_id']; // Cast booking_id to integer for processing
$userId = (int)$data['user_id']; // Cast user_id to integer for processing
$changes = $data['changes']; // Get changes from the request data
Logger::log("Processing edit request for booking_id: $bookingId, user_id: $userId, changes: " . json_encode($changes));

$bookingModel = new BookingModel(); // Create an instance of the BookingModel for database operations
$result = $bookingModel->editBooking($bookingId, $userId, $changes); // Call the editBooking method to process the changes

Logger::log("Edit result for booking_id: $bookingId - " . ($result['success'] ? "Success: {$result['message']}" : "Failed: {$result['message']}"));
http_response_code($result['success'] ? 200 : 400);
echo json_encode($result); // Return the result as JSON response
exit;
?>
