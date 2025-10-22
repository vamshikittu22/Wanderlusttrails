<?php
// path: Backend/config/auth/verifyPassword.php
// Verifies user password before sensitive operations

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php";
require_once __DIR__ . "/inc_authHelper.php";

Logger::log("verifyPassword API Started");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Get data
$data = json_decode(file_get_contents("php://input"), true);
$identifier = $data['identifier'] ?? '';
$password = $data['currentPassword'] ?? '';

// Validate input
if (empty($identifier) || empty($password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Identifier and password are required"]);
    exit;
}

// Get user using helper
$authHelper = new AuthHelper();
$user = $authHelper->getUserByIdentifier($identifier);

if (!$user) {
    Logger::log("User not found: $identifier");
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "User not found"]);
    exit;
}

// Verify password
if (password_verify($password, $user['password'])) {
    Logger::log("Password verified for: $identifier");
    http_response_code(200);
    echo json_encode(["success" => true, "message" => "Password verified"]);
} else {
    Logger::log("Incorrect password for: $identifier");
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Incorrect password"]);
}
exit;
?>
