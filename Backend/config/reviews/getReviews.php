<?php
// backend/config/reviews/getReviews.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

file_put_contents(__DIR__ . "/../logs/debug.log", "getReviews API Started - Method: " . $_SERVER['REQUEST_METHOD'] . " at " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    file_put_contents(__DIR__ . "/../logs/debug.log", "Handling OPTIONS request\n", FILE_APPEND);
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

try {
    require_once __DIR__ . "/inc_reviewModel.php";
} catch (Exception $e) {
    file_put_contents(__DIR__ . "/../logs/debug.log", "Error loading inc_reviewModel.php: " . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: Unable to load review model"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $userId = isset($_GET['user_id']) ? $_GET['user_id'] : '';

    if (empty($userId) || !is_numeric($userId)) {
        file_put_contents(__DIR__ . "/../logs/debug.log", "Invalid or missing user_id: " . $userId . "\n", FILE_APPEND);
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Valid numeric user_id is required"]);
        exit;
    }

    $userId = (int)$userId;
    file_put_contents(__DIR__ . "/../logs/debug.log", "Fetching reviews for user_id: $userId\n", FILE_APPEND);

    try {
        $reviewModel = new ReviewModel();
        $result = $reviewModel->getUserReviews($userId);

        file_put_contents(__DIR__ . "/../logs/debug.log", "getUserReviews result: " . json_encode($result) . "\n", FILE_APPEND);

        if ($result['success']) {
            if (empty($result['data'])) {
                file_put_contents(__DIR__ . "/../logs/debug.log", "No reviews found for user_id: $userId\n", FILE_APPEND);
                http_response_code(200);
                echo json_encode(["success" => true, "data" => [], "message" => "No reviews found"]);
            } else {
                file_put_contents(__DIR__ . "/../logs/debug.log", "Reviews fetched successfully for user_id: $userId\n", FILE_APPEND);
                http_response_code(200);
                echo json_encode($result);
            }
        } else {
            file_put_contents(__DIR__ . "/../logs/debug.log", "Error fetching reviews for user_id: $userId - " . json_encode($result) . "\n", FILE_APPEND);
            http_response_code(500);
            echo json_encode($result);
        }
    } catch (Exception $e) {
        file_put_contents(__DIR__ . "/../logs/debug.log", "Exception in getReviews: " . $e->getMessage() . "\n", FILE_APPEND);
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