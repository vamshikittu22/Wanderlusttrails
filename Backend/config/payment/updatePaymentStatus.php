<?php
//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php";
Logger::log("updatePaymentStatus API Started - Method: {$_SERVER['REQUEST_METHOD']}");

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

$transactionId = $data['transaction_id'] ?? null;
$paymentStatus = $data['payment_status'] ?? null;

Logger::log("Parsed: transaction_id=$transactionId, payment_status=$paymentStatus");

$validStatuses = ['pending', 'completed', 'failed'];
if (!$transactionId || !$paymentStatus || !in_array($paymentStatus, $validStatuses)) {
    Logger::log("Validation failed: Missing or invalid fields");
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing or invalid fields"]);
    exit;
}

try {
    $db = new DatabaseClass();
    Logger::log("DB connected");

    $query = "UPDATE payments SET payment_status = ?, updated_at = NOW() WHERE transaction_id = ?";
    $types = "ss";
    $params = [$paymentStatus, $transactionId];
    Logger::log("Query: $query, Params: " . json_encode($params));
    $result = $db->executeQuery($query, $types, ...$params);

    Logger::log("Result: " . json_encode($result));

    if ($result['success']) {
        Logger::log("Payment status updated");
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "message" => "Payment status updated successfully"
        ]);
    } else {
        Logger::log("Update failed: " . json_encode($result));
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to update payment status"]);
    }
} catch (Exception $e) {
    Logger::log("Exception: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}

exit;
?>