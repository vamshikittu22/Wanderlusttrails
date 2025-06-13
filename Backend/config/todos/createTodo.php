<?php
// Set CORS header to allow requests from localhost:5173 (frontend origin)
header("Access-Control-Allow-Origin: http://localhost:5173");
// Set the content type to JSON with UTF-8 encoding
header("Content-Type: application/json; charset=UTF-8");
// Allow only POST and OPTIONS HTTP methods
header("Access-Control-Allow-Methods: POST, OPTIONS");
// Allow Content-Type header in requests
header("Access-Control-Allow-Headers: Content-Type");

// Define the path to the Todo model file
$modelPath = __DIR__ . "/inc_todoModel.php";
// Check if the model file exists and is readable
if (!file_exists($modelPath) || !is_readable($modelPath)) {
    // Return 500 Internal Server Error if model file is missing or unreadable
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Model file not found or not readable at $modelPath"]);
    exit;
}
// Include the Todo model class
require_once $modelPath;

// Handle preflight OPTIONS request (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Respond with success status for OPTIONS request
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

// If the request method is not POST, reject with 405 Method Not Allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Decode the JSON payload from the POST request body
$data = json_decode(file_get_contents("php://input"), true);

// Check if JSON decoding succeeded
if (!$data) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON data"]);
    exit;
}

// Extract required fields from the decoded data
$task = $data['task'] ?? null;
$dueDate = $data['due_date'] ?? null;
$userId = $data['user_id'] ?? null;

// Check for missing required fields
if (!$task || !$dueDate || !$userId) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing required fields: task, due_date, and user_id"]);
    exit;
}

try {
    // Instantiate the TodoClass model
    $todoClass = new TodoClass();
    // Call createTodo method to add a new todo item
    $result = $todoClass->createTodo($userId, $task, $dueDate);
    // Return HTTP 201 Created status with result
    http_response_code(201);
    echo json_encode($result);
} catch (Exception $e) {
    // On exception, respond with error code if valid, otherwise 500
    http_response_code($e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
    // Log the last PHP error if available for debugging
    if (function_exists('error_get_last')) {
        error_log("Last PHP error: " . json_encode(error_get_last()));
    }
}

// End of script execution
exit;
?>
