<?php
//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx
// Updates user role for admin.

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Max-Age: 86400");

require_once __DIR__ . "/../../inc_logger.php";
require_once __DIR__ . "/inc_UsersOpsModel.php";

Logger::log("updateUserRole API Started - Method: {$_SERVER['REQUEST_METHOD']}");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for updateUserRole");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$rawInput = file_get_contents("php://input");
Logger::log("Raw input: " . ($rawInput ?: "Empty"));

$data = json_decode($rawInput, true);
if ($data === null) {
    Logger::log("JSON decode failed. Possible malformed JSON.");
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON format"]);
    exit;
}

$userId = $data['id'] ?? '';
$role = $data['role'] ?? '';
if (empty($userId) || !is_numeric($userId) || empty($role)) {
    Logger::log("Missing or invalid id/role: " . json_encode($data));
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Valid numeric user ID and role are required"]);
    exit;
}

$userId = (int)$userId;
$validRoles = ['Admin', 'User'];
if (!in_array($role, $validRoles)) {
    Logger::log("Invalid role: '$role'");
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid role. Use: Admin or User"]);
    exit;
}

Logger::log("Updating role for user_id: $userId to $role");

$userOpsModel = new UserOpsModel();
$result = $userOpsModel->updateUserRole($userId, $role);

Logger::log("updateUserRole result for user_id: $userId - " . ($result['success'] ? "Success: {$result['message']}" : "Failed: {$result['message']}"));
http_response_code($result['success'] ? 200 : 400);
echo json_encode($result);
exit;
?>