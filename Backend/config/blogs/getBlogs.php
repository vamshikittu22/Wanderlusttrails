<?php
// path: Backend/config/blogs/getBlogs.php
// Retrieves all blogs from the database via GET request, returns JSON response.

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php"; // Include logger for logging

Logger::log("getBlogs API Started - Method: {$_SERVER['REQUEST_METHOD']}");
// Check if the request method is OPTIONS for preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for getBlogs");
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
// Check if the request method is GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

Logger::log("Fetching all blogs");

try {
    $blogModel = new BlogModel(); // Create instance of BlogModel
    $result = $blogModel->getAllBlogs(); // Call getAllBlogs method of BlogModel

    Logger::log("getBlogs result: " . json_encode([
        'success' => $result['success'],
        'message' => $result['message'] ?? 'N/A',
        'data_count' => count($result['data'] ?? [])
    ]));

    http_response_code($result['success'] ? 200 : 500);
    echo json_encode($result); // Return result as JSON
} catch (Exception $e) {
    Logger::log("Exception in getBlogs: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: {$e->getMessage()}"]); // Return error message as JSON
}
exit;
?>