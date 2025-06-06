<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$modelPath = __DIR__ . "/inc_todoModel.php";
if (!file_exists($modelPath) || !is_readable($modelPath)) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Model file not found or not readable at $modelPath"]);
    exit;
}
require_once $modelPath;

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

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON data"]);
    exit;
}

$task = $data['task'] ?? null;
$dueDate = $data['due_date'] ?? null;
$userId = $data['user_id'] ?? null;

if (!$task || !$dueDate || !$userId) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing required fields: task, due_date, and user_id"]);
    exit;
}

try {
    $todoClass = new TodoClass();
    $result = $todoClass->createTodo($userId, $task, $dueDate);
    http_response_code(201);
    echo json_encode($result);
} catch (Exception $e) {
    http_response_code($e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
    if (function_exists('error_get_last')) {
        error_log("Last PHP error: " . json_encode(error_get_last()));
    }
}

exit;
?>