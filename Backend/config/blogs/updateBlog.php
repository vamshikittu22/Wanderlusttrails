<?php
// path: Backend/config/blogs/updateBlog.php
// Updates an existing blog in the database via POST request, expects FormData.

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php"; // Include logger for logging

Logger::log("updateBlog API Started - Method: {$_SERVER['REQUEST_METHOD']}");
//  // Check if the request method is OPTIONS for preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for updateBlog");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

try {
    require_once __DIR__ . "/inc_blogModel.php";  // Include blog model for database operations
} catch (Exception $e) {
    Logger::log("Error loading inc_blogModel.php: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: Unable to load blog model"]);
    exit;
}
// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Extract data from FormData using $_POST and $_FILES
$blogId = isset($_POST['blogId']) ? $_POST['blogId'] : '';
$userId = isset($_POST['userId']) ? $_POST['userId'] : '';
$title = isset($_POST['title']) ? trim($_POST['title']) : '';
$content = isset($_POST['content']) ? trim($_POST['content']) : '';
$status = isset($_POST['status']) ? trim($_POST['status']) : 'draft';
$mediaFiles = isset($_FILES['media']) ? $_FILES['media'] : [];
$existingMedia = isset($_POST['existing_media']) ? json_decode($_POST['existing_media'], true) : [];

Logger::log("Received data - blogId: $blogId, userId: $userId, title: " . substr($title, 0, 50) . ", content: " . substr($content, 0, 100) . ", media_files: " . count($mediaFiles['name'] ?? []));

try {
    $blogModel = new BlogModel(); // Create instance of BlogModel
    $result = $blogModel->updateBlog($blogId, $userId, $title, $content, $status, $mediaFiles, $existingMedia); // Call updateBlog method of BlogModel

    Logger::log("updateBlog result: " . json_encode($result));

    http_response_code($result['success'] ? 200 : 400);
    echo json_encode($result); // Return result as JSON
} catch (Exception $e) {
    Logger::log("Exception in updateBlog: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: {$e->getMessage()}"]); // Return error message as JSON
}
exit;
?>