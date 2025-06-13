<?php
// Allow requests from frontend origin localhost:5173 (CORS)
header("Access-Control-Allow-Origin: http://localhost:5173");
// Set response content type to JSON UTF-8
header("Content-Type: application/json; charset=UTF-8");
// Allow GET and OPTIONS HTTP methods
header("Access-Control-Allow-Methods: GET, OPTIONS");
// Allow Content-Type header in requests
header("Access-Control-Allow-Headers: Content-Type");

// Define path to Todo model file
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

// Handle CORS preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Respond with 200 OK for OPTIONS request
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

// Reject any request method other than GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Retrieve the 'user_id' parameter from the GET request
$userId = isset($_GET['user_id']) ? $_GET['user_id'] : null;

// Validate presence of 'user_id'
if (!$userId) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing required field: user_id"]);
    exit;
}

try {
    // Instantiate the TodoClass model
    $todoClass = new TodoClass();
    // Call getTodos method to retrieve all todos for the given userId
    $todos = $todoClass->getTodos($userId);
    // Respond with 200 OK and todos data
    http_response_code(200);
    echo json_encode([
        "success" => true,
        "data" => $todos,
        "message" => "Todos retrieved successfully"
    ]);
} catch (Exception $e) {
    // Handle exceptions by returning the error code or 500 Internal Server Error
    http_response_code($e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500);
    echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
    // Log last PHP error for debugging if available
    if (function_exists('error_get_last')) {
        error_log("Last PHP error: " . json_encode(error_get_last()));
    }
}

// End script execution
exit;
?>
