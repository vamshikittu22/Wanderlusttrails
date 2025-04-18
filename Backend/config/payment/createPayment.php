<?php
//path: Wanderlusttrails/Backend/config/api_updatePaymentStatus.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php";
Logger::log("createPayment API Started - Method: {$_SERVER['REQUEST_METHOD']}");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

require_once __DIR__ . "/../inc_databaseClass.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
Logger::log("POST Data: " . json_encode($data));

if (!$data) {
    Logger::log("Invalid JSON data");
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON data"]);
    exit;
}

$bookingId = $data['booking_id'] ?? null;
$userId = $data['user_id'] ?? null;
$amount = $data['amount'] ?? null;
$paymentMethod = $data['payment_method'] ?? null;
$transactionId = $data['transaction_id'] ?? null;
$paymentDate = $data['payment_date'] ?? null;

Logger::log("Parsed: booking_id=$bookingId, user_id=$userId, amount=$amount, method=$paymentMethod, transaction_id=$transactionId");

$validMethods = ['credit_card', 'debit_card', 'paypal', 'bank_transfer'];
if (!$bookingId || !$userId || !$amount || !$paymentMethod || !in_array($paymentMethod, $validMethods)) {
    Logger::log("Validation failed: Missing fields");
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing or invalid fields"]);
    exit;
}

try {
    $db = new DatabaseClass();
    Logger::log("DB connected");

    $query = "INSERT INTO payments (booking_id, user_id, amount, payment_method, transaction_id, payment_status, payment_date) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $status = 'completed';
    $types = "iidssss";
    $params = [$bookingId, $userId, $amount, $paymentMethod, $transactionId, $status, $paymentDate ?: date('Y-m-d H:i:s')];
    Logger::log("Query: $query, Status: $status, Params: " . json_encode($params));
    $result = $db->executeQuery($query, $types, ...$params);

    Logger::log("Result: " . json_encode($result));

    if ($result['success']) {
        Logger::log("Payment recorded, ID: " . $result['insert_id']);
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "Payment recorded successfully",
            "payment_id" => $result['insert_id']
        ]);
    } else {
        Logger::log("Insert failed: " . json_encode($result));
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to record payment"]);
    }
} catch (Exception $e) {
    Logger::log("Exception: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}

exit;
?>