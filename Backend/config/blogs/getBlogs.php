<?php
// path: Backend/config/blogs/getBlogs.php
// API endpoint to retrieve all blogs from the database via GET request and return JSON response

// Set CORS headers to allow requests from frontend
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Include logger for request logging
require_once __DIR__ . "/../inc_logger.php";

Logger::log("getBlogs API Started - Method: {$_SERVER['REQUEST_METHOD']}");

// Handle CORS preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for getBlogs");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

// Attempt to load the BlogModel class for database operations
try {
    require_once __DIR__ . "/inc_blogModel.php";
} catch (Exception $e) {
    Logger::log("Error loading inc_blogModel.php: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: Unable to load blog model"]);
    exit;
}

// Only allow GET requests for this endpoint
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405); // Method Not Allowed
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

Logger::log("Fetching all blogs");

try {
    $blogModel = new BlogModel();
    $result = $blogModel->getAllBlogs();

    Logger::log("getBlogs result: " . json_encode([
        'success' => $result['success'],
        'message' => $result['message'] ?? 'N/A',
        'data_count' => count($result['data'] ?? [])
    ]));

    http_response_code($result['success'] ? 200 : 500);
    echo json_encode($result);
} catch (Exception $e) {
    Logger::log("Exception in getBlogs: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: {$e->getMessage()}"]);
}
exit;
?>
