<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php"; // Include the logger file
require_once __DIR__ . "/../payment/inc_paymentModel.php"; // Include the PaymentClass file

Logger::log("getPaymentDetails API Started - Method: {$_SERVER['REQUEST_METHOD']}");
// Check if the request method is OPTIONS (preflight request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}
// Check if the request method is GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$bookingId = isset($_GET['booking_id']) ? intval($_GET['booking_id']) : null; // Get the booking ID from the query parameters
Logger::log("Parsed: booking_id=$bookingId");

try {
    $paymentClass = new PaymentClass(); // Create an instance of the PaymentClass
    $result = $paymentClass->getPaymentDetails($bookingId); // Call the getPaymentDetails method to retrieve payment details
    http_response_code(200);
    echo json_encode($result); // Return the result as JSON
} catch (Exception $e) {
    Logger::log("Exception: " . $e->getMessage());
    http_response_code($e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]); // Return error message
}

exit;
?>
