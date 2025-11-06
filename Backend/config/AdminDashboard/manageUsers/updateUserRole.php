<?php
// path: Wanderlusttrails/Backend/config/AdminDashboard/manageUsers/updateUserRole.php
// This API endpoint updates the role of a user (admin/user) for admin dashboard management.

// Enable CORS for the frontend and set response headers
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Max-Age: 86400");

require_once __DIR__ . "/../../inc_logger.php";
require_once __DIR__ . "/inc_UsersOpsModel.php";

Logger::log("updateUserRole API Started - Method: {$_SERVER['REQUEST_METHOD']}");

// Handle preflight OPTIONS request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for updateUserRole");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

// Only allow POST method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Get raw POST input and log it
$rawInput = file_get_contents("php://input");
Logger::log("Raw input: " . ($rawInput ?: "Empty"));

// Decode JSON input to associative array
$data = json_decode($rawInput, true);
if ($data === null) {
    Logger::log("JSON decode failed. Possible malformed JSON.");
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON format"]);
    exit;
}

// Extract user ID and role from input
$userId = $data['id'] ?? '';
$role = $data['role'] ?? '';

// Validate presence and type of userId and role
if (empty($userId) || !is_numeric($userId) || empty($role)) {
    Logger::log("Missing or invalid id/role: " . json_encode($data));
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Valid numeric user ID and role are required"]);
    exit;
}

// Sanitize userId and normalize role string
$userId = (int)$userId;
$role = strtolower($role);

// Define allowed roles
$validRoles = ['admin', 'user'];
if (!in_array($role, $validRoles)) {
    Logger::log("Invalid role: '$role'");
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid role. Use: admin or user"]);
    exit;
}


// Instantiate UserOpsModel and attempt role update
$userOpsModel = new UserOpsModel();
$result = $userOpsModel->updateUserRole($userId, $role);

Logger::log("updateUserRole result for user_id: $userId - " . ($result['success'] ? "Success: {$result['message']}" : "Failed: {$result['message']}"));

// Return appropriate HTTP response code and JSON response
http_response_code($result['success'] ? 200 : 400);
echo json_encode($result);
exit;
?>
