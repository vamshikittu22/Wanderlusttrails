<?php
// Backend/config/booking/editBooking.php

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

file_put_contents(__DIR__ . "/../logs/debug.log", "editBooking API Started - Method: " . $_SERVER['REQUEST_METHOD'] . " at " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    file_put_contents(__DIR__ . "/../logs/debug.log", "Handling OPTIONS request for editBooking\n", FILE_APPEND);
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

require_once __DIR__ . "/inc_bookingModel.php";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['booking_id']) || !isset($data['user_id']) || !isset($data['changes']) || 
        !is_numeric($data['booking_id']) || !is_numeric($data['user_id'])) {
        file_put_contents(__DIR__ . "/../logs/debug.log", "Missing or invalid parameters: " . json_encode($data) . "\n", FILE_APPEND);
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Valid booking_id, user_id, and changes are required"]);
        exit;
    }

    $bookingId = (int)$data['booking_id'];
    $userId = (int)$data['user_id'];
    $changes = $data['changes']; // Now includes from, to, hotel

    $bookingModel = new BookingModel();
    $result = $bookingModel->editBooking($bookingId, $userId, $changes);
    
    file_put_contents(__DIR__ . "/../logs/debug.log", "Edit result for booking_id $bookingId: " . json_encode($result) . "\n", FILE_APPEND);
    http_response_code($result['success'] ? 200 : 400);
    echo json_encode($result);
    exit;
}

file_put_contents(__DIR__ . "/../logs/debug.log", "Invalid Method: " . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
exit;
?>