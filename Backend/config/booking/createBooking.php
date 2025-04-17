<?php
//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx
// This file handles the creation of a booking in the system
// It validates the input data, checks for required fields, and interacts with the BookingModel to create a booking

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php";
Logger::log("createBooking API Started - Method: {$_SERVER['REQUEST_METHOD']}");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

require_once __DIR__ . "/inc_bookingModel.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) {
        Logger::log("Invalid JSON");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid JSON data"]);
        exit;
    }

    Logger::log("POST Data: " . json_encode($data));

    // Required fields check, end_date optional for flight_hotel one-way
    if (!isset($data['user_id']) || !isset($data['booking_type']) || 
        !isset($data['start_date']) || !isset($data['persons']) || 
        !is_numeric($data['user_id']) || !is_numeric($data['persons']) || 
        !in_array($data['booking_type'], ['package', 'flight_hotel'])) {
        
        Logger::log("Missing or invalid required parameters: " . json_encode($data));
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Valid user_id, booking_type, start_date, and persons are required"]);
        exit;
    }

    $isFlightHotel = $data['booking_type'] === 'flight_hotel';
    $endDateProvided = isset($data['end_date']) && $data['end_date'] !== null;

    // Require end_date for package bookings only
    if ($data['booking_type'] === 'package' && !$endDateProvided) {
        Logger::log("Missing end_date for package booking");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "end_date is required for package bookings"]);
        exit;
    }

    // For flight_hotel, end_date is optional (one-way), but validate if provided
    $bookingData = [
        'user_id' => (int)$data['user_id'],
        'booking_type' => $data['booking_type'],
        'package_id' => isset($data['package_id']) && is_numeric($data['package_id']) ? (int)$data['package_id'] : null,
        'flight_details' => $isFlightHotel && isset($data['flight_details']) ? $data['flight_details'] : null,
        'hotel_details' => $isFlightHotel && isset($data['hotel_details']) ? $data['hotel_details'] : null,
        'start_date' => $data['start_date'],
        'end_date' => $endDateProvided ? $data['end_date'] : null, // Allow null for one-way
        'persons' => (int)$data['persons'],
    ];

    if ($data['booking_type'] === 'package' && !$bookingData['package_id']) {
        Logger::log("Missing package_id for package booking");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "package_id is required for package bookings"]);
        exit;
    }

    if ($isFlightHotel && (!$bookingData['flight_details'] || !$bookingData['hotel_details'])) {
        Logger::log("Missing flight_details or hotel_details for flight_hotel booking");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "flight_details and hotel_details are required for flight_hotel bookings"]);
        exit;
    }

    // Validate dates if end_date is provided
    if ($bookingData['end_date']) {
        $start = new DateTime($bookingData['start_date']);
        $end = new DateTime($bookingData['end_date']);
        if ($start >= $end) {
            Logger::log("Invalid dates: start_date >= end_date");
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Start date must be before end date"]);
            exit;
        }
    }

    try {
        $bookingModel = new BookingModel();
        $result = $bookingModel->createBooking($bookingData);
        Logger::log("Create booking result: " . json_encode($result));
        http_response_code($result['success'] ? 201 : 500);
        echo json_encode($result);
    } catch (Exception $e) {
        Logger::log("Exception: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
    }
    exit;
}

Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
exit;
?>