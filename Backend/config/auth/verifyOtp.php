<?php
//path: Wanderlusttrails/Backend/config/auth/verifyOtp.php
// This file verifies the OTP and resets the user's password.

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php"; // Include the logger for logging purposes
require_once __DIR__ . "/inc_userModel.php"; // Include the user model for database operations

Logger::log("verifyOtp API Started - Method: {$_SERVER['REQUEST_METHOD']}");
// Check if the request method is OPTIONS (preflight request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for verifyOtp");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}
// Check if the request method is POST (actual request)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    Logger::log("POST Data - Identifier: " . ($data['identifier'] ?? 'none') . ", OTP length: " . (isset($data['otp']) ? strlen($data['otp']) : 'none'));
    // Check if the required fields are present in the request data
    if (!$data || !isset($data['identifier']) || !isset($data['otp']) || !isset($data['newPassword'])) {
        Logger::log("Missing identifier, otp, or newPassword");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Identifier, OTP, and new password are required"]);
        exit;
    }
// Get the identifier (email or phone), OTP, and new password from the request data
    $identifier = trim($data['identifier']);
    $otp = trim($data['otp']);
    $newPassword = $data['newPassword'];

    $userModel = new UserModel();  // Create an instance of the UserModel class to interact with the database
    $result = $userModel->verifyOtpAndResetPassword($identifier, $otp, $newPassword); // Call the verifyOtpAndResetPassword method to verify the OTP and reset the password

    Logger::log("verifyOtp result for identifier: $identifier - " . ($result['success'] ? "Success: {$result['message']}" : "Failed: {$result['message']}"));
    http_response_code($result['success'] ? 200 : ($result['message'] === "Invalid or expired OTP" ? 401 : 400));
    echo json_encode($result); // Return the result of the OTP verification and password reset process
    exit;
}

Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);  // Return a 405 Method Not Allowed response
exit;
?>