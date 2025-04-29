<?php
//path: Wanderlusttrails/Backend/config/booking/updateBookingStatus.php
// Handles booking updates by storing changes in pending_changes for admin review.

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Max-Age: 86400");

require_once __DIR__ . "/../inc_logger.php";
require_once __DIR__ . "/../inc_validationClass.php";
require_once __DIR__ . "/inc_bookingModel.php";

Logger::log("updateBookingStatus API Started - Method: {$_SERVER['REQUEST_METHOD']}");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for updateBookingStatus");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
Logger::log("Raw input: " . json_encode($data));

$validator = new ValidationClass();

// Validate required fields
$requiredFields = ['booking_id', 'user_id', 'status'];
$result = $validator->validateRequiredFields($data, $requiredFields);
if (!$result['success']) {
    Logger::log($result['message']);
    http_response_code(400);
    echo json_encode($result);
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

// Validate status
$result = $validator->validateStatus($data['status']);
if (!$result['success']) {
    Logger::log($result['message']);
    http_response_code(400);
    echo json_encode($result);
    exit;
}

$bookingId = (int)$data['booking_id'];
$userId = (int)$data['user_id'];
$status = (string)$data['status'];

Logger::log("Processing update for booking_id: $bookingId, user_id: $userId, status: '$status' (type: " . gettype($status) . ")");

// Map frontend fields to the expected format for flight_details and hotel_details
$changes = [];
$flightDetailsFields = ['roundTrip', 'from', 'to', 'airline', 'flightClass', 'flightTime', 'insurance', 'carRental'];
$hotelDetailsFields = ['hotelStars', 'amenities'];

foreach ($data as $key => $value) {
    if (in_array($key, $flightDetailsFields)) {
        $changes["flight_details.$key"] = $value;
    } elseif (in_array($key, $hotelDetailsFields)) {
        $changes["hotel_details.$key"] = $value;
    } elseif (!in_array($key, ['booking_id', 'user_id', 'status'])) {
        // Map startDate and endDate to start_date and end_date
        if ($key === 'startDate') {
            $changes['start_date'] = $value;
        } elseif ($key === 'endDate') {
            $changes['end_date'] = $value;
        } else {
            $changes[$key] = $value;
        }
    }
}

$bookingModel = new BookingModel();
$bookingModel->setInput($data); // Pass the raw input data
$result = $bookingModel->updateBookingStatus($bookingId, $status);

Logger::log("updateBookingStatus result for booking_id: $bookingId - " . ($result['success'] ? "Success: {$result['message']}" : "Failed: {$result['message']}"));
http_response_code($result['success'] ? 200 : 400);
echo json_encode($result);
exit;
?>