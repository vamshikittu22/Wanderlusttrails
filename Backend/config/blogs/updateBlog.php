<?php
// path: Backend/config/blogs/updateBlog.php
// API endpoint to update an existing blog in the database via POST request with FormData

// Set CORS headers to allow requests from frontend
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Include logger for request logging
require_once __DIR__ . "/../inc_logger.php";

Logger::log("updateBlog API Started - Method: {$_SERVER['REQUEST_METHOD']}");

// Handle CORS preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for updateBlog");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

// Load the BlogModel class for database operations
try {
    require_once __DIR__ . "/inc_blogModel.php";
} catch (Exception $e) {
    Logger::log("Error loading inc_blogModel.php: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: Unable to load blog model"]);
    exit;
}

// Only allow POST requests for this endpoint
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405); // Method Not Allowed
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Extract data from FormData ($_POST for fields, $_FILES for media uploads)
$blogId = isset($_POST['blogId']) ? $_POST['blogId'] : '';
$userId = isset($_POST['userId']) ? $_POST['userId'] : '';
$title = isset($_POST['title']) ? trim($_POST['title']) : '';
$content = isset($_POST['content']) ? trim($_POST['content']) : '';
$status = isset($_POST['status']) ? trim($_POST['status']) : 'draft';
$mediaFiles = isset($_FILES['media']) ? $_FILES['media'] : [];
$existingMedia = isset($_POST['existing_media']) ? json_decode($_POST['existing_media'], true) : [];

Logger::log("Received data - blogId: $blogId, userId: $userId, title: " . substr($title, 0, 50) . ", content: " . substr($content, 0, 100) . ", media_files: " . count($mediaFiles['name'] ?? []));

try {
    $blogModel = new BlogModel();
    $result = $blogModel->updateBlog($blogId, $userId, $title, $content, $status, $mediaFiles, $existingMedia);

    Logger::log("updateBlog result: " . json_encode($result));

    http_response_code($result['success'] ? 200 : 400);
    echo json_encode($result);
} catch (Exception $e) {
    Logger::log("Exception in updateBlog: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: {$e->getMessage()}"]);
}
exit;
?>
