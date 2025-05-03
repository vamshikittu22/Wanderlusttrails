<?php
// path: Backend/config/blogs/deleteBlog.php
// Deletes a blog from the database via POST request, expects JSON data.

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php"; // Include logger for logging

Logger::log("deleteBlog API Started - Method: {$_SERVER['REQUEST_METHOD']}");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for deleteBlog");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

try {
    require_once __DIR__ . "/inc_blogModel.php"; // Include blog model for database operations
} catch (Exception $e) {
    Logger::log("Error loading inc_blogModel.php: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: Unable to load blog model"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$rawInput = file_get_contents("php://input"); // Get raw input data
$data = json_decode($rawInput, true); // Decode JSON data
if (!$data) {
    Logger::log("Invalid JSON input: " . ($rawInput ?: 'empty'));
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid or missing JSON data"]);
    exit;
}

$blogId = $data['blogId'] ?? ''; // Get blogId from JSON data
$userId = $data['userId'] ?? ''; // Get userId from JSON data

Logger::log("Received data - blogId: $blogId, userId: $userId");

try {
    $blogModel = new BlogModel(); // Create instance of BlogModel
    $result = $blogModel->deleteBlog($blogId, $userId); // Call deleteBlog method of BlogModel

    Logger::log("deleteBlog result: " . json_encode($result));

    http_response_code($result['success'] ? 200 : 400);
    echo json_encode($result); // Return result as JSON
} catch (Exception $e) {
    Logger::log("Exception in deleteBlog: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: {$e->getMessage()}"]); // Return error message as JSON
}  
exit;
?>