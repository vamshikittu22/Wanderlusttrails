<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_databaseClass.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data || !isset($data['identifier']) || !isset($data['otp']) || !isset($data['newPassword'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Identifier, OTP, and new password are required"]);
        exit;
    }

    $identifier = $data['identifier'];
    $otp = $data['otp'];
    $newPassword = password_hash($data['newPassword'], PASSWORD_BCRYPT);

    $isEmail = filter_var($identifier, FILTER_VALIDATE_EMAIL);
    $isPhone = preg_match('/^[0-9]{10}$/', $identifier);

    if (!$isEmail && !$isPhone) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid email or phone format"]);
        exit;
    }

    $db = new DatabaseClass();

    // Verify OTP
    $query = "SELECT id FROM users WHERE " . ($isEmail ? "email = ?" : "phone = ?") . " AND reset_token = ? AND reset_expires > NOW()";
    $result = $db->fetchQuery($query, "ss", $identifier, $otp);
    if (empty($result)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid or expired OTP"]);
        exit;
    }

    $userId = $result[0]['id'];

    // Update password and clear OTP
    $query = "UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?";
    $result = $db->executeQuery($query, "si", $newPassword, $userId);
    if (!$result['success']) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to update password"]);
        exit;
    }

    http_response_code(200);
    echo json_encode(["success" => true, "message" => "Password reset successfully"]);
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
}
?>