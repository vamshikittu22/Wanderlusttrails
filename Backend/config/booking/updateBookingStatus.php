<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Max-Age: 86400");

require_once __DIR__ . "/../inc_logger.php"; // Include the logger for logging purposes
require_once __DIR__ . "/../inc_validationClass.php"; // Include the validation class for input validation
require_once __DIR__ . "/inc_bookingModel.php"; // Include the booking model for database operations

Logger::log("updateBookingStatus API Started - Method: {$_SERVER['REQUEST_METHOD']}");
//preflight test
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for updateBookingStatus");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}
// Ensure the request method is POST for actual booking status update
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true); // Decode the JSON request body
Logger::log("Raw input: " . json_encode($data));

$validator = new ValidationClass(); // Create an instance of the ValidationClass for input validation

// Validate required fields
$requiredFields = ['booking_id', 'user_id', 'status'];
$result = $validator->validateRequiredFields($data, $requiredFields); // Validate required fields method
if (!$result['success']) {
    Logger::log($result['message']);
    http_response_code(400);
    echo json_encode($result);
    exit;
}

// Validate booking_id
$result = $validator->validateNumeric($data['booking_id'], 'booking_id'); // Validatenumeric method
if (!$result['success']) {
    Logger::log($result['message']);
    http_response_code(400);
    echo json_encode($result);
    exit;
}

// Validate user_id
$result = $validator->validateNumeric($data['user_id'], 'user_id'); // Validatenumeric method
if (!$result['success']) {
    Logger::log($result['message']);
    http_response_code(400);
    echo json_encode($result);
    exit;
}

// Validate status
$result = $validator->validateStatus($data['status']); // Validate status method
if (!$result['success']) {
    Logger::log($result['message']);
    http_response_code(400);
    echo json_encode($result);
    exit;
}

// Validate fields if present in pending_changes
//insurance
// if (isset($data['pending_changes']['insurance'])) {
//     $insurance = (int)$data['pending_changes']['insurance'];
//     if ($insurance !== 0 && $insurance !== 1) {
//         Logger::log("Invalid insurance value: $insurance");
//         http_response_code(400);
//         echo json_encode(["success" => false, "message" => "Invalid insurance value"]);
//         exit;
//     }
// }

//insurance_type
if (isset($data['pending_changes']['insurance_type'])) {
    $insurance_type = $data['pending_changes']['insurance_type'];
    $validInsuranceTypes = ['none', 'basic', 'premium', 'elite'];
    if (!in_array($insurance_type, $validInsuranceTypes)) {
        Logger::log("Invalid insurance_type option: $insurance_type");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid insurance_type option"]);
        exit;
    }
}

$bookingId = (int)$data['booking_id'];  // Cast booking_id to integer for processing
$userId = (int)$data['user_id']; // Cast user_id to integer for processing
$status = (string)$data['status']; // Cast status to string for processing

Logger::log("Processing update for booking_id: $bookingId, user_id: $userId, status: '$status' (type: " . gettype($status) . ")");

// Map frontend fields to the expected format
$changes = []; // Initialize changes array to store mapped fields
$flightDetailsFields = ['roundTrip', 'from', 'to', 'airline', 'flightClass', 'flightTime', 'carRental']; // Define flight details fields
$hotelDetailsFields = ['hotelStars', 'amenities']; // Define hotel details fields
$itineraryDetailsFields = ['activities']; // Define itinerary details fields

// Iterate through the data and map fields to the expected format
foreach ($data as $key => $value) {
    if (in_array($key, $flightDetailsFields)) {
        $changes["flight_details.$key"] = $value; 
    } elseif (in_array($key, $hotelDetailsFields)) {
        $changes["hotel_details.$key"] = $value;
    } elseif (in_array($key, $itineraryDetailsFields)) {
        $changes["itinerary_details.$key"] = $value;
    // } elseif ($key === 'insurance') {
    //     $changes['insurance'] = $value; // Map insurance directly
    } elseif ($key === 'insurance_type') {
        $changes['insurance_type'] = $value; // Map insurance_type directly
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

// Include pending_changes in the input for updateBookingStatus
$data['pending_changes'] = $changes;

$bookingModel = new BookingModel(); // Create an instance of the BookingModel for database operations
$bookingModel->setInput($data); // Set the input data for the booking model
$result = $bookingModel->updateBookingStatus($bookingId, $status); // Call the updateBookingStatus method to process the update

Logger::log("updateBookingStatus result for booking_id: $bookingId - " . ($result['success'] ? "Success: {$result['message']}" : "Failed: {$result['message']}"));
http_response_code($result['success'] ? 200 : 400);
echo json_encode($result); // Return success or error response based on the result of the updateBookingStatus method
exit;
?>
