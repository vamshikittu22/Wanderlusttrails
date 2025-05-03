<?php
//path: Wanderlusttrails/Backend/config/auth/verifyPassword.php
// This file verifies the user's current password.

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php"; // Include the logger for logging purposes
require_once __DIR__ . "/inc_userModel.php"; // Include the user model for database operations

Logger::log("verifyPassword API Started - Method: {$_SERVER['REQUEST_METHOD']}");
// Check if the request method is OPTIONS (preflight request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for verifyPassword");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}
// Check if the request method is POST (actual request)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    Logger::log("POST Data - Identifier: " . ($data['identifier'] ?? 'none'));
    // Check if the required fields are present in the request data
    if (!$data || !isset($data['identifier']) || !isset($data['currentPassword'])) {
        Logger::log("Missing identifier or currentPassword");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Identifier and current password are required"]);
        exit;
    }
// Get the identifier (email or phone) and current password from the request data
    $identifier = trim($data['identifier']);
    $currentPassword = $data['currentPassword'];

    $userModel = new UserModel(); // Create an instance of the UserModel class to interact with the database
    $result = $userModel->verifyPassword($identifier, $currentPassword); // Call the verifyPassword method to verify the current password

    Logger::log("verifyPassword result for identifier: $identifier - " . ($result['success'] ? "Success: {$result['message']}" : "Failed: {$result['message']}"));
    http_response_code($result['success'] ? 200 : ($result['message'] === "User not found" ? 404 : 401));
    echo json_encode($result); // Return the result of the password verification process
    exit;
}

Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]); // Return a 405 Method Not Allowed response
exit;
?>