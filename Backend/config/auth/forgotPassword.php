<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php";
require_once __DIR__ . "/inc_userModel.php";
require_once __DIR__ . "/../inc_validationClass.php"; // Added to use ValidationClass

Logger::log("forgotPassword API Started - Method: {$_SERVER['REQUEST_METHOD']}");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for forgotPassword");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    Logger::log("POST Data - Identifier: " . ($data['identifier'] ?? 'none'));

    if (!$data || !isset($data['identifier'])) {
        Logger::log("Missing identifier");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Email or phone is required"]);
        exit;
    }

    $identifier = trim($data['identifier']);
    
    // Validate identifier using ValidationClass
    $validator = new ValidationClass();
    $emailCheck = $validator->validateEmail($identifier);
    $phoneCheck = $validator->validatePhone($identifier);
    if (!$emailCheck['success'] && !$phoneCheck['success']) {
        Logger::log("Invalid identifier format: $identifier");
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid email or phone format"]);
        exit;
    }

    $userModel = new UserModel();
    $result = $userModel->sendOtp($identifier);

    Logger::log("forgotPassword result for identifier: $identifier - " . ($result['success'] ? "Success: {$result['message']}" : "Failed: {$result['message']}"));
    http_response_code($result['success'] ? 200 : ($result['message'] === "User not found" ? 404 : 400));
    echo json_encode($result);
    exit;
}

Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
exit;
?>