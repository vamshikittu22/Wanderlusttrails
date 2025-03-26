<?php
// backend/booking/createBooking.php

/*******
 * API Endpoint to Create Bookings for WanderlustTrails
 *******/

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

file_put_contents(__DIR__ . "/../logs/debug.log", "createBooking API Started - Method: " . $_SERVER['REQUEST_METHOD'] . " at " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    file_put_contents(__DIR__ . "/../logs/debug.log", "Handling OPTIONS\n", FILE_APPEND);
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

require_once __DIR__ . "/inc_bookingModel.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) {
        file_put_contents(__DIR__ . "/../logs/debug.log", "Invalid JSON\n", FILE_APPEND);
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid JSON data"]);
        exit;
    }

    file_put_contents(__DIR__ . "/../logs/debug.log", "POST Data: " . print_r($data, true) . "\n", FILE_APPEND);
    $bookingModel = new BookingModel();
    $result = $bookingModel->createBooking($data);

    if ($result['success']) {
        http_response_code(201);
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