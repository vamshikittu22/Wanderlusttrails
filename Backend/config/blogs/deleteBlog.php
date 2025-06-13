<?php
// path: Backend/config/blogs/deleteBlog.php
// API endpoint to delete a blog post from the database via POST request, expects JSON payload with blogId and userId

// CORS headers allowing requests from frontend (localhost:5173)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Include logger for recording API activity
require_once __DIR__ . "/../inc_logger.php";

Logger::log("deleteBlog API Started - Method: {$_SERVER['REQUEST_METHOD']}");

// Handle CORS preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for deleteBlog");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

// Include the BlogModel for DB operations and handle loading errors
try {
    require_once __DIR__ . "/inc_blogModel.php";
} catch (Exception $e) {
    Logger::log("Error loading inc_blogModel.php: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: Unable to load blog model"]);
    exit;
}

// Enforce POST method for this endpoint
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405); // Method Not Allowed
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Read raw JSON input and decode
$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

// Validate JSON decoding
if (!$data) {
    Logger::log("Invalid JSON input: " . ($rawInput ?: 'empty'));
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid or missing JSON data"]);
    exit;
}

// Extract blogId and userId from decoded data
$blogId = $data['blogId'] ?? '';
$userId = $data['userId'] ?? '';

Logger::log("Received data - blogId: $blogId, userId: $userId");

try {
    $blogModel = new BlogModel();
    $result = $blogModel->deleteBlog($blogId, $userId);

    Logger::log("deleteBlog result: " . json_encode($result));

    // Send 200 OK if deletion successful, 400 Bad Request otherwise
    http_response_code($result['success'] ? 200 : 400);
    echo json_encode($result);
} catch (Exception $e) {
    // Log and return 500 Internal Server Error on exception
    Logger::log("Exception in deleteBlog: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: {$e->getMessage()}"]);
}

exit;
?>
