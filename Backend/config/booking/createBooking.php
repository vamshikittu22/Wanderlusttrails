<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
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

    if (!isset($data['user_id']) || !isset($data['booking_type']) || 
        !isset($data['start_date']) || !isset($data['end_date']) || 
        !isset($data['persons']) || !isset($data['total_price']) || 
        !is_numeric($data['user_id']) || !is_numeric($data['persons']) || 
        !in_array($data['booking_type'], ['package', 'flight_hotel'])) {
        file_put_contents(__DIR__ . "/../logs/debug.log", "Missing or invalid required parameters: " . json_encode($data) . "\n", FILE_APPEND);
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Valid user_id, booking_type, start_date, end_date, persons, and total_price are required"]);
        exit;
    }

    $bookingData = [
        'user_id' => (int)$data['user_id'],
        'booking_type' => $data['booking_type'],
        'package_id' => isset($data['package_id']) && is_numeric($data['package_id']) ? (int)$data['package_id'] : null,
        'flight_details' => $data['booking_type'] === 'flight_hotel' && isset($data['flight_details']) ? $data['flight_details'] : null,
        'hotel_details' => $data['booking_type'] === 'flight_hotel' && isset($data['hotel_details']) ? $data['hotel_details'] : null,
        'start_date' => $data['start_date'],
        'end_date' => $data['end_date'],
        'persons' => (int)$data['persons'],
        'total_price' => (float)$data['total_price']
    ];

    if ($bookingData['booking_type'] === 'package' && !$bookingData['package_id']) {
        file_put_contents(__DIR__ . "/../logs/debug.log", "Missing package_id for package booking\n", FILE_APPEND);
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "package_id is required for package bookings"]);
        exit;
    }
    if ($bookingData['booking_type'] === 'flight_hotel' && (!$bookingData['flight_details'] || !$bookingData['hotel_details'])) {
        file_put_contents(__DIR__ . "/../logs/debug.log", "Missing flight_details or hotel_details for flight_hotel booking\n", FILE_APPEND);
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "flight_details and hotel_details are required for flight_hotel bookings"]);
        exit;
    }

    $bookingModel = new BookingModel();
    $result = $bookingModel->createBooking($bookingData);

    file_put_contents(__DIR__ . "/../logs/debug.log", "Create booking result: " . json_encode($result) . "\n", FILE_APPEND);
    http_response_code($result['success'] ? 201 : 500);
    echo json_encode($result);
    exit;
}

file_put_contents(__DIR__ . "/../logs/debug.log", "Invalid Method: " . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
exit;
?>
