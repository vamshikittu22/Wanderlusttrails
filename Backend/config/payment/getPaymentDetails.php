<?php
//path: Wanderlusttrails/Backend/config/payment/updatePaymentStatus.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php";
Logger::log("getPaymentDetails API Started - Method: {$_SERVER['REQUEST_METHOD']}");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

require_once __DIR__ . "/../inc_databaseClass.php";

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$bookingId = isset($_GET['booking_id']) ? intval($_GET['booking_id']) : null;
Logger::log("Parsed: booking_id=$bookingId");

if (!$bookingId) {
    Logger::log("Validation failed: Missing booking_id");
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing booking_id"]);
    exit;
}

try {
    $db = new DatabaseClass();
    Logger::log("DB connected");

    $query = "
        SELECT 
            payment_method, 
            payment_status, 
            transaction_id, 
            payment_date
        FROM payments 
        WHERE booking_id = ?
    ";
    $types = "i";
    $params = [$bookingId];
    Logger::log("Executing fetchQuery: $query with booking_id=$bookingId");
    $data = $db->fetchQuery($query, $types, ...$params);

    Logger::log("Fetch query result: " . json_encode($data));

    if (!empty($data)) {
        $payment = $data[0];
        Logger::log("Payment found for booking_id=$bookingId: " . json_encode($payment));
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "data" => [
                "payment_method" => $payment['payment_method'] ?? 'N/A',
                "payment_status" => $payment['payment_status'] ?? 'N/A',
                "transaction_id" => $payment['transaction_id'] ?? null,
                "payment_date" => $payment['payment_date'] ?? 'N/A'
            ],
            "message" => "Payment details retrieved successfully"
        ]);
    } else {
        Logger::log("No payment found for booking_id=$bookingId");
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "data" => null,
            "message" => "No payment found"
        ]);
    }
} catch (Exception $e) {
    Logger::log("Exception: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}

exit;
?>