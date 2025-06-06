<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once __DIR__ . "/../inc_logger.php";
require_once __DIR__ . "/../auth/jwt_helper.php";
require_once __DIR__ . "/inc_todoModel.php";

Logger::log("markReminderSent API Started - Method: {$_SERVER['REQUEST_METHOD']}");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request");
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

$token = getBearerToken();
if (!$token) {
    Logger::log("No token provided");
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "No token provided"]);
    exit;
}

try {
    $decoded = validateToken($token);
    $userId = $decoded->user_id;
} catch (Exception $e) {
    Logger::log("Invalid token: " . $e->getMessage());
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Invalid token: " . $e->getMessage()]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
Logger::log("POST Data: " . json_encode($data));

if (!$data) {
    Logger::log("Invalid JSON data");
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON data"]);
    exit;
}

$todoId = $data['id'] ?? null;

Logger::log("Parsed: user_id=$userId, id=$todoId");

try {
    $todoClass = new TodoClass();
    $result = $todoClass->markReminderSent($todoId, $userId);
    http_response_code(200);
    echo json_encode($result);
} catch (Exception $e) {
    Logger::log("Exception: " . $e->getMessage());
    http_response_code($e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
}

exit;
?>