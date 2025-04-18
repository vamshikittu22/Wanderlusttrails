<?php
//path: Wanderlusttrails/Backend/config/auth/verifyOtp.php
// This file verifies the OTP and resets the user's password.

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php";
require_once __DIR__ . "/inc_userModel.php";

Logger::log("verifyOtp API Started - Method: {$_SERVER['REQUEST_METHOD']}");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for verifyOtp");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    Logger::log("POST Data - Identifier: " . ($data['identifier'] ?? 'none') . ", OTP length: " . (isset($data['otp']) ? strlen($data['otp']) : 'none'));

    if (!$data || !isset($data['identifier']) || !isset($data['otp']) || !isset($data['newPassword'])) {
        Logger::log("Missing identifier, otp, or newPassword");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Identifier, OTP, and new password are required"]);
        exit;
    }

    $identifier = trim($data['identifier']);
    $otp = trim($data['otp']);
    $newPassword = $data['newPassword'];

    $userModel = new UserModel();
    $result = $userModel->verifyOtpAndResetPassword($identifier, $otp, $newPassword);

    Logger::log("verifyOtp result for identifier: $identifier - " . ($result['success'] ? "Success: {$result['message']}" : "Failed: {$result['message']}"));
    http_response_code($result['success'] ? 200 : ($result['message'] === "Invalid or expired OTP" ? 401 : 400));
    echo json_encode($result);
    exit;
}

Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
exit;
?>