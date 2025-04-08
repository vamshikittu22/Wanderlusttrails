<?php
// backend/config/reviews/writeReview.php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

file_put_contents(__DIR__ . "/../logs/debug.log", "writeReview API Started - Method: " . $_SERVER['REQUEST_METHOD'] . " at " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    file_put_contents(__DIR__ . "/../logs/debug.log", "Handling OPTIONS request\n", FILE_APPEND);
    http_response_code(200);
    echo json_encode(["message" => "OPTIONS request successful"]);
    exit;
}

require_once __DIR__ . "/inc_reviewModel.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data) {
        file_put_contents(__DIR__ . "/../logs/debug.log", "Invalid JSON input: " . file_get_contents("php://input") . "\n", FILE_APPEND);
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid or missing JSON data"]);
        exit;
    }

    $userId = $data['userId'] ?? '';
    $bookingId = $data['bookingId'] ?? '';
    $rating = $data['rating'] ?? '';
    $title = $data['title'] ?? '';
    $review = $data['review'] ?? '';

    file_put_contents(__DIR__ . "/../logs/debug.log", "Received data: " . json_encode($data) . "\n", FILE_APPEND);

    $reviewModel = new ReviewModel();
    $result = $reviewModel->writeReview($userId, $bookingId, $rating, $title, $review);

    file_put_contents(__DIR__ . "/../logs/debug.log", "writeReview result: " . json_encode($result) . "\n", FILE_APPEND);

    if ($result['success']) {
        http_response_code(201);
        echo json_encode($result);
    } else {
        http_response_code(400);
        echo json_encode($result);
    }
    exit;
}

file_put_contents(__DIR__ . "/../logs/debug.log", "Invalid Method: " . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);
http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
exit;
?>