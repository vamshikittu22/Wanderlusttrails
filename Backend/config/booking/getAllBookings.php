<?php
//path: Wanderlusttrails/Backend/config/booking/getAllBookings.php
// Fetches all bookings for admin.

//cors headers
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Max-Age: 86400");

require_once __DIR__ . "/../inc_logger.php"; //logger class
require_once __DIR__ . "/../inc_validationClass.php"; //validation class
require_once __DIR__ . "/inc_bookingModel.php"; //bookingmodel

Logger::log("getAllBookings API Started - Method: {$_SERVER['REQUEST_METHOD']}");
//preflight test
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for getAllBookings");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}
// Ensure the request method is GET for fetching all bookings
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$bookingModel = new BookingModel(); // Create an instance of the BookingModel for database operations
$result = $bookingModel->getAllBookings();  // Call the getAllBookings method to fetch all bookings

Logger::log("getAllBookings result: " . (empty($result['data']) ? "No bookings found" : count($result['data']) . " bookings"));
http_response_code($result['success'] ? 200 : 500);
echo json_encode($result); //return success response or error response based on the result
exit;
?>
