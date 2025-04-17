<?php
//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx
// Fetches bookings for a specific user.

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php";
require_once __DIR__ . "/inc_bookingModel.php";

Logger::log("getUserBooking API Started - Method: {$_SERVER['REQUEST_METHOD']}");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for getUserBooking");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$userId = isset($_GET['user_id']) ? trim($_GET['user_id']) : '';
if (empty($userId) || !is_numeric($userId)) {
    Logger::log("Invalid or missing user_id: '$userId'");
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Valid numeric user_id is required"]);
    exit;
}

$userId = (int)$userId;
Logger::log("Fetching bookings for user_id: $userId");

$bookingModel = new BookingModel();
$result = $bookingModel->getUserBookings($userId);

if ($result['success']) {
    Logger::log("Bookings fetched for user_id: $userId - " . (empty($result['data']) ? "No bookings found" : count($result['data']) . " bookings"));
    http_response_code(200);
    echo json_encode($result);
} else {
    Logger::log("Error fetching bookings for user_id: $userId - {$result['message']}");
    http_response_code(400);
    echo json_encode($result);
}
exit;
?>