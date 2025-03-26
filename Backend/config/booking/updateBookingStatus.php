<?php
// Backend/config/booking/updateBookingStatus.php

/*******
 * API Endpoint to Update Booking Status for WanderlustTrails Admin
 *******/

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$logFile = __DIR__ . "/../logs/debug.log";
file_put_contents($logFile, "updateBookingStatus API Started - Method: " . $_SERVER['REQUEST_METHOD'] . " at " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    file_put_contents($logFile, "Handling OPTIONS\n", FILE_APPEND);
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

require_once __DIR__ . "/inc_bookingModel.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    file_put_contents($logFile, "Raw input: " . file_get_contents("php://input") . "\n", FILE_APPEND);
    if (!$data || !isset($data['booking_id']) || !isset($data['status']) || !is_numeric($data['booking_id'])) {
        file_put_contents($logFile, "Invalid JSON or missing/invalid booking_id or status\n", FILE_APPEND);
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Valid booking ID and status are required"]);
        exit;
    }

    $bookingId = (int)$data['booking_id'];
    $status = $data['status'];
    $validStatuses = ['pending', 'confirmed', 'canceled'];
    if (!in_array($status, $validStatuses)) {
        file_put_contents($logFile, "Invalid status: $status\n", FILE_APPEND);
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid status. Use: pending, confirmed, or canceled"]);
        exit;
    }

    file_put_contents($logFile, "Updating status for booking_id: $bookingId to $status\n", FILE_APPEND);

    $bookingModel = new BookingModel();
    $result = $bookingModel->updateBookingStatus($bookingId, $status);

    if ($result['success']) {
        http_response_code(200);
    } else {
        http_response_code(400);
    }
    echo json_encode($result);
    exit;
}

file_put_contents($logFile, "Invalid Method: " . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
exit;
?>