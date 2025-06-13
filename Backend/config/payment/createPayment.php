<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
 
require_once __DIR__ . "/../inc_logger.php"; // Include the logger file
require_once __DIR__ . "/inc_paymentModel.php"; // Include the PaymentClass file

Logger::log("createPayment API Started - Method: {$_SERVER['REQUEST_METHOD']}");
// Check if the request method is OPTIONS (preflight request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}
// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true); // Decode the JSON data from the request body
Logger::log("POST Data: " . json_encode($data));

if (!$data) {
    Logger::log("Invalid JSON data");
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON data"]);
    exit;
}
//store the required fields in variables
$bookingId = $data['booking_id'] ?? null;
$userId = $data['user_id'] ?? null;
$amount = $data['amount'] ?? null;
$paymentMethod = $data['payment_method'] ?? null;
$transactionId = $data['transaction_id'] ?? null;
$paymentDate = $data['payment_date'] ?? null;

Logger::log("Parsed: booking_id=$bookingId, user_id=$userId, amount=$amount, method=$paymentMethod, transaction_id=$transactionId");

try {
    $paymentClass = new PaymentClass(); // Create an instance of the PaymentClass
    $result = $paymentClass->createPayment($bookingId, $userId, $amount, $paymentMethod, $transactionId, $paymentDate); // Call the createPayment method to process the payment
    http_response_code(201);
    echo json_encode($result); // Return the result as JSON
} catch (Exception $e) {
    Logger::log("Exception: " . $e->getMessage());
    http_response_code($e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]); // Return error message
}

exit;
?>
