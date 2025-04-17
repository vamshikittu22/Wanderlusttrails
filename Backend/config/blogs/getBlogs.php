<?php
//path: Wanderlusttrails/Frontend/WanderlustTrails/src/pages/ForgotPassword.jsx

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$logDir = __DIR__ . "/../logs";
$logFile = $logDir . "/debug.log";
if (is_dir($logDir) && is_writable($logDir)) {
    file_put_contents($logFile, "getBlogs API Started - Method: " . $_SERVER['REQUEST_METHOD'] . " at " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (is_dir($logDir) && is_writable($logDir)) {
        file_put_contents($logFile, "Handling OPTIONS request\n", FILE_APPEND);
    }
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

try {
    require_once __DIR__ . "/inc_blogsModel.php";
} catch (Exception $e) {
    if (is_dir($logDir) && is_writable($logDir)) {
        file_put_contents($logFile, "Error loading inc_blogsModel.php: " . $e->getMessage() . "\n", FILE_APPEND);
    }
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: Unable to load blogs model"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = isset($_GET['userId']) ? (int)$_GET['userId'] : null;

    if (is_dir($logDir) && is_writable($logDir)) {
        file_put_contents($logFile, "Fetching blogs for userId: " . ($userId ?? 'all') . "\n", FILE_APPEND);
    }

    try {
        $blogsModel = new BlogsModel();
        $result = $blogsModel->getBlogs($userId);

        if (is_dir($logDir) && is_writable($logDir)) {
            file_put_contents($logFile, "getBlogs result: " . json_encode($result) . "\n", FILE_APPEND);
        }

        if (!is_array($result) || !isset($result['success'])) {
            if (is_dir($logDir) && is_writable($logDir)) {
                file_put_contents($logFile, "getBlogs: Invalid result format\n", FILE_APPEND);
            }
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Server error: Invalid database response"]);
            exit;
        }

        if ($result['success']) {
            http_response_code(200);
            echo json_encode($result);
        } else {
            http_response_code(400);
            echo json_encode($result);
        }
    } catch (Exception $e) {
        if (is_dir($logDir) && is_writable($logDir)) {
            file_put_contents($logFile, "Exception in getBlogs: " . $e->getMessage() . "\n", FILE_APPEND);
        }
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Server error: " . $e->getMessage()]);
    }
    exit;
}

if (is_dir($logDir) && is_writable($logDir)) {
    file_put_contents($logFile, "Invalid Method: " . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);
}
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
exit;
?>