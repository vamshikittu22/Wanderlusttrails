<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Accept, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 3600");

require_once __DIR__ . "/../inc_logger.php";
require_once __DIR__ . "/../inc_validationClass.php";
require_once __DIR__ . "/inc_bookingModel.php";

Logger::log("createBooking API Started - Method: {$_SERVER['REQUEST_METHOD']}");

// Handle CORS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request");
    http_response_code(200);
    exit;
}

// Ensure the request method is POST for actual booking creation
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}
// Decode the JSON request body
$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    Logger::log("Invalid JSON");
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON data"]);
    exit;
}

Logger::log("POST Data: " . json_encode($data)); //log

$validator = new ValidationClass(); // Create an instance of the ValidationClass for input validation

// Validate required fields
$requiredFields = ['user_id', 'booking_type', 'start_date', 'persons'];
$result = $validator->validateRequiredFields($data, $requiredFields); // Validaterequiredfields method
if (!$result['success']) {
    Logger::log($result['message']);
    http_response_code(400);
    echo json_encode($result);
    exit;
}

// Validate user_id
$result = $validator->validateNumeric($data['user_id'], 'user_id'); //validatenumeric method
if (!$result['success']) {
    Logger::log($result['message']);
    http_response_code(400);
    echo json_encode($result);
    exit;
}

// Validate persons
$result = $validator->validateNumeric($data['persons'], 'persons'); //validatenumeric method
if (!$result['success']) {
    Logger::log($result['message']);
    http_response_code(400);
    echo json_encode($result);
    exit;
}

// Validate booking_type
$result = $validator->validateBookingType($data['booking_type']); //validateBookingType method
if (!$result['success']) {
    Logger::log($result['message']);
    http_response_code(400);
    echo json_encode($result);
    exit;
}

// Validate insurance fields
// $insurance = isset($data['insurance']) ? (int)$data['insurance'] : 0; // Expect 0 or 1
$insurance_type = isset($data['insurance_type']) ? $data['insurance_type'] : 'none';
// $validInsuranceTypes = ['none', 'basic', 'premium', 'elite']; // Define valid insurance types

$isFlightHotel = $data['booking_type'] === 'flight_hotel'; // Check if booking type is flight_hotel
$isItinerary = $data['booking_type'] === 'itinerary'; // Check if booking type is itinerary
$endDateProvided = isset($data['end_date']) && $data['end_date'] !== null; // Check if end_date is provided

$bookingData = [
    'user_id' => (int)$data['user_id'],
    'booking_type' => $data['booking_type'],
    'package_id' => isset($data['package_id']) && is_numeric($data['package_id']) ? (int)$data['package_id'] : null,
    'itinerary_details' => $isItinerary && isset($data['itinerary_details']) ? $data['itinerary_details'] : null,
    'flight_details' => $isFlightHotel && isset($data['flight_details']) ? $data['flight_details'] : null,
    'hotel_details' => $isFlightHotel && isset($data['hotel_details']) ? $data['hotel_details'] : null,
    'start_date' => $data['start_date'],
    'end_date' => $endDateProvided ? $data['end_date'] : null,
    'persons' => (int)$data['persons'],
    // 'insurance' => $insurance, // 0 or 1
    'insurance_type' => $insurance_type, // insurance_type
    'total_price' => isset($data['total_price']) ? (float)$data['total_price'] : null,
]; // Prepare booking data for processing
 
try {
    $bookingModel = new BookingModel(); // Create an instance of the BookingModel for database operations
    $result = $bookingModel->createBooking($bookingData); // Call the createBooking method to process the booking creation
    Logger::log("Create booking result: " . json_encode($result));
    http_response_code($result['success'] ? 201 : 500);
    echo json_encode($result); 
} catch (Exception $e) {
    // Log the exception and return a server error response
    Logger::log("Exception: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}
exit;
?>
