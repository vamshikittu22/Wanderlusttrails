<?php
//path: Wanderlusttrails/Backend/config/booking/getUserBooking.php
// Fetches bookings for a specific user.

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php";
require_once __DIR__ . "/../inc_validationClass.php";
require_once __DIR__ . "/inc_bookingModel.php";

Logger::log("getUserBooking API Started - Method: {$_SERVER['REQUEST_METHOD']}");
//preflight test
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for getUserBooking");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}
 // Ensure the request method is GET for fetching user bookings
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$userId = isset($_GET['user_id']) ? trim($_GET['user_id']) : '';
$validator = new ValidationClass(); // Create an instance of the ValidationClass for input validation
$result = $validator->validateNumeric($userId, 'user_id'); // Validate user_id to ensure it is numeric
if (!$result['success']) {
    Logger::log($result['message']);
    http_response_code(400);
    echo json_encode($result);
    exit;
}

$userId = (int)$userId;     // Cast userId to integer 
Logger::log("Fetching bookings for user_id: $userId");

$bookingModel = new BookingModel(); // Create an instance of the BookingModel for database operations
$result = $bookingModel->getUserBookings($userId); // Call the getUserBookings method to fetch bookings for the specified user

if ($result['success']) {
    Logger::log("Bookings fetched for user_id: $userId - " . (empty($result['data']) ? "No bookings found" : count($result['data']) . " bookings"));
    http_response_code(200);
    echo json_encode($result); // Return success response with bookings data
} else {
    Logger::log("Error fetching bookings for user_id: $userId - {$result['message']}");
    http_response_code(400);
    echo json_encode($result); // Return error response if fetching bookings fails
}
exit;
?>
