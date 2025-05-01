<?php
// Path: Wanderlusttrails/Backend/config/reviews/getComments.php
// Retrieves all comments for a review via GET request, returns JSON response.

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once __DIR__ . "/../inc_logger.php";

Logger::log("getComments API Started - Method: {$_SERVER['REQUEST_METHOD']}");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Logger::log("Handling OPTIONS request for getComments");
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

$reviewId = isset($_GET['reviewId']) ? $_GET['reviewId'] : '';
Logger::log("Received reviewId: " . ($reviewId ?: 'none'));

if (empty($reviewId) || !is_numeric($reviewId)) {
    Logger::log("Invalid or missing reviewId: " . ($reviewId ?: 'none'));
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Valid numeric reviewId is required"]);
    exit;
}

$reviewId = (int)$reviewId;
Logger::log("Fetching comments for reviewId: $reviewId");

try {
    $reviewModel = new ReviewModel();
    $result = $reviewModel->getComments($reviewId);

    Logger::log("getComments result: " . json_encode([
        'success' => $result['success'],
        'message' => $result['message'] ?? 'N/A',
        'data_count' => count($result['data'] ?? [])
    ]));

    http_response_code($result['success'] ? 200 : 500);
    echo json_encode($result);
} catch (Exception $e) {
    Logger::log("Exception in getComments: {$e->getMessage()}");
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server error: {$e->getMessage()}"]);
}
exit;
?>