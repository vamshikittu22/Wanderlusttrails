<?php
// path: Backend/config/blogs/createBlog.php
// API endpoint to create a new blog post, expects POST request with form-data (including optional media files)

// CORS headers to allow requests from frontend (localhost:5173)
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Include logger to record API activity
require_once __DIR__ . "/../inc_logger.php";

Logger::log("createBlog API Started - Method: {$_SERVER['REQUEST_METHOD']}");

// Handle CORS preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for createBlog");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

// Try to include the BlogModel for DB operations; log error and return 500 if it fails
try {
    require_once __DIR__ . "/inc_blogModel.php";
} catch (Exception $e) {
    Logger::log("Error loading inc_blogModel.php: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: Unable to load blog model"]);
    exit;
}

// Only allow POST requests here
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405); // Method Not Allowed
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Extract POSTed form data, trimming strings for cleanliness
$userId = $_POST['userId'] ?? '';
$title = trim($_POST['title'] ?? '');
$content = trim($_POST['content'] ?? '');
$status = trim($_POST['status'] ?? 'draft');  // Default status is 'draft'

// Extract uploaded media files (if any)
$mediaFiles = $_FILES['media'] ?? [];

// Extract existing media data if sent (JSON string expected)
$existingMedia = isset($_POST['existing_media']) ? json_decode($_POST['existing_media'], true) : [];

// Log received data summary (partially truncate long text)
Logger::log("Received data - userId: $userId, title: " . substr($title, 0, 50) . ", content: " . substr($content, 0, 100) . ", media_files: " . count($mediaFiles['name'] ?? []));

// Instantiate BlogModel and attempt to create blog
try {
    $blogModel = new BlogModel();
    $result = $blogModel->createBlog($userId, $title, $content, $status, $mediaFiles, $existingMedia);

    Logger::log("createBlog result: " . json_encode($result));

    // Send 201 Created if success, else 400 Bad Request
    http_response_code($result['success'] ? 201 : 400);
    echo json_encode($result);
} catch (Exception $e) {
    // Log and return 500 Internal Server Error on exception
    Logger::log("Exception in createBlog: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: {$e->getMessage()}"]);
}

exit;
?>
