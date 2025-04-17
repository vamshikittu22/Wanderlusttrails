<?php
//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

file_put_contents(__DIR__ . "/../logs/debug.log", "updateBlog API Started - Method: " . $_SERVER['REQUEST_METHOD'] . " at " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    file_put_contents(__DIR__ . "/../logs/debug.log", "Handling OPTIONS request\n", FILE_APPEND);
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

try {
    require_once __DIR__ . "/../blogs/inc_blogsModel.php";
} catch (Exception $e) {
    file_put_contents(__DIR__ . "/../logs/debug.log", "Error loading inc_blogsModel.php: " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: Unable to load blogs model"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $blogId = $_POST['blogId'] ?? '';
    $userId = $_POST['userId'] ?? '';
    $title = $_POST['title'] ?? '';
    $content = $_POST['content'] ?? '';
    $status = $_POST['status'] ?? 'draft';
    $existingMedia = json_decode($_POST['existing_media'] ?? '[]', true);

    file_put_contents(__DIR__ . "/../logs/debug.log", "Received data: blogId=$blogId, userId=$userId, title=$title, status=$status\n", FILE_APPEND);

    try {
        $blogsModel = new BlogsModel();
        $mediaUrls = is_array($existingMedia) ? $existingMedia : [];
        if (!empty($_FILES['media'])) {
            file_put_contents(__DIR__ . "/../logs/debug.log", "Processing media uploads\n", FILE_APPEND);
            $newMedia = $blogsModel->uploadMedia($_FILES['media']);
            $mediaUrls = array_merge($mediaUrls, $newMedia);
        }

        $result = $blogsModel->updateBlog($blogId, $userId, $title, $content, $mediaUrls, $status);

        file_put_contents(__DIR__ . "/../logs/debug.log", "updateBlog result: " . json_encode($result) . "\n", FILE_APPEND);

        if ($result['success']) {
            http_response_code(200);
            echo json_encode($result);
        } else {
            http_response_code(400);
            echo json_encode($result);
        }
    } catch (Exception $e) {
        file_put_contents(__DIR__ . "/../logs/debug.log", "Exception in updateBlog: " . $e->getMessage() . "\n", FILE_APPEND);
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
    }
    exit;
}

file_put_contents(__DIR__ . "/../logs/debug.log", "Invalid Method: " . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
exit;
?>