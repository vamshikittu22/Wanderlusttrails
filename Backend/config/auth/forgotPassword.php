<?php
// Path: Backend/config/auth/forgotPassword.php
// API endpoint to handle forgot password requests by sending OTP to user's email or phone

header("Access-Control-Allow-Origin: http://localhost:5173"); // Allow requests from frontend origin
header("Content-Type: application/json; charset=UTF-8"); // Response content type JSON
header("Access-Control-Allow-Methods: POST, OPTIONS"); // Allowed HTTP methods
header("Access-Control-Allow-Headers: Content-Type"); // Allowed headers

require_once __DIR__ . "/../inc_logger.php"; // Logger for logging API activity
require_once __DIR__ . "/inc_userModel.php"; // UserModel for user operations
require_once __DIR__ . "/../inc_validationClass.php"; // ValidationClass for input validation

Logger::log("forgotPassword API Started - Method: {$_SERVER['REQUEST_METHOD']}");

// Handle OPTIONS preflight requests (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for forgotPassword");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

// Handle POST requests to initiate forgot password flow
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get JSON input data from request body
    $data = json_decode(file_get_contents("php://input"), true);
    Logger::log("POST Data - Identifier: " . ($data['identifier'] ?? 'none'));

    // Validate presence of identifier (email or phone)
    if (!$data || !isset($data['identifier'])) {
        Logger::log("Missing identifier");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Email or phone is required"]);
        exit;
    }

    $identifier = trim($data['identifier']);
    
    // Create validation instance and validate identifier as email or phone
    $validator = new ValidationClass();
    $emailCheck = $validator->validateEmail($identifier);
    $phoneCheck = $validator->validatePhone($identifier);
    if (!$emailCheck['success'] && !$phoneCheck['success']) {
        Logger::log("Invalid identifier format: $identifier");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid email or phone format"]);
        exit;
    }

    // Use UserModel to send OTP for password reset
    $userModel = new UserModel();
    $result = $userModel->sendOtp($identifier);

    // Log result and respond accordingly
    Logger::log("forgotPassword result for identifier: $identifier - " . ($result['success'] ? "Success: {$result['message']}" : "Failed: {$result['message']}"));
    http_response_code($result['success'] ? 200 : ($result['message'] === "User not found" ? 404 : 400));
    echo json_encode($result);
    exit;
}

// If request method is not supported, respond with 405 Method Not Allowed
Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
exit;
?>
