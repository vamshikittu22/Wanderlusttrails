<?php
//path: Wanderlusttrails/Backend/config/auth/forgotPassword.php
// This file handles forgot password requests by sending an OTP to the user's email or phone.

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php"; // Include the logger for logging purposes
require_once __DIR__ . "/inc_userModel.php"; // Include the user model for database operations

Logger::log("forgotPassword API Started - Method: {$_SERVER['REQUEST_METHOD']}");
// Check if the request method is OPTIONS (preflight request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for forgotPassword");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}
// Check if the request method is POST (actual request)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    Logger::log("POST Data - Identifier: " . ($data['identifier'] ?? 'none'));
// Validate the input data
    if (!$data || !isset($data['identifier'])) {
        Logger::log("Missing identifier");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Email or phone is required"]);
        exit;
    }
     
    $identifier = trim($data['identifier']); // Get the identifier (email or phone) from the request data
    $userModel = new UserModel(); // Create an instance of the UserModel class to interact with the database
    $result = $userModel->sendOtp($identifier); // Call the sendOtp method to send the OTP to the user's email or phone

    Logger::log("forgotPassword result for identifier: $identifier - " . ($result['success'] ? "Success: {$result['message']}" : "Failed: {$result['message']}"));
    http_response_code($result['success'] ? 200 : ($result['message'] === "User not found" ? 404 : 400));
    echo json_encode($result); // Return the result of the OTP sending process
    exit;
}

Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
exit;
?>