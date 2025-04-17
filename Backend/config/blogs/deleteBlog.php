<?php
//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

file_put_contents(__DIR__ . "/../logs/debug.log", "deleteBlog API Started - Method: " . $_SERVER['REQUEST_METHOD'] . " at " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

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
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) {
        file_put_contents(__DIR__ . "/../logs/debug.log", "Invalid JSON input: " . file_get_contents("php://input") . "\n", FILE_APPEND);
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid or missing JSON data"]);
        exit;
    }

    $blogId = $data['blogId'] ?? '';
    $userId = $data['userId'] ?? '';

    file_put_contents(__DIR__ . "/../logs/debug.log", "Received data: blogId=$blogId, userId=$userId\n", FILE_APPEND);

    try {
        $blogsModel = new BlogsModel();
        $result = $blogsModel->deleteBlog($blogId, $userId);

        file_put_contents(__DIR__ . "/../logs/debug.log", "deleteBlog result: " . json_encode($result) . "\n", FILE_APPEND);

        if ($result['success']) {
            http_response_code(200);
            echo json_encode($result);
        } else {
            http_response_code(400);
            echo json_encode($result);
        }
    } catch (Exception $e) {
        file_put_contents(__DIR__ . "/../logs/debug.log", "Exception in deleteBlog: " . $e->getMessage() . "\n", FILE_APPEND);
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