<?php
// path: Wanderlusttrails/Backend/config/auth/verifyPassword.php

// Allow CORS from frontend and set response content type to JSON
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Include logger, user model, and validation class for necessary operations
require_once __DIR__ . "/../inc_logger.php";
require_once __DIR__ . "/inc_userModel.php";
require_once __DIR__ . "/../inc_validationClass.php";

Logger::log("verifyPassword API Started - Method: {$_SERVER['REQUEST_METHOD']}");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for verifyPassword");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Parse JSON input data
    $data = json_decode(file_get_contents("php://input"), true);
    Logger::log("POST Data - Identifier: " . ($data['identifier'] ?? 'none'));

    // Check required fields
    if (!$data || !isset($data['identifier']) || !isset($data['currentPassword'])) {
        Logger::log("Missing identifier or currentPassword");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Identifier and current password are required"]);
        exit;
    }

    // Sanitize inputs
    $identifier = trim($data['identifier']);
    $currentPassword = $data['currentPassword']; // Do not trim password to avoid altering it

    // Validate identifier format as email or phone
    $validator = new ValidationClass();
    $emailCheck = $validator->validateEmail($identifier);
    $phoneCheck = $validator->validatePhone($identifier);
    if (!$emailCheck['success'] && !$phoneCheck['success']) {
        Logger::log("Invalid identifier format: $identifier");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid email or phone format"]);
        exit;
    }

    // Verify password via UserModel method
    $userModel = new UserModel();
    $result = $userModel->verifyPassword($identifier, $currentPassword);

    // Log and respond accordingly
    Logger::log("verifyPassword result for identifier: $identifier - " . ($result['success'] ? "Success: {$result['message']}" : "Failed: {$result['message']}"));
    // 200 on success, 404 if user not found, 401 for auth failure
    http_response_code($result['success'] ? 200 : ($result['message'] === "User not found" ? 404 : 401));
    echo json_encode($result);
    exit;
}

// Method not allowed for other HTTP verbs
Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
exit;
?>
