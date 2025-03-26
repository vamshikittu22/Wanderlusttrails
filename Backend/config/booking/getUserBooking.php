<?php
// backend/booking/getUserBooking.php

/*******
 * API Endpoint to Fetch User Bookings for WanderlustTrails
 *******/

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

file_put_contents(__DIR__ . "/../logs/debug.log", "getUserBooking API Started - Method: " . $_SERVER['REQUEST_METHOD'] . " at " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    file_put_contents(__DIR__ . "/../logs/debug.log", "Handling OPTIONS\n", FILE_APPEND);
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

require_once __DIR__ . "/inc_bookingModel.php";

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = $_GET['user_id'] ?? '';
    if (empty($userId)) {
        file_put_contents(__DIR__ . "/../logs/debug.log", "Missing user_id\n", FILE_APPEND);
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "User ID is required"]);
        exit;
    }

    file_put_contents(__DIR__ . "/../logs/debug.log", "Fetching bookings for user_id: $userId\n", FILE_APPEND);
    $bookingModel = new BookingModel();
    $result = $bookingModel->getUserBookings($userId);

    if ($result['success']) {
        http_response_code(200);
    } else {
        http_response_code(400);
    }
    echo json_encode($result);
    exit;
}

file_put_contents(__DIR__ . "/../logs/debug.log", "Invalid Method: " . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
exit;
?>