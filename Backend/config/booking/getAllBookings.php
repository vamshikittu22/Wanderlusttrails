<?php
// Backend/config/booking/getAllBookings.php

/*******
 * API Endpoint to Fetch All Bookings for WanderlustTrails Admin
 *******/

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Use the same log path as getUserBooking.php
file_put_contents(__DIR__ . "/../logs/debug.log", "getAllBookings API Started - Method: " . $_SERVER['REQUEST_METHOD'] . " at " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    file_put_contents(__DIR__ . "/../logs/debug.log", "Handling OPTIONS\n", FILE_APPEND);
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

require_once __DIR__ . "/inc_bookingModel.php";

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $bookingModel = new BookingModel();
    $result = $bookingModel->getAllBookings();

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