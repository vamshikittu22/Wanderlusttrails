<?php
//path: Backend/config/reviews/getAllReviews.php
// Retrieves user reviews from the database via GET request, returns JSON response.

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php";

Logger::log("getUserReviews API Started - Method: {$_SERVER['REQUEST_METHOD']}");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for getUserReviews");
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

try {
    require_once __DIR__ . "/inc_reviewModel.php";
} catch (Exception $e) {
    Logger::log("Error loading inc_reviewModel.php: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: Unable to load review model"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Logger::log("Invalid Method: {$_SERVER['REQUEST_METHOD']}");
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$userId = isset($_GET['user_id']) ? $_GET['user_id'] : '';
Logger::log("Received user_id: " . ($userId ?: 'none'));

if (empty($userId) || !is_numeric($userId)) {
    Logger::log("Invalid or missing user_id: " . ($userId ?: 'none'));
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Valid numeric user_id is required"]);
    exit;
}

$userId = (int)$userId;
Logger::log("Fetching reviews for user_id: $userId");

try {
    $reviewModel = new ReviewModel();
    $result = $reviewModel->getUserReviews($userId);

    Logger::log("getUserReviews result: " . json_encode([
        'success' => $result['success'],
        'message' => $result['message'] ?? 'N/A',
        'data_count' => count($result['data'] ?? [])
    ]));

    http_response_code($result['success'] ? 200 : 500);
    echo json_encode($result);
} catch (Exception $e) {
    Logger::log("Exception in getUserReviews: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: {$e->getMessage()}"]);
}
exit;
?>